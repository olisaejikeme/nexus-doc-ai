from pydantic import BaseModel
from datetime import datetime
from app.schemas.base_schema import ORMBaseModel

class DocumentBase(BaseModel):
    name: str
    file_type: str
    file_url: str

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(ORMBaseModel):
    id: int
    name: str
    file_type: str
    file_url: str
    status: str
    uploaded_at: datetime