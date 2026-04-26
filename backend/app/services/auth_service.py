from jose import jwt, JWTError
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.email import send_reset_email
from app.models import Role, User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate
from app.schemas.auth import LoginRequest
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    SECRET_KEY,
    ALGORITHM, create_password_reset_token
)

from fastapi import BackgroundTasks

from configs.settings import settings

class AuthService:

    def __init__(self):
        self.repo = UserRepository()

    def register(self, db: Session, data: UserCreate):
        existing_user = self.repo.get_by_email(db, str(data.email))

        if existing_user:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")

        user_role = db.query(Role).filter(Role.name == "USER").first()

        if not user_role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Default role not found")

        password_hash = hash_password(data.password)

        role_id = user_role.id

        user = self.repo.create(
            db,
            name=data.name,
            email=str(data.email),
            password_hash=password_hash,
            role_id=role_id # type: ignore
        )

        return user

    def login(self, db: Session, data: LoginRequest):
        user = self.repo.get_by_email(db, str(data.email))

        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        payload = {"sub": str(user.id)}
        access_token = create_access_token(payload)
        refresh_token = create_refresh_token()

        user.refresh_token = refresh_token
        db.commit()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token
        }

    def refresh_session(self, db: Session, refresh_token: str):
        # Find user by the stored token
        user = db.query(User).filter(User.refresh_token == refresh_token).first()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        # Rotate tokens
        new_access = create_access_token({"sub": str(user.id)})
        new_refresh = create_refresh_token()

        user.refresh_token = new_refresh
        db.commit()

        return {
            "access_token": new_access,
            "refresh_token": new_refresh
        }

    async def request_password_reset(self, db: Session, email: str, background_tasks: BackgroundTasks):
        user = db.query(User).filter(User.email == email).first()

        if user:
            token = create_password_reset_token(user.email)
            # Add the email sending to the background queue
            background_tasks.add_task(send_reset_email, user.email, token)

        return {"message": "If an account exists, a reset link has been sent."}

    def reset_password(self, db: Session, token: str, new_password: str):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("action") != "password_reset":
                raise HTTPException(status_code=400, detail="Invalid token scope")

            email = payload.get("sub")
            user = self.repo.get_by_email(db, email)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            user.password_hash = hash_password(new_password)
            # Force logout by clearing the refresh token
            user.refresh_token = None
            db.commit()
        except JWTError:
            raise HTTPException(status_code=400, detail="Token expired or invalid")

