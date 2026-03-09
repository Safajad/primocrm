from fastapi import FastAPI, APIRouter, HTTPException, Query, Request, Response, Cookie
from fastapi.responses import PlainTextResponse, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# OpenAI API Key
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

# Meta Webhook Verify Token
META_VERIFY_TOKEN = os.environ.get('META_VERIFY_TOKEN', 'primocrm2026')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Chat Models
class ChatMessage(BaseModel):
    role: str
    content: str

class ContactInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    systemPrompt: Optional[str] = None
    model: str = "gpt-3.5-turbo"
    temperature: float = 0.7
    contactInfo: Optional[ContactInfo] = None
    sessionId: Optional[str] = None
    apiKey: Optional[str] = None

class ChatResponse(BaseModel):
    id: str
    role: str
    content: str
    parts: List[Dict[str, Any]]

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# AI Chat Route
@api_router.post("/ai/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Chat endpoint for AI chatbot integration with OpenAI.
    Supports GPT-3.5-turbo, GPT-4, and GPT-4-turbo models.
    """
    # Use provided API key or fall back to environment variable
    api_key = request.apiKey or OPENAI_API_KEY
    
    if not api_key:
        raise HTTPException(status_code=400, detail="API Key nao configurada. Configure sua chave OpenAI.")
    
    # Map models to OpenAI model names
    model_map = {
        "gpt-5.2": "gpt-5.2",
        "gpt-5.1": "gpt-5.1",
        "gpt-4o": "gpt-4o",
        "gpt-4": "gpt-4",
        "openai/gpt-5.2": "gpt-5.2",
        "openai/gpt-4o-mini": "gpt-4o-mini",
        "openai/gpt-4o": "gpt-4o",
        "openai/gpt-4-turbo": "gpt-4",
    }
    
    openai_model = model_map.get(request.model, "gpt-5.2")
    
    # Build system prompt with contact info if available
    system_prompt = request.systemPrompt or "Voce e um assistente prestativo do Primo CRM. Seja profissional e objetivo. Responda em portugues."
    
    if request.contactInfo:
        ci = request.contactInfo
        system_prompt += f"""

Informacoes do contato atual:
- Nome: {ci.name or 'Nao informado'}
- Email: {ci.email or 'Nao informado'}
- Telefone: {ci.phone or 'Nao informado'}
- Empresa: {ci.company or 'Nao informado'}
- Tags: {', '.join(ci.tags) if ci.tags else 'Nenhuma'}
- Notas: {ci.notes or 'Nenhuma'}

Use essas informacoes para personalizar suas respostas quando relevante."""
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Get Emergent LLM Key
        api_key = os.environ.get('EMERGENT_LLM_KEY', '')
        if not api_key:
            raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY nao configurada")
        
        # Initialize chat
        session_id = f"crm-chat-{uuid.uuid4()}"
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_prompt
        ).with_model("openai", openai_model)
        
        # Get the last user message
        last_user_message = ""
        for msg in reversed(request.messages):
            if msg.role == "user":
                last_user_message = msg.content
                break
        
        if not last_user_message:
            raise HTTPException(status_code=400, detail="Nenhuma mensagem do usuario encontrada")
        
        # Send message
        user_message = UserMessage(text=last_user_message)
        response_text = await chat.send_message(user_message)
        
        return ChatResponse(
            id=f"msg-{uuid.uuid4()}",
            role="assistant",
            content=response_text,
            parts=[{"type": "text", "text": response_text}]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

# Chat History Storage
@api_router.post("/ai/chat/history")
async def save_chat_history(session_id: str, messages: List[ChatMessage]):
    """Save chat history to MongoDB for persistence"""
    doc = {
        "session_id": session_id,
        "messages": [msg.model_dump() for msg in messages],
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.chat_histories.update_one(
        {"session_id": session_id},
        {"$set": doc},
        upsert=True
    )
    
    return {"status": "success", "session_id": session_id}

@api_router.get("/ai/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    """Get chat history from MongoDB"""
    history = await db.chat_histories.find_one(
        {"session_id": session_id},
        {"_id": 0}
    )
    
    if not history:
        return {"messages": []}
    
    return history

# Import and include CRM routes
from routes.crm import router as crm_router
from routes.webhooks import router as webhooks_router
api_router.include_router(crm_router)
api_router.include_router(webhooks_router)

# Direct webhook endpoints for Meta (WhatsApp/Instagram)
# These are outside the api_router for maximum compatibility
@app.get("/meta-webhook")
async def verify_meta_webhook_direct(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge")
):
    """Meta webhook verification endpoint - direct route"""
    print(f"META WEBHOOK VERIFY: mode={hub_mode}, token={hub_verify_token}, challenge={hub_challenge}")
    if hub_mode == "subscribe" and hub_verify_token == META_VERIFY_TOKEN:
        print("META WEBHOOK VERIFIED!")
        return PlainTextResponse(content=hub_challenge or "", status_code=200)
    if not hub_mode:
        return PlainTextResponse(content="OK", status_code=200)
    print("META WEBHOOK FAILED!")
    raise HTTPException(status_code=403, detail="Verification failed")

@app.head("/meta-webhook")
async def head_meta_webhook():
    return PlainTextResponse(content="", status_code=200)

@app.post("/meta-webhook")
async def receive_meta_webhook_direct(request_data: dict):
    """Receive Meta webhooks - direct route"""
    print(f"META WEBHOOK RECEIVED: {request_data}")
    return {"status": "ok"}

# ===================== GOOGLE AUTH (Emergent) =====================

class UserModel(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: str

class SessionModel(BaseModel):
    user_id: str
    session_token: str
    expires_at: str
    created_at: str

# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    """Exchange session_id from Emergent Auth for user data and set cookie"""
    try:
        body = await request.json()
        session_id = body.get("session_id")
        
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id is required")
        
        # Call Emergent Auth to get session data
        async with httpx.AsyncClient() as client_http:
            auth_response = await client_http.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id},
                timeout=10.0
            )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        
        auth_data = auth_response.json()
        
        # Extract user data
        email = auth_data.get("email")
        name = auth_data.get("name")
        picture = auth_data.get("picture")
        session_token = auth_data.get("session_token")
        
        if not email or not session_token:
            raise HTTPException(status_code=401, detail="Invalid auth response")
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": email}, {"_id": 0})
        
        if existing_user:
            user_id = existing_user["user_id"]
            # Update user data if needed
            await db.users.update_one(
                {"email": email},
                {"$set": {"name": name, "picture": picture}}
            )
        else:
            # Create new user
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            user_doc = {
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
        
        # Store session
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Delete old sessions for this user
        await db.user_sessions.delete_many({"user_id": user_id})
        await db.user_sessions.insert_one(session_doc)
        
        # Set httpOnly cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60  # 7 days
        )
        
        return {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Auth error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me")
async def get_current_user(request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Get current authenticated user from session cookie or header"""
    
    # Try cookie first, then Authorization header
    token = session_token
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    
    if not session:
        raise HTTPException(status_code=401, detail="Session not found")
    
    # Check expiry with timezone awareness
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(default=None)):
    """Logout and clear session"""
    
    token = session_token
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    
    # Clear cookie
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    
    return {"message": "Logged out successfully"}

# Include the router in the main app - AFTER all route definitions
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()