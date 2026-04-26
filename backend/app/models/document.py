from datetime import datetime
from sqlalchemy import Integer, String, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql.functions import func
from app.db.base import Base

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    
    name: Mapped[str] = mapped_column(String, nullable=False) # e.g. "Employee_Handbook.pdf"
    file_type: Mapped[str] = mapped_column(String, nullable=False) # e.g. "PDF"
    file_url: Mapped[str] = mapped_column(String, nullable=False) # Cloudinary URL
    status: Mapped[str] = mapped_column(String, default="Indexed") 
    
    uploaded_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="documents")