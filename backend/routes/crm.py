# CRM Routes - /app/backend/routes/crm.py
from fastapi import APIRouter, HTTPException, Header, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid
import base64

# Create router
router = APIRouter(prefix="/crm", tags=["CRM"])

# Get MongoDB db from main server
def get_db():
    from server import db
    return db

# ===================== MODELS =====================

class PipelineStage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    stage_key: str  # Internal key (e.g., "novo_lead", "contato_feito")
    name: str  # Display name customizable by user
    color: str = "bg-blue-500"
    order: int = 0
    is_default: bool = False

class PipelineStageCreate(BaseModel):
    stage_key: str
    name: str
    color: str = "bg-blue-500"
    order: int = 0

class KnowledgeDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    agent_id: Optional[str] = None
    filename: str
    file_type: str
    file_size: int
    content: str  # Extracted text content
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Contact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str  # Multi-tenancy
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    status: str = "lead"
    source: Optional[str] = None
    pipeline_stage: str = "novo_lead"
    tags: List[str] = []
    notes: Optional[str] = None
    avatar: Optional[str] = None
    whatsapp_id: Optional[str] = None
    instagram_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ContactCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    status: str = "lead"
    source: Optional[str] = None
    pipeline_stage: str = "novo_lead"
    tags: List[str] = []
    notes: Optional[str] = None

class Deal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    contact_id: Optional[str] = None
    title: str
    value: float = 0
    stage: str = "novo_lead"
    probability: int = 10
    expected_close_date: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DealCreate(BaseModel):
    contact_id: Optional[str] = None
    title: str
    value: float = 0
    stage: str = "novo_lead"
    probability: int = 10
    expected_close_date: Optional[str] = None
    notes: Optional[str] = None

class Workflow(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    name: str
    description: Optional[str] = None
    trigger_type: str = "message"
    is_active: bool = False
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str = "message"
    is_active: bool = False
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []

class AIAgent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    name: str
    description: Optional[str] = None
    model: str = "gpt-4-turbo"
    is_active: bool = False
    channels: Dict[str, bool] = {}
    knowledge: List[Dict[str, Any]] = []
    directives: Dict[str, Any] = {}
    conversations: int = 0
    success_rate: float = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AIAgentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    model: str = "gpt-4-turbo"
    is_active: bool = False
    channels: Dict[str, bool] = {}
    knowledge: List[Dict[str, Any]] = []
    directives: Dict[str, Any] = {}

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    due_date: Optional[str] = None
    assigned_to: Optional[str] = None
    contact_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    due_date: Optional[str] = None
    assigned_to: Optional[str] = None
    contact_id: Optional[str] = None

# ===================== CONTACTS =====================

@router.get("/contacts")
async def get_contacts(x_company_id: str = Header(...)):
    """Get all contacts for a company"""
    db = get_db()
    contacts = await db.contacts.find(
        {"company_id": x_company_id}, 
        {"_id": 0}
    ).to_list(1000)
    return contacts

@router.post("/contacts")
async def create_contact(contact: ContactCreate, x_company_id: str = Header(...)):
    """Create a new contact"""
    db = get_db()
    new_contact = Contact(
        company_id=x_company_id,
        **contact.model_dump()
    )
    doc = new_contact.model_dump()
    await db.contacts.insert_one(doc)
    doc.pop("_id", None)
    # Remove _id from response
    doc.pop('_id', None)
    return doc

@router.get("/contacts/{contact_id}")
async def get_contact(contact_id: str, x_company_id: str = Header(...)):
    """Get a specific contact"""
    db = get_db()
    contact = await db.contacts.find_one(
        {"id": contact_id, "company_id": x_company_id},
        {"_id": 0}
    )
    if not contact:
        raise HTTPException(status_code=404, detail="Contato nao encontrado")
    return contact

@router.put("/contacts/{contact_id}")
async def update_contact(contact_id: str, contact: ContactCreate, x_company_id: str = Header(...)):
    """Update a contact"""
    db = get_db()
    update_data = contact.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.contacts.update_one(
        {"id": contact_id, "company_id": x_company_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contato nao encontrado")
    
    return await get_contact(contact_id, x_company_id)

@router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str, x_company_id: str = Header(...)):
    """Delete a contact"""
    db = get_db()
    result = await db.contacts.delete_one(
        {"id": contact_id, "company_id": x_company_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contato nao encontrado")
    
    return {"message": "Contato excluido com sucesso"}

# ===================== DEALS =====================

@router.get("/deals")
async def get_deals(x_company_id: str = Header(...)):
    """Get all deals for a company"""
    db = get_db()
    deals = await db.deals.find(
        {"company_id": x_company_id},
        {"_id": 0}
    ).to_list(1000)
    return deals

@router.post("/deals")
async def create_deal(deal: DealCreate, x_company_id: str = Header(...)):
    """Create a new deal"""
    db = get_db()
    new_deal = Deal(
        company_id=x_company_id,
        **deal.model_dump()
    )
    doc = new_deal.model_dump()
    await db.deals.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.get("/deals/{deal_id}")
async def get_deal(deal_id: str, x_company_id: str = Header(...)):
    """Get a specific deal"""
    db = get_db()
    deal = await db.deals.find_one(
        {"id": deal_id, "company_id": x_company_id},
        {"_id": 0}
    )
    if not deal:
        raise HTTPException(status_code=404, detail="Negocio nao encontrado")
    return deal

@router.put("/deals/{deal_id}")
async def update_deal(deal_id: str, deal: DealCreate, x_company_id: str = Header(...)):
    """Update a deal"""
    db = get_db()
    update_data = deal.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.deals.update_one(
        {"id": deal_id, "company_id": x_company_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Negocio nao encontrado")
    
    return await get_deal(deal_id, x_company_id)

@router.delete("/deals/{deal_id}")
async def delete_deal(deal_id: str, x_company_id: str = Header(...)):
    """Delete a deal"""
    db = get_db()
    result = await db.deals.delete_one(
        {"id": deal_id, "company_id": x_company_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Negocio nao encontrado")
    
    return {"message": "Negocio excluido com sucesso"}

# ===================== WORKFLOWS =====================

@router.get("/workflows")
async def get_workflows(x_company_id: str = Header(...)):
    """Get all workflows for a company"""
    db = get_db()
    workflows = await db.workflows.find(
        {"company_id": x_company_id},
        {"_id": 0}
    ).to_list(1000)
    return workflows

@router.post("/workflows")
async def create_workflow(workflow: WorkflowCreate, x_company_id: str = Header(...)):
    """Create a new workflow"""
    db = get_db()
    new_workflow = Workflow(
        company_id=x_company_id,
        **workflow.model_dump()
    )
    doc = new_workflow.model_dump()
    await db.workflows.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str, x_company_id: str = Header(...)):
    """Get a specific workflow"""
    db = get_db()
    workflow = await db.workflows.find_one(
        {"id": workflow_id, "company_id": x_company_id},
        {"_id": 0}
    )
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow nao encontrado")
    return workflow

@router.put("/workflows/{workflow_id}")
async def update_workflow(workflow_id: str, workflow: WorkflowCreate, x_company_id: str = Header(...)):
    """Update a workflow"""
    db = get_db()
    update_data = workflow.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.workflows.update_one(
        {"id": workflow_id, "company_id": x_company_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Workflow nao encontrado")
    
    return await get_workflow(workflow_id, x_company_id)

@router.delete("/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str, x_company_id: str = Header(...)):
    """Delete a workflow"""
    db = get_db()
    result = await db.workflows.delete_one(
        {"id": workflow_id, "company_id": x_company_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workflow nao encontrado")
    
    return {"message": "Workflow excluido com sucesso"}

# ===================== AI AGENTS =====================

@router.get("/agents")
async def get_agents(x_company_id: str = Header(...)):
    """Get all AI agents for a company"""
    db = get_db()
    agents = await db.ai_agents.find(
        {"company_id": x_company_id},
        {"_id": 0}
    ).to_list(100)
    return agents

@router.post("/agents")
async def create_agent(agent: AIAgentCreate, x_company_id: str = Header(...)):
    """Create a new AI agent"""
    db = get_db()
    new_agent = AIAgent(
        company_id=x_company_id,
        **agent.model_dump()
    )
    doc = new_agent.model_dump()
    await db.ai_agents.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.get("/agents/{agent_id}")
async def get_agent(agent_id: str, x_company_id: str = Header(...)):
    """Get a specific AI agent"""
    db = get_db()
    agent = await db.ai_agents.find_one(
        {"id": agent_id, "company_id": x_company_id},
        {"_id": 0}
    )
    if not agent:
        raise HTTPException(status_code=404, detail="Agente nao encontrado")
    return agent

@router.put("/agents/{agent_id}")
async def update_agent(agent_id: str, agent: AIAgentCreate, x_company_id: str = Header(...)):
    """Update an AI agent"""
    db = get_db()
    update_data = agent.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.ai_agents.update_one(
        {"id": agent_id, "company_id": x_company_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Agente nao encontrado")
    
    return await get_agent(agent_id, x_company_id)

@router.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str, x_company_id: str = Header(...)):
    """Delete an AI agent"""
    db = get_db()
    result = await db.ai_agents.delete_one(
        {"id": agent_id, "company_id": x_company_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Agente nao encontrado")
    
    return {"message": "Agente excluido com sucesso"}

# ===================== TASKS =====================

@router.get("/tasks")
async def get_tasks(x_company_id: str = Header(...)):
    """Get all tasks for a company"""
    db = get_db()
    tasks = await db.tasks.find(
        {"company_id": x_company_id},
        {"_id": 0}
    ).to_list(1000)
    return tasks

@router.post("/tasks")
async def create_task(task: TaskCreate, x_company_id: str = Header(...)):
    """Create a new task"""
    db = get_db()
    new_task = Task(
        company_id=x_company_id,
        **task.model_dump()
    )
    doc = new_task.model_dump()
    await db.tasks.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/tasks/{task_id}")
async def update_task(task_id: str, task: TaskCreate, x_company_id: str = Header(...)):
    """Update a task"""
    db = get_db()
    update_data = task.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.tasks.update_one(
        {"id": task_id, "company_id": x_company_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tarefa nao encontrada")
    
    updated = await db.tasks.find_one(
        {"id": task_id, "company_id": x_company_id},
        {"_id": 0}
    )
    return updated

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, x_company_id: str = Header(...)):
    """Delete a task"""
    db = get_db()
    result = await db.tasks.delete_one(
        {"id": task_id, "company_id": x_company_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tarefa nao encontrada")
    
    return {"message": "Tarefa excluida com sucesso"}

# ===================== DASHBOARD STATS =====================

@router.get("/dashboard/stats")
async def get_dashboard_stats(x_company_id: str = Header(...)):
    """Get dashboard statistics for a company"""
    db = get_db()
    
    # Count totals
    total_contacts = await db.contacts.count_documents({"company_id": x_company_id})
    total_deals = await db.deals.count_documents({"company_id": x_company_id})
    total_tasks = await db.tasks.count_documents({"company_id": x_company_id})
    pending_tasks = await db.tasks.count_documents({"company_id": x_company_id, "status": "pending"})
    
    # Sum deal values
    pipeline = [
        {"$match": {"company_id": x_company_id}},
        {"$group": {"_id": None, "total": {"$sum": "$value"}}}
    ]
    deal_sum = await db.deals.aggregate(pipeline).to_list(1)
    total_value = deal_sum[0]["total"] if deal_sum else 0
    
    # Deals by stage
    stage_pipeline = [
        {"$match": {"company_id": x_company_id}},
        {"$group": {"_id": "$stage", "count": {"$sum": 1}, "value": {"$sum": "$value"}}}
    ]
    deals_by_stage = await db.deals.aggregate(stage_pipeline).to_list(10)
    
    return {
        "total_contacts": total_contacts,
        "total_deals": total_deals,
        "total_tasks": total_tasks,
        "pending_tasks": pending_tasks,
        "total_value": total_value,
        "deals_by_stage": {d["_id"]: {"count": d["count"], "value": d["value"]} for d in deals_by_stage}
    }


# ===================== CONVERSATIONS =====================

@router.get("/conversations")
async def get_conversations(x_company_id: str = Header(...)):
    """Get all conversations for a company"""
    db = get_db()
    
    conversations = await db.conversations.find(
        {"company_id": x_company_id}, 
        {"_id": 0}
    ).sort("last_message_time", -1).to_list(100)
    
    # Enrich with contact info
    for conv in conversations:
        contact = await db.contacts.find_one(
            {"id": conv.get("contact_id")},
            {"_id": 0, "id": 1, "name": 1, "phone": 1, "avatar": 1, "status": 1}
        )
        conv["contact"] = contact
    
    return conversations


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, x_company_id: str = Header(...)):
    """Get a single conversation with messages"""
    db = get_db()
    
    conversation = await db.conversations.find_one(
        {"id": conversation_id, "company_id": x_company_id},
        {"_id": 0}
    )
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Get contact info
    contact = await db.contacts.find_one(
        {"id": conversation.get("contact_id")},
        {"_id": 0}
    )
    conversation["contact"] = contact
    
    # Get messages
    messages = await db.messages.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(100)
    
    conversation["messages"] = messages
    
    return conversation


@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(conversation_id: str, x_company_id: str = Header(...), limit: int = 50):
    """Get messages for a conversation"""
    db = get_db()
    
    messages = await db.messages.find(
        {"conversation_id": conversation_id, "company_id": x_company_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    # Return in chronological order
    return list(reversed(messages))


@router.post("/conversations/{conversation_id}/messages")
async def send_conversation_message(
    conversation_id: str,
    message: dict,
    x_company_id: str = Header(...)
):
    """Send a message in a conversation"""
    import httpx
    db = get_db()
    
    # Get conversation
    conversation = await db.conversations.find_one(
        {"id": conversation_id, "company_id": x_company_id}
    )
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Get contact for WhatsApp number
    contact = await db.contacts.find_one({"id": conversation.get("contact_id")})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    content = message.get("content", "")
    
    # If WhatsApp conversation, send via WhatsApp service
    if conversation.get("channel") == "whatsapp":
        phone = contact.get("phone") or contact.get("whatsapp_id")
        
        if phone:
            try:
                # First, get active session from WhatsApp service
                async with httpx.AsyncClient(timeout=30.0) as client:
                    # Get list of sessions to find an active one
                    sessions_response = await client.get("http://localhost:3001/sessions")
                    sessions_data = sessions_response.json()
                    
                    # Find a ready session for this company
                    active_session = None
                    if sessions_data.get("success"):
                        for sess in sessions_data.get("sessions", []):
                            if sess.get("status") == "ready":
                                # Prefer session with matching company_id
                                if sess.get("companyId") == x_company_id:
                                    active_session = sess.get("sessionId")
                                    break
                                elif not active_session:
                                    active_session = sess.get("sessionId")
                    
                    if not active_session:
                        raise HTTPException(status_code=400, detail="WhatsApp nao esta conectado. Va em Integracoes e conecte o WhatsApp primeiro.")
                    
                    # Send message using the active session
                    response = await client.post(
                        "http://localhost:3001/message/send",
                        json={
                            "sessionId": active_session,
                            "to": phone,
                            "message": content
                        }
                    )
                    result = response.json()
                    
                    if not result.get("success"):
                        raise HTTPException(status_code=500, detail=result.get("message", "Failed to send"))
                        
            except httpx.HTTPError as e:
                raise HTTPException(status_code=500, detail=f"WhatsApp service error: {str(e)}")
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"WhatsApp error: {str(e)}")
    
    # Store message in database
    message_doc = {
        "id": str(uuid.uuid4()),
        "conversation_id": conversation_id,
        "company_id": x_company_id,
        "sender_id": "system",
        "sender_type": "user",
        "content": content,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "sent",
        "channel": conversation.get("channel", "chat")
    }
    await db.messages.insert_one(message_doc)
    
    # Update conversation
    await db.conversations.update_one(
        {"id": conversation_id},
        {"$set": {
            "last_message": content[:100],
            "last_message_time": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"id": message_doc["id"], "status": "sent"}


@router.put("/conversations/{conversation_id}/read")
async def mark_conversation_read(conversation_id: str, x_company_id: str = Header(...)):
    """Mark conversation as read"""
    db = get_db()
    
    await db.conversations.update_one(
        {"id": conversation_id, "company_id": x_company_id},
        {"$set": {"unread_count": 0, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True}



# ===================== PIPELINE STAGES (Customizable) =====================

# Default pipeline stages
DEFAULT_STAGES = [
    {"stage_key": "novo_lead", "name": "Novo Lead", "color": "bg-blue-500", "order": 0},
    {"stage_key": "contato_feito", "name": "Contato Feito", "color": "bg-cyan-500", "order": 1},
    {"stage_key": "proposta_enviada", "name": "Proposta Enviada", "color": "bg-amber-500", "order": 2},
    {"stage_key": "negociacao", "name": "Negociacao", "color": "bg-orange-500", "order": 3},
    {"stage_key": "ganho", "name": "Ganho", "color": "bg-emerald-500", "order": 4},
    {"stage_key": "perdido", "name": "Perdido", "color": "bg-red-500", "order": 5},
]

@router.get("/pipeline/stages")
async def get_pipeline_stages(x_company_id: str = Header(...)):
    """Get pipeline stages for a company (customized or default)"""
    db = get_db()
    
    # Check if company has custom stages
    custom_stages = await db.pipeline_stages.find(
        {"company_id": x_company_id},
        {"_id": 0}
    ).sort("order", 1).to_list(20)
    
    if custom_stages and len(custom_stages) > 0:
        return custom_stages
    
    # Return default stages with company_id
    return [
        {**stage, "id": f"default-{stage['stage_key']}", "company_id": x_company_id, "is_default": True}
        for stage in DEFAULT_STAGES
    ]

@router.post("/pipeline/stages")
async def create_pipeline_stage(stage: PipelineStageCreate, x_company_id: str = Header(...)):
    """Create a new pipeline stage"""
    db = get_db()
    
    new_stage = PipelineStage(
        company_id=x_company_id,
        **stage.model_dump()
    )
    doc = new_stage.model_dump()
    await db.pipeline_stages.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/pipeline/stages/{stage_id}")
async def update_pipeline_stage(stage_id: str, stage: PipelineStageCreate, x_company_id: str = Header(...)):
    """Update a pipeline stage (name, color, order)"""
    db = get_db()
    
    update_data = stage.model_dump()
    
    # If it's a default stage, create a custom one
    if stage_id.startswith("default-"):
        stage_key = stage_id.replace("default-", "")
        existing = await db.pipeline_stages.find_one({
            "company_id": x_company_id,
            "stage_key": stage_key
        })
        
        if not existing:
            # Create custom stage from default - remove stage_key from update_data to avoid conflict
            update_data_copy = {k: v for k, v in update_data.items() if k != 'stage_key'}
            new_stage = PipelineStage(
                company_id=x_company_id,
                stage_key=stage_key,
                name=update_data.get('name', stage_key),
                color=update_data.get('color', 'bg-blue-500'),
                order=update_data.get('order', 0)
            )
            doc = new_stage.model_dump()
            await db.pipeline_stages.insert_one(doc)
            doc.pop("_id", None)
            return doc
        else:
            stage_id = existing["id"]
    
    result = await db.pipeline_stages.update_one(
        {"id": stage_id, "company_id": x_company_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Estagio nao encontrado")
    
    updated = await db.pipeline_stages.find_one(
        {"id": stage_id, "company_id": x_company_id},
        {"_id": 0}
    )
    return updated

@router.delete("/pipeline/stages/{stage_id}")
async def delete_pipeline_stage(stage_id: str, x_company_id: str = Header(...)):
    """Delete a custom pipeline stage"""
    db = get_db()
    
    if stage_id.startswith("default-"):
        raise HTTPException(status_code=400, detail="Nao e possivel excluir estagios padrao")
    
    result = await db.pipeline_stages.delete_one(
        {"id": stage_id, "company_id": x_company_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Estagio nao encontrado")
    
    return {"message": "Estagio excluido com sucesso"}

@router.post("/pipeline/stages/reset")
async def reset_pipeline_stages(x_company_id: str = Header(...)):
    """Reset pipeline stages to default"""
    db = get_db()
    
    # Delete all custom stages for this company
    await db.pipeline_stages.delete_many({"company_id": x_company_id})
    
    return {"message": "Estagios resetados para padrao", "stages": DEFAULT_STAGES}


# ===================== KNOWLEDGE DOCUMENTS (PDF Upload) =====================

@router.get("/knowledge/documents")
async def get_knowledge_documents(x_company_id: str = Header(...), agent_id: Optional[str] = None):
    """Get all knowledge documents for a company"""
    db = get_db()
    
    query = {"company_id": x_company_id}
    if agent_id:
        query["agent_id"] = agent_id
    
    documents = await db.knowledge_documents.find(
        query,
        {"_id": 0, "content": 0}  # Exclude content from list view
    ).sort("created_at", -1).to_list(100)
    
    return documents

@router.get("/knowledge/documents/{doc_id}")
async def get_knowledge_document(doc_id: str, x_company_id: str = Header(...)):
    """Get a specific knowledge document with content"""
    db = get_db()
    
    document = await db.knowledge_documents.find_one(
        {"id": doc_id, "company_id": x_company_id},
        {"_id": 0}
    )
    
    if not document:
        raise HTTPException(status_code=404, detail="Documento nao encontrado")
    
    return document

@router.post("/knowledge/upload")
async def upload_knowledge_document(
    file: UploadFile = File(...),
    x_company_id: str = Header(...),
    agent_id: Optional[str] = None
):
    """Upload a PDF document for AI knowledge base"""
    db = get_db()
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF sao aceitos")
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    # Check file size (10MB limit)
    max_size = 10 * 1024 * 1024  # 10MB
    if file_size > max_size:
        raise HTTPException(status_code=400, detail="Arquivo muito grande. Maximo: 10MB")
    
    # Extract text from PDF
    try:
        import io
        extracted_text = ""
        
        try:
            # Try PyPDF2 first
            from PyPDF2 import PdfReader
            pdf_reader = PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    extracted_text += page_text + "\n"
        except ImportError:
            # Fallback: store as base64 if PyPDF2 not available
            extracted_text = f"[PDF Base64: {len(content)} bytes - Install PyPDF2 for text extraction]"
        
        if not extracted_text.strip():
            extracted_text = "[PDF sem texto extraivel - pode ser um documento escaneado]"
            
    except Exception as e:
        extracted_text = f"[Erro ao extrair texto: {str(e)}]"
    
    # Create document record
    doc = KnowledgeDocument(
        company_id=x_company_id,
        agent_id=agent_id,
        filename=file.filename,
        file_type="pdf",
        file_size=file_size,
        content=extracted_text[:50000]  # Limit content to 50k chars
    )
    
    doc_dict = doc.model_dump()
    await db.knowledge_documents.insert_one(doc_dict)
    doc_dict.pop("_id", None)
    
    return {
        "id": doc_dict["id"],
        "filename": doc_dict["filename"],
        "file_size": doc_dict["file_size"],
        "content_length": len(extracted_text),
        "message": "Documento carregado com sucesso"
    }

@router.delete("/knowledge/documents/{doc_id}")
async def delete_knowledge_document(doc_id: str, x_company_id: str = Header(...)):
    """Delete a knowledge document"""
    db = get_db()
    
    result = await db.knowledge_documents.delete_one(
        {"id": doc_id, "company_id": x_company_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Documento nao encontrado")
    
    return {"message": "Documento excluido com sucesso"}


# ===================== CHATBOT -> PIPELINE INTEGRATION =====================

@router.post("/chatbot/new-lead")
async def create_lead_from_chatbot(
    data: dict,
    x_company_id: str = Header(...)
):
    """
    Create a new lead from chatbot interaction.
    Called when a new conversation starts in the chatbot.
    Lead enters the first pipeline stage automatically.
    """
    db = get_db()
    
    # Get first pipeline stage
    stages = await db.pipeline_stages.find(
        {"company_id": x_company_id}
    ).sort("order", 1).to_list(1)
    
    first_stage = stages[0]["stage_key"] if stages else "novo_lead"
    
    # Check if contact already exists
    phone = data.get("phone")
    whatsapp_id = data.get("whatsapp_id")
    
    existing = None
    if phone:
        existing = await db.contacts.find_one({
            "company_id": x_company_id,
            "$or": [{"phone": phone}, {"whatsapp_id": phone}]
        })
    elif whatsapp_id:
        existing = await db.contacts.find_one({
            "company_id": x_company_id,
            "whatsapp_id": whatsapp_id
        })
    
    if existing:
        # Contact already exists, return it
        existing.pop("_id", None)
        return {"contact": existing, "is_new": False}
    
    # Create new contact in first pipeline stage
    new_contact = Contact(
        company_id=x_company_id,
        name=data.get("name", "Novo Lead"),
        phone=phone,
        whatsapp_id=whatsapp_id or phone,
        source="chatbot",
        pipeline_stage=first_stage,
        status="lead",
        tags=["chatbot", "automatico"]
    )
    
    doc = new_contact.model_dump()
    await db.contacts.insert_one(doc)
    doc.pop("_id", None)
    
    return {"contact": doc, "is_new": True, "stage": first_stage}

@router.put("/chatbot/update-stage")
async def update_lead_stage_from_chatbot(
    data: dict,
    x_company_id: str = Header(...)
):
    """
    Update lead stage from chatbot workflow.
    Called when chatbot flow moves lead to next stage.
    """
    db = get_db()
    
    contact_id = data.get("contact_id")
    new_stage = data.get("stage")
    
    if not contact_id or not new_stage:
        raise HTTPException(status_code=400, detail="contact_id e stage sao obrigatorios")
    
    result = await db.contacts.update_one(
        {"id": contact_id, "company_id": x_company_id},
        {"$set": {
            "pipeline_stage": new_stage,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contato nao encontrado")
    
    return {"success": True, "contact_id": contact_id, "new_stage": new_stage}
