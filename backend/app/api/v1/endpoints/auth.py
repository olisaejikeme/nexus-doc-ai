from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import verify_password, get_password_hash
from app.models import User
from app.schemas.response_schema import ResponseSchema
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest, ForgotPasswordRequest, PasswordChange
from app.services.auth_service import AuthService
from app.api.deps import get_db, get_current_user
from app.utils.response_utils import ResponseUtils

router = APIRouter()
service = AuthService()

# @router.post("/register", response_model=ResponseSchema[UserResponse])
# def register(data: UserCreate, db: Session = Depends(get_db)):
#     return ResponseUtils.ok("User registered successfully",service.register(db, data))


@router.post("/login", response_model=ResponseSchema[TokenResponse])
def login(data: LoginRequest, db: Session = Depends(get_db)):
    tokens = service.login(db, data)

    token_data = TokenResponse(**tokens)

    return ResponseUtils.ok("User logged in successfully", token_data)

@router.post("/refresh", response_model=ResponseSchema[TokenResponse])
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    tokens = service.refresh_session(db, data.refresh_token)
    token_data = TokenResponse(**tokens)
    return ResponseUtils.ok("Tokens refreshed successfully", token_data)

# @router.post("/forgot-password")
# async def forgot_password(
#     data: ForgotPasswordRequest,
#     background_tasks: BackgroundTasks,
#     db: Session = Depends(get_db)
# ):
#     # result = await service.request_password_reset(db, data.email, background_tasks)
#     # response = result["message"]

#     return ResponseUtils.service_unavailable("This service is currently unavailable")


# @router.post("/change-password")
# async def change_password(
#         data: PasswordChange,
#         current_user: User = Depends(get_current_user),
#         db: Session = Depends(get_db)
# ):
#     # Verify the current password matches what's in the DB
#     if not verify_password(data.current_password, current_user.password_hash):
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="The current password you entered is incorrect."
#         )

#     # Hash the new password and update the user object
#     current_user.password_hash = get_password_hash(data.new_password)

#     # Save to database
#     db.add(current_user)
#     db.commit()
#     db.refresh(current_user)

#     return {"message": "Password updated successfully"}