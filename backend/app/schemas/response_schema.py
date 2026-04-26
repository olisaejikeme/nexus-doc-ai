from typing import TypeVar, Generic

from pydantic import BaseModel, ConfigDict

T = TypeVar('T')

class ResponseSchema(BaseModel, Generic[T]):
    data: T | None = None
    message: str
    status: bool
    status_code: int

    model_config = ConfigDict(extra='ignore')