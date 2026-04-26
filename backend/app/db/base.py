from datetime import datetime

from sqlalchemy import String, func, TIMESTAMP, Boolean
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    __abstract__ = True

    created_by: Mapped[str] = mapped_column(String(50), nullable=False, default="SYSTEM", server_default="SYSTEM")
    modified_by: Mapped[str] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    modified_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), onupdate=func.now(), nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")