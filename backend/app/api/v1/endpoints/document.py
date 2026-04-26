from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import get_db, get_current_user
from app.schemas.response_schema import ResponseSchema
from app.schemas.document import DocumentCreate, DocumentResponse
from app.services.document_service import DocumentService
from app.utils.response_utils import ResponseUtils

router = APIRouter()
service = DocumentService()

@router.post("/upload", response_model=ResponseSchema[DocumentResponse])
async def upload_document(
    file: UploadFile = File(...),
    display_name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    data = await service.handle_upload(db, current_user.id, file, display_name)
    return ResponseUtils.ok("Document indexed and uploaded", data)

@router.get("", response_model=ResponseSchema[List[DocumentResponse]])
def get_documents(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    data = service.get_documents(db, current_user.id)
    return ResponseUtils.ok("Documents fetched", data)

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service.delete_document(db, document_id, current_user.id)
    return ResponseUtils.ok("Document removed")