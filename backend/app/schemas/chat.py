from app.schemas.base_schema import ORMBaseModel

class ChatRequest(ORMBaseModel):
    question: str
    session_id: int | None = None