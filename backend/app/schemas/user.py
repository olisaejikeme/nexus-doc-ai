from pydantic import BaseModel, EmailStr

from app.schemas.base_schema import ORMBaseModel


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserResponse(ORMBaseModel):
    id: int
    name: str
    email: EmailStr

class UserUpdate(ORMBaseModel):
    name: str
    email: EmailStr
