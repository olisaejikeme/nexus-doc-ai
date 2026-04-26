from fastapi import APIRouter

from app.api.v1.endpoints import auth, document, user, chat

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(document.router,prefix="/documents",tags=["Documents"])
api_router.include_router(user.router,prefix="/users",tags=["Users"])
api_router.include_router(chat.router,prefix="/chats",tags=["Chats"])