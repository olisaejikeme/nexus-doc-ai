from sqlalchemy.orm import Session

from app.enums.user_status import UserStatus
from app.models.user import User


class UserRepository:

    def get_by_email(self, db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    def create(self, db: Session, name: str, email: str, password_hash: str, role_id: int):
        user = User(
            name=name,
            email=email,
            password_hash=password_hash,
            status=UserStatus.ACTIVE,
            role_id=role_id
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def get_by_id(self, db: Session, user_id: str):
        return db.query(User).filter(User.id == user_id).first()