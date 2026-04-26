from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.response_schema import ResponseSchema
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.utils.response_utils import ResponseUtils

router = APIRouter()


@router.patch("/me", response_model=ResponseSchema[UserResponse])
def update_user_profile(
        user_update: UserUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    if user_update.email:
        email_exists = db.query(User).filter(User.email == user_update.email).first()
        if email_exists and email_exists.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_update.email

    if user_update.name:
        current_user.name = user_update.name

    db.commit()
    db.refresh(current_user)
    return ResponseUtils.ok("User updated successfully", current_user)

@router.get("/me", response_model=ResponseSchema[UserResponse])
def get_user_me(
    current_user: User = Depends(get_current_user)
):
    """Fetch the currently authenticated user's profile info"""
    return ResponseUtils.ok("User fetched successfully", current_user)

