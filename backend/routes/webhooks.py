# WhatsApp & Instagram Webhook Routes - /app/backend/routes/webhooks.py
from fastapi import APIRouter, HTTPException, Request, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid
import os
import httpx
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

# Get MongoDB db from main server
def get_db():
    from server import db
    return db

# Verification token for Meta webhooks (you can change this)
VERIFY_TOKEN = os.environ.get('META_VERIFY_TOKEN', 'primocrm2026')

# Meta API credentials
META_ACCESS_TOKEN = os.environ.get('META_ACCESS_TOKEN', '')
WHATSAPP_PHONE_NUMBER_ID = os.environ.get('WHATSAPP_PHONE_NUMBER_ID', '')
INSTAGRAM_ACCOUNT_ID = os.environ.get('INSTAGRAM_ACCOUNT_ID', '')

# ===================== WHATSAPP WEBHOOK =====================

@router.get("/whatsapp")
@router.head("/whatsapp")
async def verify_whatsapp_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge")
):
    """
    Webhook verification endpoint for WhatsApp Business API.
    Meta will call this to verify your webhook URL.
    """
    logger.info(f"WhatsApp webhook verification: mode={hub_mode}, token={hub_verify_token}")
    
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        logger.info("WhatsApp webhook verified successfully!")
        # Return challenge as plain text (Meta requires this format)
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse(content=hub_challenge or "", status_code=200)
    
    # For HEAD requests or if no mode/token, just return 200
    if not hub_mode and not hub_verify_token:
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse(content="", status_code=200)
    
    logger.warning("WhatsApp webhook verification failed!")
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/whatsapp")
async def receive_whatsapp_webhook(request: Request):
    """
    Receive incoming WhatsApp messages and status updates.
    """
    try:
        body = await request.json()
        logger.info(f"WhatsApp webhook received: {body}")
        
        db = get_db()
        
        # Process the webhook payload
        if "entry" in body:
            for entry in body["entry"]:
                for change in entry.get("changes", []):
                    value = change.get("value", {})
                    
                    # Handle incoming messages
                    if "messages" in value:
                        for message in value["messages"]:
                            await process_whatsapp_message(db, value, message)
                    
                    # Handle message status updates
                    if "statuses" in value:
                        for status in value["statuses"]:
                            await process_whatsapp_status(db, status)
        
        return {"status": "ok"}
    
    except Exception as e:
        logger.error(f"Error processing WhatsApp webhook: {str(e)}")
        return {"status": "error", "message": str(e)}


async def process_whatsapp_message(db, value: dict, message: dict):
    """Process an incoming WhatsApp message"""
    try:
        phone_number = message.get("from", "")
        message_id = message.get("id", "")
        timestamp = message.get("timestamp", "")
        message_type = message.get("type", "text")
        
        # Get contact info
        contacts = value.get("contacts", [])
        contact_name = contacts[0].get("profile", {}).get("name", "") if contacts else ""
        
        # Extract message content based on type
        content = ""
        if message_type == "text":
            content = message.get("text", {}).get("body", "")
        elif message_type == "image":
            content = "[Imagem recebida]"
        elif message_type == "audio":
            content = "[Audio recebido]"
        elif message_type == "video":
            content = "[Video recebido]"
        elif message_type == "document":
            content = "[Documento recebido]"
        elif message_type == "location":
            content = "[Localizacao recebida]"
        elif message_type == "button":
            content = message.get("button", {}).get("text", "[Botao clicado]")
        elif message_type == "interactive":
            interactive = message.get("interactive", {})
            if "button_reply" in interactive:
                content = interactive["button_reply"].get("title", "[Resposta de botao]")
            elif "list_reply" in interactive:
                content = interactive["list_reply"].get("title", "[Item de lista selecionado]")
        
        # Store in database
        doc = {
            "id": str(uuid.uuid4()),
            "platform": "whatsapp",
            "external_id": message_id,
            "phone": phone_number,
            "contact_name": contact_name,
            "message_type": message_type,
            "content": content,
            "direction": "incoming",
            "raw_data": message,
            "received_at": datetime.now(timezone.utc).isoformat(),
            "timestamp": timestamp
        }
        
        await db.whatsapp_messages.insert_one(doc)
        logger.info(f"WhatsApp message stored: {phone_number} - {content[:50]}")
        
        # Try to find or create contact
        await find_or_create_contact(db, phone_number, contact_name, "whatsapp")
        
    except Exception as e:
        logger.error(f"Error processing WhatsApp message: {str(e)}")


async def process_whatsapp_status(db, status: dict):
    """Process WhatsApp message status update"""
    try:
        message_id = status.get("id", "")
        status_value = status.get("status", "")  # sent, delivered, read, failed
        timestamp = status.get("timestamp", "")
        recipient = status.get("recipient_id", "")
        
        # Update message status in database
        await db.whatsapp_messages.update_one(
            {"external_id": message_id},
            {"$set": {
                "status": status_value,
                "status_updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        logger.info(f"WhatsApp status updated: {message_id} -> {status_value}")
        
    except Exception as e:
        logger.error(f"Error processing WhatsApp status: {str(e)}")


# ===================== INSTAGRAM WEBHOOK =====================

@router.get("/instagram")
async def verify_instagram_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge")
):
    """
    Webhook verification endpoint for Instagram Messaging API.
    """
    logger.info(f"Instagram webhook verification: mode={hub_mode}, token={hub_verify_token}")
    
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        logger.info("Instagram webhook verified successfully!")
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse(content=hub_challenge, status_code=200)
    
    logger.warning("Instagram webhook verification failed!")
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/instagram")
async def receive_instagram_webhook(request: Request):
    """
    Receive incoming Instagram messages and events.
    """
    try:
        body = await request.json()
        logger.info(f"Instagram webhook received: {body}")
        
        db = get_db()
        
        # Process the webhook payload
        if "entry" in body:
            for entry in body["entry"]:
                # Handle messaging events
                if "messaging" in entry:
                    for messaging in entry["messaging"]:
                        await process_instagram_message(db, messaging)
                
                # Handle other events (comments, mentions, etc.)
                if "changes" in entry:
                    for change in entry["changes"]:
                        await process_instagram_change(db, change)
        
        return {"status": "ok"}
    
    except Exception as e:
        logger.error(f"Error processing Instagram webhook: {str(e)}")
        return {"status": "error", "message": str(e)}


async def process_instagram_message(db, messaging: dict):
    """Process an incoming Instagram message"""
    try:
        sender_id = messaging.get("sender", {}).get("id", "")
        recipient_id = messaging.get("recipient", {}).get("id", "")
        timestamp = messaging.get("timestamp", "")
        
        message = messaging.get("message", {})
        message_id = message.get("mid", "")
        content = message.get("text", "")
        
        # Handle attachments
        attachments = message.get("attachments", [])
        if attachments and not content:
            attachment_type = attachments[0].get("type", "unknown")
            content = f"[{attachment_type.capitalize()} recebido]"
        
        # Store in database
        doc = {
            "id": str(uuid.uuid4()),
            "platform": "instagram",
            "external_id": message_id,
            "sender_id": sender_id,
            "recipient_id": recipient_id,
            "content": content,
            "direction": "incoming",
            "raw_data": messaging,
            "received_at": datetime.now(timezone.utc).isoformat(),
            "timestamp": timestamp
        }
        
        await db.instagram_messages.insert_one(doc)
        logger.info(f"Instagram message stored: {sender_id} - {content[:50]}")
        
        # Try to find or create contact
        await find_or_create_contact(db, sender_id, "", "instagram")
        
    except Exception as e:
        logger.error(f"Error processing Instagram message: {str(e)}")


async def process_instagram_change(db, change: dict):
    """Process Instagram change events (comments, mentions, etc.)"""
    try:
        field = change.get("field", "")
        value = change.get("value", {})
        
        doc = {
            "id": str(uuid.uuid4()),
            "platform": "instagram",
            "event_type": field,
            "data": value,
            "received_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.instagram_events.insert_one(doc)
        logger.info(f"Instagram event stored: {field}")
        
    except Exception as e:
        logger.error(f"Error processing Instagram change: {str(e)}")


# ===================== HELPER FUNCTIONS =====================

async def find_or_create_contact(db, identifier: str, name: str, channel: str):
    """Find existing contact or create a new one"""
    try:
        # Search for existing contact
        existing = None
        if channel == "whatsapp":
            existing = await db.contacts.find_one({"phone": identifier})
        elif channel == "instagram":
            existing = await db.contacts.find_one({"instagram_id": identifier})
        
        if not existing:
            # Create new contact
            new_contact = {
                "id": str(uuid.uuid4()),
                "company_id": "default-company",
                "name": name or f"Lead {channel.capitalize()}",
                "phone": identifier if channel == "whatsapp" else None,
                "instagram_id": identifier if channel == "instagram" else None,
                "status": "lead",
                "source": channel,
                "tags": [channel],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.contacts.insert_one(new_contact)
            logger.info(f"New contact created from {channel}: {identifier}")
        
    except Exception as e:
        logger.error(f"Error finding/creating contact: {str(e)}")


# ===================== SEND MESSAGE ENDPOINTS =====================

@router.post("/whatsapp/send")
async def send_whatsapp_message(
    to: str,
    message: str,
    message_type: str = "text"
):
    """Send a WhatsApp message using the Cloud API"""
    if not META_ACCESS_TOKEN or not WHATSAPP_PHONE_NUMBER_ID:
        raise HTTPException(status_code=400, detail="WhatsApp API not configured")
    
    try:
        url = f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"
        
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {"body": message}
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers={
                    "Authorization": f"Bearer {META_ACCESS_TOKEN}",
                    "Content-Type": "application/json"
                },
                json=payload
            )
            
            if response.status_code != 200:
                logger.error(f"WhatsApp send error: {response.text}")
                raise HTTPException(status_code=response.status_code, detail=response.text)
            
            result = response.json()
            
            # Store sent message
            db = get_db()
            doc = {
                "id": str(uuid.uuid4()),
                "platform": "whatsapp",
                "external_id": result.get("messages", [{}])[0].get("id", ""),
                "phone": to,
                "content": message,
                "direction": "outgoing",
                "status": "sent",
                "sent_at": datetime.now(timezone.utc).isoformat()
            }
            await db.whatsapp_messages.insert_one(doc)
            
            return {"status": "sent", "message_id": doc["external_id"]}
            
    except Exception as e:
        logger.error(f"Error sending WhatsApp message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/instagram/send")
async def send_instagram_message(
    recipient_id: str,
    message: str
):
    """Send an Instagram direct message"""
    if not META_ACCESS_TOKEN or not INSTAGRAM_ACCOUNT_ID:
        raise HTTPException(status_code=400, detail="Instagram API not configured")
    
    try:
        url = f"https://graph.facebook.com/v18.0/{INSTAGRAM_ACCOUNT_ID}/messages"
        
        payload = {
            "recipient": {"id": recipient_id},
            "message": {"text": message}
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers={
                    "Authorization": f"Bearer {META_ACCESS_TOKEN}",
                    "Content-Type": "application/json"
                },
                json=payload
            )
            
            if response.status_code != 200:
                logger.error(f"Instagram send error: {response.text}")
                raise HTTPException(status_code=response.status_code, detail=response.text)
            
            result = response.json()
            
            # Store sent message
            db = get_db()
            doc = {
                "id": str(uuid.uuid4()),
                "platform": "instagram",
                "external_id": result.get("message_id", ""),
                "recipient_id": recipient_id,
                "content": message,
                "direction": "outgoing",
                "status": "sent",
                "sent_at": datetime.now(timezone.utc).isoformat()
            }
            await db.instagram_messages.insert_one(doc)
            
            return {"status": "sent", "message_id": doc["external_id"]}
            
    except Exception as e:
        logger.error(f"Error sending Instagram message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== GET MESSAGES =====================

@router.get("/whatsapp/messages")
async def get_whatsapp_messages(limit: int = 50):
    """Get recent WhatsApp messages"""
    db = get_db()
    messages = await db.whatsapp_messages.find(
        {}, {"_id": 0}
    ).sort("received_at", -1).limit(limit).to_list(limit)
    return messages


@router.get("/instagram/messages")
async def get_instagram_messages(limit: int = 50):
    """Get recent Instagram messages"""
    db = get_db()
    messages = await db.instagram_messages.find(
        {}, {"_id": 0}
    ).sort("received_at", -1).limit(limit).to_list(limit)
    return messages



# ===================== WHATSAPP UNOFFICIAL (whatsapp-web.js) =====================

WHATSAPP_SERVICE_URL = os.environ.get('WHATSAPP_SERVICE_URL', 'http://localhost:3001')

class WhatsAppWebhookEvent(BaseModel):
    event: str
    sessionId: str
    qrCode: Optional[str] = None
    phoneNumber: Optional[str] = None
    from_: Optional[str] = None
    to: Optional[str] = None
    body: Optional[str] = None
    timestamp: Optional[int] = None
    isGroup: Optional[bool] = None
    hasMedia: Optional[bool] = None
    type: Optional[str] = None
    reason: Optional[str] = None
    contactName: Optional[str] = None
    contactNumber: Optional[str] = None
    companyId: Optional[str] = None
    chatId: Optional[str] = None
    unreadCount: Optional[int] = None
    lastMessage: Optional[Dict[str, Any]] = None
    messages: Optional[List[Dict[str, Any]]] = None
    messageId: Optional[str] = None

    class Config:
        populate_by_name = True
        extra = "allow"

class SendMessageRequest(BaseModel):
    sessionId: str
    to: str
    message: str

# Webhook endpoint to receive events from whatsapp-web.js service
@router.post("/whatsapp-unofficial")
async def receive_whatsapp_unofficial_webhook(request: Request):
    """Receive events from whatsapp-web.js service"""
    db = get_db()
    
    try:
        data = await request.json()
        event_type = data.get('event', '')
        session_id = data.get('sessionId', '')
        company_id = data.get('companyId', 'default-company')
        
        logger.info(f"WhatsApp Unofficial Event: {event_type} - Session: {session_id}")
        
        if event_type == "message":
            # Get message details
            from_number = data.get('from', '').replace('@c.us', '').replace('@g.us', '')
            contact_name = data.get('contactName', from_number)
            body = data.get('body', '')
            timestamp = data.get('timestamp')
            message_id = data.get('messageId', str(uuid.uuid4()))
            
            # Skip empty messages
            if not body:
                return {"success": True, "skipped": True}
            
            # Find or create contact
            contact = await db.contacts.find_one({
                "company_id": company_id,
                "$or": [
                    {"phone": {"$regex": from_number[-10:]}},
                    {"whatsapp_id": from_number}
                ]
            })
            
            if not contact:
                contact = {
                    "id": str(uuid.uuid4()),
                    "company_id": company_id,
                    "name": contact_name,
                    "phone": from_number,
                    "whatsapp_id": from_number,
                    "email": None,
                    "company": None,
                    "position": None,
                    "avatar": contact_name[:2].upper() if contact_name else "WA",
                    "status": "lead",
                    "source": "whatsapp",
                    "tags": ["whatsapp"],
                    "notes": [],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                await db.contacts.insert_one(contact)
                logger.info(f"Novo contato criado: {contact_name} ({from_number})")
            
            contact_id = contact['id']
            
            # Find or create conversation
            conversation = await db.conversations.find_one({
                "company_id": company_id,
                "contact_id": contact_id,
                "channel": "whatsapp"
            })
            
            if not conversation:
                conversation = {
                    "id": str(uuid.uuid4()),
                    "company_id": company_id,
                    "contact_id": contact_id,
                    "channel": "whatsapp",
                    "status": "open",
                    "unread_count": 1,
                    "last_message": body[:100],
                    "last_message_time": datetime.now(timezone.utc).isoformat(),
                    "responsible_id": None,
                    "session_id": session_id,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                await db.conversations.insert_one(conversation)
                logger.info(f"Nova conversa criada para {contact_name}")
            else:
                # Update existing conversation
                await db.conversations.update_one(
                    {"id": conversation['id']},
                    {"$set": {
                        "last_message": body[:100],
                        "last_message_time": datetime.now(timezone.utc).isoformat(),
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                        "status": "open"
                    },
                    "$inc": {"unread_count": 1}}
                )
            
            conversation_id = conversation['id']
            
            # Store message
            message_doc = {
                "id": str(uuid.uuid4()),
                "conversation_id": conversation_id,
                "company_id": company_id,
                "external_id": message_id,
                "sender_id": contact_id,
                "sender_type": "contact",
                "content": body,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "status": "received",
                "channel": "whatsapp",
                "raw_timestamp": timestamp
            }
            await db.messages.insert_one(message_doc)
            logger.info(f"Mensagem salva: {body[:50]}...")
            
            return {"success": True, "conversation_id": conversation_id, "message_id": message_doc['id']}
        
        elif event_type == "chat_sync":
            # Sync chat history from WhatsApp
            chat_id = data.get('chatId', '')
            contact_name = data.get('contactName', '')
            contact_number = data.get('contactNumber', '')
            messages = data.get('messages', [])
            
            if not contact_number:
                return {"success": True, "skipped": True}
            
            # Find or create contact
            contact = await db.contacts.find_one({
                "company_id": company_id,
                "$or": [
                    {"phone": {"$regex": contact_number[-10:]}},
                    {"whatsapp_id": contact_number}
                ]
            })
            
            if not contact:
                contact = {
                    "id": str(uuid.uuid4()),
                    "company_id": company_id,
                    "name": contact_name or contact_number,
                    "phone": contact_number,
                    "whatsapp_id": contact_number,
                    "avatar": (contact_name or contact_number)[:2].upper(),
                    "status": "lead",
                    "source": "whatsapp",
                    "tags": ["whatsapp"],
                    "notes": [],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                await db.contacts.insert_one(contact)
            
            contact_id = contact['id']
            
            # Find or create conversation
            conversation = await db.conversations.find_one({
                "company_id": company_id,
                "contact_id": contact_id,
                "channel": "whatsapp"
            })
            
            last_msg = messages[-1] if messages else None
            
            if not conversation:
                conversation = {
                    "id": str(uuid.uuid4()),
                    "company_id": company_id,
                    "contact_id": contact_id,
                    "channel": "whatsapp",
                    "status": "open",
                    "unread_count": data.get('unreadCount', 0),
                    "last_message": last_msg['body'][:100] if last_msg else "",
                    "last_message_time": datetime.fromtimestamp(last_msg['timestamp'], timezone.utc).isoformat() if last_msg else datetime.now(timezone.utc).isoformat(),
                    "responsible_id": None,
                    "session_id": session_id,
                    "whatsapp_chat_id": chat_id,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                await db.conversations.insert_one(conversation)
            
            conversation_id = conversation['id']
            
            # Sync messages
            for msg in messages:
                existing_msg = await db.messages.find_one({
                    "conversation_id": conversation_id,
                    "external_id": msg.get('id')
                })
                
                if not existing_msg:
                    message_doc = {
                        "id": str(uuid.uuid4()),
                        "conversation_id": conversation_id,
                        "company_id": company_id,
                        "external_id": msg.get('id'),
                        "sender_id": "system" if msg.get('fromMe') else contact_id,
                        "sender_type": "user" if msg.get('fromMe') else "contact",
                        "content": msg.get('body', ''),
                        "timestamp": datetime.fromtimestamp(msg.get('timestamp', 0), timezone.utc).isoformat(),
                        "status": "sent" if msg.get('fromMe') else "received",
                        "channel": "whatsapp"
                    }
                    await db.messages.insert_one(message_doc)
            
            logger.info(f"Chat sincronizado: {contact_name} - {len(messages)} mensagens")
            return {"success": True, "conversation_id": conversation_id, "messages_synced": len(messages)}
        
        elif event_type == "qr":
            # Store QR code for session
            await db.whatsapp_sessions.update_one(
                {"session_id": session_id, "company_id": company_id},
                {"$set": {
                    "session_id": session_id,
                    "company_id": company_id,
                    "status": "qr_ready",
                    "qr_code": data.get('qrCode'),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )
            return {"success": True}
        
        elif event_type == "ready":
            # Update session as ready
            await db.whatsapp_sessions.update_one(
                {"session_id": session_id, "company_id": company_id},
                {"$set": {
                    "status": "ready",
                    "phone_number": data.get('phoneNumber'),
                    "qr_code": None,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )
            return {"success": True}
        
        elif event_type == "disconnected":
            await db.whatsapp_sessions.update_one(
                {"session_id": session_id, "company_id": company_id},
                {"$set": {
                    "status": "disconnected",
                    "reason": data.get('reason'),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )
            return {"success": True}
        
        return {"success": True, "event": event_type}
    
    except Exception as e:
        logger.error(f"Error processing WhatsApp unofficial event: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


# Proxy endpoints to whatsapp-web.js service
@router.post("/whatsapp-unofficial/session/start/{session_id}")
async def start_whatsapp_session(session_id: str):
    """Start a new WhatsApp session"""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(f"{WHATSAPP_SERVICE_URL}/session/start/{session_id}")
            return response.json()
    except Exception as e:
        logger.error(f"Error starting WhatsApp session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/whatsapp-unofficial/session/status/{session_id}")
async def get_whatsapp_session_status(session_id: str):
    """Get WhatsApp session status"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{WHATSAPP_SERVICE_URL}/session/status/{session_id}")
            return response.json()
    except Exception as e:
        logger.error(f"Error getting WhatsApp session status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/whatsapp-unofficial/session/qr/{session_id}")
async def get_whatsapp_qr_code(session_id: str):
    """Get QR code for WhatsApp session"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{WHATSAPP_SERVICE_URL}/session/qr/{session_id}")
            return response.json()
    except Exception as e:
        logger.error(f"Error getting WhatsApp QR code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/whatsapp-unofficial/message/send")
async def send_whatsapp_message(request: SendMessageRequest):
    """Send a WhatsApp message"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{WHATSAPP_SERVICE_URL}/message/send",
                json=request.dict()
            )
            return response.json()
    except Exception as e:
        logger.error(f"Error sending WhatsApp message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/whatsapp-unofficial/sessions")
async def list_whatsapp_sessions():
    """List all active WhatsApp sessions"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{WHATSAPP_SERVICE_URL}/sessions")
            return response.json()
    except Exception as e:
        logger.error(f"Error listing WhatsApp sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/whatsapp-unofficial/session/logout/{session_id}")
async def logout_whatsapp_session(session_id: str):
    """Logout WhatsApp session"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(f"{WHATSAPP_SERVICE_URL}/session/logout/{session_id}")
            return response.json()
    except Exception as e:
        logger.error(f"Error logging out WhatsApp session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
