"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "manager" | "agent";
  status: "online" | "offline" | "away";
  phone?: string;
  department?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: "online" | "offline" | "away";
  channel: "whatsapp" | "instagram" | "facebook" | "email" | "telegram";
  tags: string[];
  responsibleId: string | null;
  createdAt: string;
  lastActivity: string;
  customFields: Record<string, string>;
  notes: string;
  source?: string;
  company?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "contact" | "user" | "bot" | "system";
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  attachments?: { type: string; url: string; name: string }[];
}

export interface Conversation {
  id: string;
  contactId: string;
  responsibleId: string | null;
  channel: "whatsapp" | "instagram" | "facebook" | "email" | "telegram";
  status: "open" | "pending" | "closed";
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  tags: string[];
  messages: Message[];
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  contactId: string;
  responsibleId: string | null;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
  tags: string[];
  notes: string;
  products: { name: string; price: number; quantity: number }[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  assigneeId: string | null;
  relatedContactId: string | null;
  relatedDealId: string | null;
  createdAt: string;
  completedAt?: string;
  reminders: string[];
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "cancelled";
  paymentMethod: string;
  relatedDealId?: string;
  dealId?: string;
  contactId?: string;
  userId?: string;
  tags: string[];
  createdBy: string;
  notes?: string;
  recurring?: boolean;
  recurringPeriod?: string;
}

export interface Notification {
  id: string;
  type: "message" | "deal" | "task" | "system" | "mention";
  title: string;
  description: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  relatedId?: string;
}

export interface TeamMessage {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  timestamp: string;
  mentions: string[];
  reactions: { emoji: string; userIds: string[] }[];
  attachments?: { type: string; url: string; name: string }[];
  replyTo?: string;
}

export interface TeamChannel {
  id: string;
  name: string;
  type: "general" | "private" | "direct";
  members: string[];
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface WorkflowNode {
  id: string;
  type: "trigger" | "message" | "condition" | "delay" | "action" | "ai" | "integration";
  title: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
  connections: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft" | "paused";
  nodes: WorkflowNode[];
  createdAt: string;
  lastModified: string;
  triggers: number;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  status: "active" | "inactive" | "training";
  conversations: number;
  successRate: number;
  avatar: string;
  personality: string;
  capabilities: string[];
  systemPrompt: string;
  temperature: number;
  apiKeyConfigured: boolean;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

// Initial Data
const initialUsers: User[] = [
  {
    id: "user-1",
    name: "João Mídias",
    email: "joao@primo.com",
    avatar: "JM",
    role: "admin",
    status: "online",
    phone: "(71) 99999-0001",
    department: "Vendas",
  },
  {
    id: "user-2",
    name: "Maria Silva",
    email: "maria@primo.com",
    avatar: "MS",
    role: "manager",
    status: "online",
    phone: "(71) 99999-0002",
    department: "Suporte",
  },
  {
    id: "user-3",
    name: "Carlos Santos",
    email: "carlos@primo.com",
    avatar: "CS",
    role: "agent",
    status: "away",
    phone: "(71) 99999-0003",
    department: "Vendas",
  },
];

const initialContacts: Contact[] = [
  {
    id: "contact-1",
    name: "Ana Costa",
    email: "ana@exemplo.com",
    phone: "(71) 98888-1111",
    avatar: "AC",
    status: "online",
    channel: "whatsapp",
    tags: ["VIP", "Qualificado"],
    responsibleId: "user-1",
    createdAt: "2026-01-15T10:00:00",
    lastActivity: "2026-01-28T10:30:00",
    customFields: { empresa: "Loja Fashion", cargo: "Diretora" },
    notes: "Cliente muito interessado no plano profissional",
    source: "Instagram Ads",
    company: "Loja Fashion",
  },
  {
    id: "contact-2",
    name: "Pedro Lima",
    email: "pedro@tech.com",
    phone: "(71) 98888-2222",
    avatar: "PL",
    status: "offline",
    channel: "instagram",
    tags: ["Enterprise"],
    responsibleId: "user-2",
    createdAt: "2026-01-10T14:00:00",
    lastActivity: "2026-01-27T15:45:00",
    customFields: { empresa: "Tech Startup", cargo: "CEO" },
    notes: "Negociando plano enterprise",
    source: "Indicação",
    company: "Tech Startup",
  },
  {
    id: "contact-3",
    name: "Fernanda Lopes",
    email: "fernanda@ecommerce.com",
    phone: "(71) 98888-3333",
    avatar: "FL",
    status: "online",
    channel: "whatsapp",
    tags: ["Qualificado", "Urgente"],
    responsibleId: "user-1",
    createdAt: "2026-01-08T09:00:00",
    lastActivity: "2026-01-28T09:15:00",
    customFields: { empresa: "E-commerce Solutions", cargo: "Gerente" },
    notes: "Precisa de solução urgente",
    source: "Google Ads",
    company: "E-commerce Solutions",
  },
  {
    id: "contact-4",
    name: "Lucas Mendes",
    email: "lucas@agencia.com",
    phone: "(71) 98888-4444",
    avatar: "LM",
    status: "away",
    channel: "email",
    tags: ["Novo"],
    responsibleId: null,
    createdAt: "2026-01-27T16:00:00",
    lastActivity: "2026-01-27T16:30:00",
    customFields: { empresa: "Agência Digital", cargo: "Sócio" },
    notes: "",
    source: "Site",
    company: "Agência Digital",
  },
  {
    id: "contact-5",
    name: "Carla Souza",
    email: "carla@consultoria.com",
    phone: "(71) 98888-5555",
    avatar: "CS",
    status: "online",
    channel: "facebook",
    tags: ["Qualificado"],
    responsibleId: "user-3",
    createdAt: "2026-01-20T11:00:00",
    lastActivity: "2026-01-28T08:00:00",
    customFields: { empresa: "Consultoria Pro", cargo: "Diretora Comercial" },
    notes: "Aguardando proposta",
    source: "Facebook",
    company: "Consultoria Pro",
  },
];

const initialConversations: Conversation[] = [
  {
    id: "conv-1",
    contactId: "contact-1",
    responsibleId: "user-1",
    channel: "whatsapp",
    status: "open",
    unreadCount: 2,
    lastMessage: "Obrigada pelo atendimento!",
    lastMessageTime: "2026-01-28T10:30:00",
    tags: ["Venda"],
    messages: [
      {
        id: "msg-1",
        conversationId: "conv-1",
        senderId: "contact-1",
        senderType: "contact",
        content: "Olá, vi seu anúncio no Instagram",
        timestamp: "2026-01-28T10:25:00",
        status: "read",
      },
      {
        id: "msg-2",
        conversationId: "conv-1",
        senderId: "user-1",
        senderType: "user",
        content: "Olá Ana! Tudo bem? Como posso ajudar?",
        timestamp: "2026-01-28T10:26:00",
        status: "read",
      },
      {
        id: "msg-3",
        conversationId: "conv-1",
        senderId: "contact-1",
        senderType: "contact",
        content: "Gostaria de saber mais sobre os planos disponíveis",
        timestamp: "2026-01-28T10:28:00",
        status: "read",
      },
      {
        id: "msg-4",
        conversationId: "conv-1",
        senderId: "user-1",
        senderType: "user",
        content: "Claro! Temos 3 planos principais: Básico (R$ 97/mês), Profissional (R$ 197/mês) e Enterprise (sob consulta).",
        timestamp: "2026-01-28T10:29:00",
        status: "delivered",
      },
      {
        id: "msg-5",
        conversationId: "conv-1",
        senderId: "contact-1",
        senderType: "contact",
        content: "Obrigada pelo atendimento!",
        timestamp: "2026-01-28T10:30:00",
        status: "delivered",
      },
    ],
  },
  {
    id: "conv-2",
    contactId: "contact-2",
    responsibleId: "user-2",
    channel: "instagram",
    status: "open",
    unreadCount: 0,
    lastMessage: "Qual o prazo de entrega?",
    lastMessageTime: "2026-01-27T09:15:00",
    tags: [],
    messages: [
      {
        id: "msg-6",
        conversationId: "conv-2",
        senderId: "contact-2",
        senderType: "contact",
        content: "Boa tarde! Estou interessado no plano Enterprise",
        timestamp: "2026-01-27T09:00:00",
        status: "read",
      },
      {
        id: "msg-7",
        conversationId: "conv-2",
        senderId: "user-2",
        senderType: "user",
        content: "Olá Pedro! Que ótimo! Posso agendar uma demonstração?",
        timestamp: "2026-01-27T09:10:00",
        status: "read",
      },
      {
        id: "msg-8",
        conversationId: "conv-2",
        senderId: "contact-2",
        senderType: "contact",
        content: "Qual o prazo de entrega?",
        timestamp: "2026-01-27T09:15:00",
        status: "read",
      },
    ],
  },
  {
    id: "conv-3",
    contactId: "contact-3",
    responsibleId: "user-1",
    channel: "whatsapp",
    status: "open",
    unreadCount: 1,
    lastMessage: "Gostei da proposta...",
    lastMessageTime: "2026-01-28T09:15:00",
    tags: ["Urgente"],
    messages: [
      {
        id: "msg-9",
        conversationId: "conv-3",
        senderId: "contact-3",
        senderType: "contact",
        content: "Gostei da proposta...",
        timestamp: "2026-01-28T09:15:00",
        status: "delivered",
      },
    ],
  },
  {
    id: "conv-4",
    contactId: "contact-4",
    responsibleId: null,
    channel: "email",
    status: "pending",
    unreadCount: 1,
    lastMessage: "Gostaria de uma demonstração",
    lastMessageTime: "2026-01-27T16:30:00",
    tags: ["Novo Lead"],
    messages: [
      {
        id: "msg-10",
        conversationId: "conv-4",
        senderId: "contact-4",
        senderType: "contact",
        content: "Gostaria de uma demonstração",
        timestamp: "2026-01-27T16:30:00",
        status: "delivered",
      },
    ],
  },
  {
    id: "conv-5",
    contactId: "contact-5",
    responsibleId: "user-3",
    channel: "facebook",
    status: "open",
    unreadCount: 3,
    lastMessage: "Estou interessada!",
    lastMessageTime: "2026-01-28T08:00:00",
    tags: [],
    messages: [
      {
        id: "msg-11",
        conversationId: "conv-5",
        senderId: "contact-5",
        senderType: "contact",
        content: "Estou interessada!",
        timestamp: "2026-01-28T08:00:00",
        status: "delivered",
      },
    ],
  },
];

const initialDeals: Deal[] = [
  {
    id: "deal-1",
    title: "Loja Fashion - Plano Pro",
    value: 5000,
    contactId: "contact-1",
    responsibleId: "user-1",
    stage: "proposal",
    probability: 70,
    expectedCloseDate: "2026-02-05",
    createdAt: "2026-01-15",
    tags: ["Recorrente"],
    notes: "Cliente muito interessado",
    products: [{ name: "Plano Profissional", price: 5000, quantity: 1 }],
  },
  {
    id: "deal-2",
    title: "Tech Startup - Enterprise",
    value: 25000,
    contactId: "contact-2",
    responsibleId: "user-2",
    stage: "negotiation",
    probability: 85,
    expectedCloseDate: "2026-02-10",
    createdAt: "2026-01-10",
    tags: ["Enterprise", "Anual"],
    notes: "Negociação final",
    products: [{ name: "Plano Enterprise", price: 25000, quantity: 1 }],
  },
  {
    id: "deal-3",
    title: "E-commerce Solutions",
    value: 12000,
    contactId: "contact-3",
    responsibleId: "user-1",
    stage: "contact",
    probability: 50,
    expectedCloseDate: "2026-02-15",
    createdAt: "2026-01-08",
    tags: [],
    notes: "",
    products: [{ name: "Plano Profissional + Add-ons", price: 12000, quantity: 1 }],
  },
  {
    id: "deal-4",
    title: "Agência Digital",
    value: 8000,
    contactId: "contact-4",
    responsibleId: null,
    stage: "new",
    probability: 20,
    expectedCloseDate: "2026-02-20",
    createdAt: "2026-01-27",
    tags: ["Novo"],
    notes: "",
    products: [{ name: "Plano Profissional", price: 8000, quantity: 1 }],
  },
  {
    id: "deal-5",
    title: "Consultoria Pro",
    value: 15000,
    contactId: "contact-5",
    responsibleId: "user-3",
    stage: "proposal",
    probability: 60,
    expectedCloseDate: "2026-02-08",
    createdAt: "2026-01-20",
    tags: [],
    notes: "Proposta enviada",
    products: [{ name: "Plano Enterprise", price: 15000, quantity: 1 }],
  },
  {
    id: "deal-6",
    title: "Loja Virtual Pro - GANHO",
    value: 18000,
    contactId: "contact-3",
    responsibleId: "user-1",
    stage: "won",
    probability: 100,
    expectedCloseDate: "2026-01-25",
    createdAt: "2026-01-05",
    tags: ["Ganho"],
    notes: "Venda concluída!",
    products: [{ name: "Plano Enterprise", price: 18000, quantity: 1 }],
  },
];

const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Enviar proposta para Ana Costa",
    description: "Preparar e enviar proposta comercial completa",
    dueDate: "2026-01-28",
    priority: "high",
    completed: false,
    assigneeId: "user-1",
    relatedContactId: "contact-1",
    relatedDealId: "deal-1",
    createdAt: "2026-01-27T10:00:00",
    reminders: ["2026-01-28T09:00:00"],
  },
  {
    id: "task-2",
    title: "Ligar para Pedro Lima",
    description: "Follow-up sobre demonstração",
    dueDate: "2026-01-29",
    priority: "medium",
    completed: false,
    assigneeId: "user-2",
    relatedContactId: "contact-2",
    relatedDealId: "deal-2",
    createdAt: "2026-01-27T11:00:00",
    reminders: [],
  },
  {
    id: "task-3",
    title: "Revisar contrato E-commerce",
    description: "Verificar termos e condições",
    dueDate: "2026-01-28",
    priority: "low",
    completed: true,
    assigneeId: "user-1",
    relatedContactId: "contact-3",
    relatedDealId: "deal-3",
    createdAt: "2026-01-25T14:00:00",
    completedAt: "2026-01-27T16:00:00",
    reminders: [],
  },
  {
    id: "task-4",
    title: "Follow-up Tech Startup",
    description: "Verificar status da negociação",
    dueDate: "2026-01-29",
    priority: "high",
    completed: false,
    assigneeId: "user-2",
    relatedContactId: "contact-2",
    relatedDealId: "deal-2",
    createdAt: "2026-01-26T09:00:00",
    reminders: ["2026-01-29T10:00:00"],
  },
  {
    id: "task-5",
    title: "Atribuir responsável para Lucas",
    description: "Novo lead precisa de atendimento",
    dueDate: "2026-01-28",
    priority: "high",
    completed: false,
    assigneeId: "user-1",
    relatedContactId: "contact-4",
    relatedDealId: "deal-4",
    createdAt: "2026-01-27T17:00:00",
    reminders: [],
  },
];

// Dados financeiros configurados:
// Faturamento: R$ 52.500,00
// Saldo Atual: R$ 45.530,00
// Receita: R$ 6.970,00
// Margem: 86%
const initialTransactions: Transaction[] = [
  // RECEITAS (Total: R$ 52.500,00)
  {
    id: "trans-1",
    type: "income",
    category: "Vendas",
    description: "Projeto E-commerce Premium - Cliente Alpha",
    amount: 18500,
    date: "2026-01-05",
    status: "completed",
    paymentMethod: "Pix",
    relatedDealId: "deal-1",
    tags: ["enterprise", "projeto"],
    createdBy: "user-1",
  },
  {
    id: "trans-2",
    type: "income",
    category: "Vendas",
    description: "Sistema CRM Personalizado - Tech Corp",
    amount: 15000,
    date: "2026-01-10",
    status: "completed",
    paymentMethod: "Transferência",
    relatedDealId: "deal-2",
    tags: ["crm", "projeto"],
    createdBy: "user-1",
  },
  {
    id: "trans-3",
    type: "income",
    category: "Serviços",
    description: "Consultoria Mensal - Startup Beta",
    amount: 8500,
    date: "2026-01-15",
    status: "completed",
    paymentMethod: "Pix",
    relatedDealId: "deal-3",
    tags: ["consultoria", "mensal"],
    createdBy: "user-1",
  },
  {
    id: "trans-4",
    type: "income",
    category: "Serviços",
    description: "Manutenção e Suporte - Clientes Diversos",
    amount: 6500,
    date: "2026-01-20",
    status: "completed",
    paymentMethod: "Pix",
    tags: ["suporte", "mensal"],
    createdBy: "user-1",
  },
  {
    id: "trans-5",
    type: "income",
    category: "Vendas",
    description: "Landing Pages Premium - Marketing Agency",
    amount: 4000,
    date: "2026-01-22",
    status: "completed",
    paymentMethod: "Cartão de Crédito",
    tags: ["landing", "projeto"],
    createdBy: "user-1",
  },
  // DESPESAS (Total: R$ 6.970,00 para manter margem de 86%)
  {
    id: "trans-6",
    type: "expense",
    category: "Marketing",
    description: "Facebook & Google Ads - Janeiro",
    amount: 2200,
    date: "2026-01-08",
    status: "completed",
    paymentMethod: "Cartão de Crédito",
    tags: ["ads", "mensal"],
    createdBy: "user-1",
  },
  {
    id: "trans-7",
    type: "expense",
    category: "Software",
    description: "Assinaturas SaaS (Vercel, Supabase, etc)",
    amount: 1850,
    date: "2026-01-10",
    status: "completed",
    paymentMethod: "Cartão de Crédito",
    tags: ["saas", "mensal"],
    createdBy: "user-1",
  },
  {
    id: "trans-8",
    type: "expense",
    category: "Equipe",
    description: "Freelancer - Design e Desenvolvimento",
    amount: 1800,
    date: "2026-01-18",
    status: "completed",
    paymentMethod: "Pix",
    tags: ["freelancer", "projeto"],
    createdBy: "user-1",
  },
  {
    id: "trans-9",
    type: "expense",
    category: "Infraestrutura",
    description: "Servidores e Cloud Services",
    amount: 720,
    date: "2026-01-12",
    status: "completed",
    paymentMethod: "Cartão de Crédito",
    tags: ["cloud", "mensal"],
    createdBy: "user-1",
  },
  {
    id: "trans-10",
    type: "expense",
    category: "Operacional",
    description: "Despesas Administrativas",
    amount: 400,
    date: "2026-01-25",
    status: "completed",
    paymentMethod: "Pix",
    tags: ["admin", "mensal"],
    createdBy: "user-1",
  },
];

const initialNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "message",
    title: "Nova mensagem de Ana Costa",
    description: "Obrigada pelo atendimento!",
    read: false,
    timestamp: "2026-01-28T10:30:00",
    actionUrl: "/inbox/conv-1",
    relatedId: "conv-1",
  },
  {
    id: "notif-2",
    type: "deal",
    title: "Negócio em negociação",
    description: "Tech Startup - Enterprise está há 3 dias sem atualização",
    read: false,
    timestamp: "2026-01-28T09:00:00",
    actionUrl: "/pipeline/deal-2",
    relatedId: "deal-2",
  },
  {
    id: "notif-3",
    type: "task",
    title: "Tarefa vencendo hoje",
    description: "Enviar proposta para Ana Costa",
    read: true,
    timestamp: "2026-01-28T08:00:00",
    actionUrl: "/tasks/task-1",
    relatedId: "task-1",
  },
  {
    id: "notif-4",
    type: "mention",
    title: "Você foi mencionado",
    description: "Maria Silva te mencionou no chat de equipe",
    read: false,
    timestamp: "2026-01-28T07:30:00",
    relatedId: "team-msg-1",
  },
];

const initialTeamChannels: TeamChannel[] = [
  {
    id: "channel-general",
    name: "Geral",
    type: "general",
    members: ["user-1", "user-2", "user-3"],
    unreadCount: 2,
    lastMessage: "Bom dia equipe!",
    lastMessageTime: "2026-01-28T08:00:00",
  },
  {
    id: "channel-vendas",
    name: "Vendas",
    type: "private",
    members: ["user-1", "user-3"],
    unreadCount: 0,
    lastMessage: "Fechamos a venda da Loja Virtual!",
    lastMessageTime: "2026-01-25T16:00:00",
  },
  {
    id: "channel-suporte",
    name: "Suporte",
    type: "private",
    members: ["user-2"],
    unreadCount: 1,
    lastMessage: "Ticket #123 resolvido",
    lastMessageTime: "2026-01-27T17:00:00",
  },
];

const initialTeamMessages: TeamMessage[] = [
  {
    id: "team-msg-1",
    channelId: "channel-general",
    senderId: "user-2",
    content: "Bom dia equipe! @João Mídias, podemos conversar sobre o lead da Tech Startup?",
    timestamp: "2026-01-28T08:00:00",
    mentions: ["user-1"],
    reactions: [{ emoji: "👍", userIds: ["user-3"] }],
  },
  {
    id: "team-msg-2",
    channelId: "channel-general",
    senderId: "user-1",
    content: "Bom dia Maria! Claro, vamos marcar uma call às 10h?",
    timestamp: "2026-01-28T08:05:00",
    mentions: [],
    reactions: [],
  },
  {
    id: "team-msg-3",
    channelId: "channel-vendas",
    senderId: "user-1",
    content: "Fechamos a venda da Loja Virtual! R$ 18.000 no plano Enterprise! 🎉",
    timestamp: "2026-01-25T16:00:00",
    mentions: [],
    reactions: [
      { emoji: "🎉", userIds: ["user-3"] },
      { emoji: "💪", userIds: ["user-3"] },
    ],
  },
];

const initialWorkflows: Workflow[] = [
  {
    id: "workflow-1",
    name: "Boas-vindas Automático",
    description: "Envia mensagem de boas-vindas para novos leads",
    status: "active",
    nodes: [
      {
        id: "node-1",
        type: "trigger",
        title: "Novo Lead",
        config: { channel: "all" },
        position: { x: 100, y: 100 },
        connections: ["node-2"],
      },
      {
        id: "node-2",
        type: "message",
        title: "Enviar Boas-vindas",
        config: { message: "Olá {nome}! Bem-vindo à Primo CRM!" },
        position: { x: 100, y: 250 },
        connections: [],
      },
    ],
    createdAt: "2026-01-15",
    lastModified: "2026-01-25",
    triggers: 1250,
  },
  {
    id: "workflow-2",
    name: "Qualificação de Lead",
    description: "Fluxo de qualificação com perguntas automáticas",
    status: "active",
    nodes: [],
    createdAt: "2026-01-10",
    lastModified: "2026-01-24",
    triggers: 890,
  },
  {
    id: "workflow-3",
    name: "Follow-up Pós-Venda",
    description: "Sequência de mensagens após fechamento",
    status: "paused",
    nodes: [],
    createdAt: "2026-01-05",
    lastModified: "2026-01-20",
    triggers: 456,
  },
];

const initialAIAgents: AIAgent[] = [
  {
    id: "agent-1",
    name: "Vendedor Virtual",
    description: "Especialista em vendas e negociações",
    model: "gpt-4-turbo",
    status: "active",
    conversations: 1250,
    successRate: 92,
    avatar: "🤖",
    personality: "Profissional e persuasivo",
    capabilities: ["Qualificação de leads", "Apresentação de produtos", "Negociação", "Follow-up"],
    systemPrompt: "Você é um assistente de vendas especializado. Seja profissional, persuasivo e sempre foque em entender as necessidades do cliente.",
    temperature: 0.7,
    apiKeyConfigured: false,
  },
  {
    id: "agent-2",
    name: "Suporte Técnico",
    description: "Resolve dúvidas e problemas técnicos",
    model: "gpt-4",
    status: "active",
    conversations: 890,
    successRate: 88,
    avatar: "🛠️",
    personality: "Técnico e paciente",
    capabilities: ["Troubleshooting", "FAQ", "Tutoriais", "Escalonamento"],
    systemPrompt: "Você é um assistente de suporte técnico. Seja paciente, técnico e sempre ofereça soluções claras.",
    temperature: 0.5,
    apiKeyConfigured: false,
  },
];

const initialPipelineStages: PipelineStage[] = [
  { id: "new", name: "Novo Lead", color: "#3b82f6", order: 1 },
  { id: "contact", name: "Contato Feito", color: "#8b5cf6", order: 2 },
  { id: "proposal", name: "Proposta Enviada", color: "#f59e0b", order: 3 },
  { id: "negotiation", name: "Negociação", color: "#10b981", order: 4 },
  { id: "won", name: "Ganho", color: "#059669", order: 5 },
  { id: "lost", name: "Perdido", color: "#ef4444", order: 6 },
];

// Store Interface
interface CRMStore {
  // Current User
  currentUser: User;
  setCurrentUser: (user: User) => void;

  // Users
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;

  // Contacts
  contacts: Contact[];
  addContact: (contact: Contact) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  // Conversations
  conversations: Conversation[];
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  addMessage: (conversationId: string, message: Message) => void;
  markAsRead: (conversationId: string) => void;

  // Deals
  deals: Deal[];
  addDeal: (deal: Deal) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  moveDealToStage: (dealId: string, stage: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;

  // Team Chat
  teamChannels: TeamChannel[];
  teamMessages: TeamMessage[];
  addTeamMessage: (message: TeamMessage) => void;
  addReaction: (messageId: string, emoji: string, userId: string) => void;

  // Workflows
  workflows: Workflow[];
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;

  // AI Agents
  aiAgents: AIAgent[];
  addAIAgent: (agent: AIAgent) => void;
  updateAIAgent: (id: string, updates: Partial<AIAgent>) => void;
  deleteAIAgent: (id: string) => void;

  // Pipeline Stages
  pipelineStages: PipelineStage[];
  addPipelineStage: (stage: PipelineStage) => void;
  updatePipelineStage: (id: string, updates: Partial<PipelineStage>) => void;

  // Settings
  settings: {
    companyName: string;
    timezone: string;
    language: string;
    currency: string;
    openaiApiKey: string;
    whatsappConnected: boolean;
    instagramConnected: boolean;
    facebookConnected: boolean;
    emailConnected: boolean;
  };
  updateSettings: (updates: Partial<CRMStore["settings"]>) => void;

  // Search
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
}

export const useCRMStore = create<CRMStore>()(
  persist(
    (set, get) => ({
      // Current User
      currentUser: initialUsers[0],
      setCurrentUser: (user) => set({ currentUser: user }),

      // Users
      users: initialUsers,
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        })),

      // Contacts
      contacts: initialContacts,
      addContact: (contact) => set((state) => ({ contacts: [...state.contacts, contact] })),
      updateContact: (id, updates) =>
        set((state) => ({
          contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      deleteContact: (id) =>
        set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) })),

      // Conversations
      conversations: initialConversations,
      addConversation: (conversation) =>
        set((state) => ({ conversations: [...state.conversations, conversation] })),
      updateConversation: (id, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      addMessage: (conversationId, message) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  lastMessage: message.content,
                  lastMessageTime: message.timestamp,
                }
              : c
          ),
        })),
      markAsRead: (conversationId) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          ),
        })),

      // Deals
      deals: initialDeals,
      addDeal: (deal) => set((state) => ({ deals: [...state.deals, deal] })),
      updateDeal: (id, updates) =>
        set((state) => ({
          deals: state.deals.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),
      deleteDeal: (id) => set((state) => ({ deals: state.deals.filter((d) => d.id !== id) })),
      moveDealToStage: (dealId, stage) =>
        set((state) => ({
          deals: state.deals.map((d) => (d.id === dealId ? { ...d, stage } : d)),
        })),

      // Tasks
      tasks: initialTasks,
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      toggleTaskComplete: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString() : undefined,
                }
              : t
          ),
        })),

      // Transactions
      transactions: initialTransactions,
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            {
              ...transaction,
              id: transaction.id || `trans-${Date.now()}`,
              tags: transaction.tags || [],
              createdBy: transaction.createdBy || state.currentUser.id,
            },
          ],
        })),
      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTransaction: (id) =>
        set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) })),

      // Notifications
      notifications: initialNotifications,
      addNotification: (notification) =>
        set((state) => ({ notifications: [notification, ...state.notifications] })),
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      deleteNotification: (id) =>
        set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),

      // Team Chat
      teamChannels: initialTeamChannels,
      teamMessages: initialTeamMessages,
      addTeamMessage: (message) =>
        set((state) => ({ teamMessages: [...state.teamMessages, message] })),
      addReaction: (messageId, emoji, userId) =>
        set((state) => ({
          teamMessages: state.teamMessages.map((m) => {
            if (m.id !== messageId) return m;
            const existingReaction = m.reactions.find((r) => r.emoji === emoji);
            if (existingReaction) {
              if (existingReaction.userIds.includes(userId)) {
                return {
                  ...m,
                  reactions: m.reactions.map((r) =>
                    r.emoji === emoji
                      ? { ...r, userIds: r.userIds.filter((id) => id !== userId) }
                      : r
                  ),
                };
              }
              return {
                ...m,
                reactions: m.reactions.map((r) =>
                  r.emoji === emoji ? { ...r, userIds: [...r.userIds, userId] } : r
                ),
              };
            }
            return {
              ...m,
              reactions: [...m.reactions, { emoji, userIds: [userId] }],
            };
          }),
        })),

      // Workflows
      workflows: initialWorkflows,
      addWorkflow: (workflow) => set((state) => ({ workflows: [...state.workflows, workflow] })),
      updateWorkflow: (id, updates) =>
        set((state) => ({
          workflows: state.workflows.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        })),
      deleteWorkflow: (id) =>
        set((state) => ({ workflows: state.workflows.filter((w) => w.id !== id) })),

      // AI Agents
      aiAgents: initialAIAgents,
      addAIAgent: (agent) => set((state) => ({ aiAgents: [...state.aiAgents, agent] })),
      updateAIAgent: (id, updates) =>
        set((state) => ({
          aiAgents: state.aiAgents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),
      deleteAIAgent: (id) =>
        set((state) => ({ aiAgents: state.aiAgents.filter((a) => a.id !== id) })),

      // Pipeline Stages
      pipelineStages: initialPipelineStages,
      addPipelineStage: (stage) =>
        set((state) => ({ pipelineStages: [...state.pipelineStages, stage] })),
      updatePipelineStage: (id, updates) =>
        set((state) => ({
          pipelineStages: state.pipelineStages.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      // Settings
      settings: {
        companyName: "Primo CRM",
        timezone: "America/Sao_Paulo",
        language: "pt-BR",
        currency: "BRL",
        openaiApiKey: "",
        whatsappConnected: false,
        instagramConnected: false,
        facebookConnected: false,
        emailConnected: true,
      },
      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),

      // Search
      globalSearch: "",
      setGlobalSearch: (search) => set({ globalSearch: search }),
    }),
    {
      name: "primo-crm-storage",
      partialize: (state) => ({
        contacts: state.contacts,
        conversations: state.conversations,
        deals: state.deals,
        tasks: state.tasks,
        transactions: state.transactions,
        workflows: state.workflows,
        aiAgents: state.aiAgents,
        settings: state.settings,
        pipelineStages: state.pipelineStages,
      }),
    }
  )
);
