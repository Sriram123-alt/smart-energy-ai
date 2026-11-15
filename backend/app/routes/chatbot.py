from fastapi import APIRouter
from pydantic import BaseModel
from app.services.chatbot_service import ChatbotService

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

class ChatRequest(BaseModel):
    query: str

@router.post("")
def chat(req: ChatRequest):
    return ChatbotService.get_ai_response(req.query)
