import os
import cloudinary.uploader
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from app.repositories.document_repository import DocumentRepository
from app.schemas.document import DocumentCreate
from app.services.ai_service import AIService

class DocumentService:
    def __init__(self):
        self.repo = DocumentRepository()
        self.ai_service = AIService()

    async def handle_upload(self, db: Session, user_id: int, file: UploadFile, display_name: str = None):
        # 1. Validation
        extension = file.filename.split(".")[-1].lower()
        if extension not in ["pdf", "docx"]:
            raise HTTPException(status_code=400, detail="Only PDF and DOCX allowed.")

        # 2. Cloudinary Upload (Physical Storage)
        try:
            upload_result = cloudinary.uploader.upload(
                file.file,
                folder=f"nexus/documents/{user_id}",
                resource_type="raw"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Cloudinary failed: {str(e)}")

        # 3. AI Indexing (Vector Storage)
        # We need a local path for the PDFLoader
        temp_path = f"temp_{user_id}_{file.filename}"
        try:
            # We must re-read the file because cloudinary.upload might have consumed the stream
            # or use the secure_url if the loader supports it, but local temp is safer for RAG
            with open(temp_path, "wb") as f:
                # Seek to start in case previous operations moved the pointer
                file.file.seek(0)
                f.write(await file.read())
            
            await self.ai_service.process_and_index(temp_path)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

        # 4. DB Metadata Storage
        document_payload = DocumentCreate(
            name=display_name if display_name else file.filename,
            file_type=extension.upper(),
            file_url=upload_result['secure_url']
        )
        
        return self.repo.create(db, user_id, document_payload)

    def get_documents(self, db: Session, user_id: int):
        return self.repo.get_all_by_user(db, user_id)

    def delete_document(self, db: Session, document_id: int, user_id: int):
        document = self.repo.get_by_id_and_user(db, document_id, user_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        self.repo.delete(db, document) # Or soft_delete if your repo supports it