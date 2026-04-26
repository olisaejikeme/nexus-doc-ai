from sqlalchemy.orm import Session
from app.models.document import Document
from app.repositories.base_repository import BaseRepository
from app.schemas.document import DocumentCreate


class DocumentRepository(BaseRepository):

    def __init__(self):
        super().__init__(Document)

    def create(self, db: Session, user_id: int, data: DocumentCreate):
        document = Document(
            user_id=user_id,
            **data.model_dump()
        )

        if hasattr(document, 'created_by'):
            document.created_by = user_id

        db.add(document)
        db.commit()
        db.refresh(document)
        return document

    def get_all_by_user(self, db: Session, user_id: int):
        return self.get_query(db).filter(
            Document.user_id == user_id
        ).all()

    def get_by_id_and_user(self, db: Session, document_id: int, user_id: int):
        return self.get_query(db).filter(
            Document.id == document_id,
            Document.user_id == user_id
        ).first()