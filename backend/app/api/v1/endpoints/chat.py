from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import get_db, get_current_user
from app.schemas.response_schema import ResponseSchema
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import ChatRequest
from app.services.document_service import DocumentService
from app.utils.response_utils import ResponseUtils
from app.services.ai_service import AIService

router = APIRouter()
service = DocumentService()
ai_service = AIService()

@router.post("")
async def chat(
    payload: ChatRequest, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    session_id = payload.session_id

    # 1. Create a new session if one doesn't exist
    if not session_id:
        new_session = ChatSession(user_id=current_user.id, title=payload.question[:30])
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        session_id = new_session.id

    # 2. Save User Message
    user_msg = ChatMessage(session_id=session_id, role="user", content=payload.question)
    db.add(user_msg)
    db.commit()

    # Fetch existing history (including the user message we just added)
    existing_messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()

    history_data = [
        {"role": msg.role, "content": msg.content} 
        for msg in existing_messages
    ]

    # 3. Get AI Response
    ai_response = await ai_service.chat(payload.question, history=history_data)
    
    # 4. SAVE THE AI RESPONSE TO DATABASE (THIS IS MISSING!)
    assistant_msg = ChatMessage(
        session_id=session_id, 
        role="assistant", 
        content=ai_response["answer"]
    )
    db.add(assistant_msg)
    db.commit()  # Commit again to save the AI response

    return ResponseUtils.ok(
        message="Response generated and saved",
        data={
            "answer": ai_response["answer"],
            "sources": ai_response.get("sources", []),
            "session_id": session_id
        },
    )

@router.get("/sessions")
async def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Fetch all chat sessions for the current user"""
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.created_at.desc()).all()
    
    return ResponseUtils.ok(message="Chats fetched successfully", data=sessions)

@router.get("/sessions/{session_id}")
async def get_session_details(
    session_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Fetch all messages for a specific session"""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        return ResponseUtils.not_found(message="Session not found", status_code=404)

    return ResponseUtils.ok(
        message="Chats fetched successfully", 
        data={
        "id": session.id,
        "title": session.title,
        "messages": session.messages
    })