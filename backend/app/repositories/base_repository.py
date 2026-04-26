from sqlalchemy.orm import Session
from sqlalchemy import false


class BaseRepository:

    def __init__(self, model):
        self.model = model

    def get_query(self, db: Session):
        return db.query(self.model).filter(self.model.is_deleted == false())

    def get_all(self, db: Session):
        return self.get_query(db).all()

    def get_by_id(self, db: Session, obj_id: int):
        return self.get_query(db).filter(self.model.id == obj_id).first()

    def soft_delete(self, db: Session, obj):
        obj.is_deleted = True
        db.commit()