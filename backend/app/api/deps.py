from fastapi import Depends, HTTPException, Security, status
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.db.session import SessionLocal
from app.models.user import User
from configs.settings import settings

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

security_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security_scheme), db: Session = Depends(get_db)) -> User:
    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user