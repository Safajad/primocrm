// API Service for CRM Backend
// This service handles all API calls with multi-tenancy support

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

// Get company ID from user session (stored after login)
const getCompanyId = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('company_id') || 'default-company';
};

// Set company ID after login
export const setCompanyId = (companyId: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('company_id', companyId);
  }
};

// Generic fetch with headers
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const companyId = getCompanyId();
  
  const headers = {
    'Content-Type': 'application/json',
    'x-company-id': companyId,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
    throw new Error(error.detail || `HTTP Error: ${response.status}`);
  }

  return response.json();
}

// ===================== CONTACTS API =====================

export interface Contact {
  id: string;
  company_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: string;
  source?: string;
  pipeline_stage?: string;
  tags: string[];
  notes?: string;
  avatar?: string;
  whatsapp_id?: string;
  instagram_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactCreate {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  source?: string;
  tags?: string[];
  notes?: string;
}

export const contactsApi = {
  getAll: () => apiFetch<Contact[]>('/crm/contacts'),
  
  getById: (id: string) => apiFetch<Contact>(`/crm/contacts/${id}`),
  
  create: (data: ContactCreate) => 
    apiFetch<Contact>('/crm/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: ContactCreate) =>
    apiFetch<Contact>(`/crm/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/crm/contacts/${id}`, {
      method: 'DELETE',
    }),
};

// ===================== DEALS API =====================

export interface Deal {
  id: string;
  company_id: string;
  contact_id?: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expected_close_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DealCreate {
  contact_id?: string;
  title: string;
  value?: number;
  stage?: string;
  probability?: number;
  expected_close_date?: string;
  notes?: string;
}

export const dealsApi = {
  getAll: () => apiFetch<Deal[]>('/crm/deals'),
  
  getById: (id: string) => apiFetch<Deal>(`/crm/deals/${id}`),
  
  create: (data: DealCreate) =>
    apiFetch<Deal>('/crm/deals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: DealCreate) =>
    apiFetch<Deal>(`/crm/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/crm/deals/${id}`, {
      method: 'DELETE',
    }),
};

// ===================== WORKFLOWS API =====================

export interface Workflow {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  trigger_type: string;
  is_active: boolean;
  nodes: any[];
  edges: any[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowCreate {
  name: string;
  description?: string;
  trigger_type?: string;
  is_active?: boolean;
  nodes?: any[];
  edges?: any[];
}

export const workflowsApi = {
  getAll: () => apiFetch<Workflow[]>('/crm/workflows'),
  
  getById: (id: string) => apiFetch<Workflow>(`/crm/workflows/${id}`),
  
  create: (data: WorkflowCreate) =>
    apiFetch<Workflow>('/crm/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: WorkflowCreate) =>
    apiFetch<Workflow>(`/crm/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/crm/workflows/${id}`, {
      method: 'DELETE',
    }),
};

// ===================== AI AGENTS API =====================

export interface AIAgent {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  model: string;
  is_active: boolean;
  channels: Record<string, boolean>;
  knowledge: any[];
  directives: any;
  conversations: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface AIAgentCreate {
  name: string;
  description?: string;
  model?: string;
  is_active?: boolean;
  channels?: Record<string, boolean>;
  knowledge?: any[];
  directives?: any;
}

export const agentsApi = {
  getAll: () => apiFetch<AIAgent[]>('/crm/agents'),
  
  getById: (id: string) => apiFetch<AIAgent>(`/crm/agents/${id}`),
  
  create: (data: AIAgentCreate) =>
    apiFetch<AIAgent>('/crm/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: AIAgentCreate) =>
    apiFetch<AIAgent>(`/crm/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/crm/agents/${id}`, {
      method: 'DELETE',
    }),
};

// ===================== TASKS API =====================

export interface Task {
  id: string;
  company_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  assigned_to?: string;
  contact_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  assigned_to?: string;
  contact_id?: string;
}

export const tasksApi = {
  getAll: () => apiFetch<Task[]>('/crm/tasks'),
  
  create: (data: TaskCreate) =>
    apiFetch<Task>('/crm/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: TaskCreate) =>
    apiFetch<Task>(`/crm/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/crm/tasks/${id}`, {
      method: 'DELETE',
    }),
};

// ===================== DASHBOARD API =====================

export interface DashboardStats {
  total_contacts: number;
  total_deals: number;
  total_tasks: number;
  pending_tasks: number;
  total_value: number;
  deals_by_stage: Record<string, { count: number; value: number }>;
}

export const dashboardApi = {
  getStats: () => apiFetch<DashboardStats>('/crm/dashboard/stats'),
};

// ===================== AI CHAT API =====================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  contactInfo?: any;
  sessionId?: string;
}

export interface ChatResponse {
  id: string;
  role: string;
  content: string;
  parts: { type: string; text: string }[];
}

export const chatApi = {
  send: (data: ChatRequest) =>
    apiFetch<ChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};


// ===================== PIPELINE STAGES API =====================

export interface PipelineStage {
  id: string;
  company_id: string;
  stage_key: string;
  name: string;
  color: string;
  order: number;
  is_default?: boolean;
}

export const pipelineStagesApi = {
  getAll: () => apiFetch<PipelineStage[]>('/crm/pipeline/stages'),
  
  create: (stage: Omit<PipelineStage, 'id' | 'company_id'>) =>
    apiFetch<PipelineStage>('/crm/pipeline/stages', {
      method: 'POST',
      body: JSON.stringify(stage),
    }),
  
  update: (stageId: string, stage: Partial<PipelineStage>) =>
    apiFetch<PipelineStage>(`/crm/pipeline/stages/${stageId}`, {
      method: 'PUT',
      body: JSON.stringify(stage),
    }),
  
  delete: (stageId: string) =>
    apiFetch<{ message: string }>(`/crm/pipeline/stages/${stageId}`, {
      method: 'DELETE',
    }),
  
  reset: () =>
    apiFetch<{ message: string; stages: any[] }>('/crm/pipeline/stages/reset', {
      method: 'POST',
    }),
};

// ===================== KNOWLEDGE DOCUMENTS API =====================

export interface KnowledgeDocument {
  id: string;
  company_id: string;
  agent_id?: string;
  filename: string;
  file_type: string;
  file_size: number;
  content?: string;
  created_at: string;
}

export const knowledgeApi = {
  getAll: (agentId?: string) => {
    const params = agentId ? `?agent_id=${agentId}` : '';
    return apiFetch<KnowledgeDocument[]>(`/crm/knowledge/documents${params}`);
  },
  
  get: (docId: string) =>
    apiFetch<KnowledgeDocument>(`/crm/knowledge/documents/${docId}`),
  
  delete: (docId: string) =>
    apiFetch<{ message: string }>(`/crm/knowledge/documents/${docId}`, {
      method: 'DELETE',
    }),
};
