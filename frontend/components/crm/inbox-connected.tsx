"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Phone,
  Video,
  Star,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  MessageCircle,
  MessageSquare,
  Mail,
  UserPlus,
  Clock,
  Check,
  CheckCheck,
  X,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  status?: string;
  company?: string;
  tags?: string[];
  createdAt?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: "user" | "contact";
  content: string;
  timestamp: string;
  status?: string;
}

interface Conversation {
  id: string;
  contact_id: string;
  channel: string;
  status: string;
  unread_count: number;
  last_message: string;
  last_message_time: string;
  responsible_id?: string;
  contact?: Contact;
  messages?: Message[];
}

interface InboxConnectedProps {
  onOpenContact: (contactId: string) => void;
}

export function InboxConnected({ onOpenContact }: InboxConnectedProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "pending" | "closed">("all");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const companyId = typeof window !== 'undefined' ? localStorage.getItem('company_id') || 'default-company' : 'default-company';

  // Fetch conversations from API
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/api/crm/conversations`, {
        headers: { 'x-company-id': companyId }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, companyId]);

  // Fetch single conversation with messages
  const fetchConversation = useCallback(async (convId: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/crm/conversations/${convId}`, {
        headers: { 'x-company-id': companyId }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedConv(data);
        
        // Mark as read
        await fetch(`${backendUrl}/api/crm/conversations/${convId}/read`, {
          method: 'PUT',
          headers: { 'x-company-id': companyId }
        });
        
        // Update local state
        setConversations(prev => prev.map(c => 
          c.id === convId ? { ...c, unread_count: 0 } : c
        ));
      }
    } catch (error) {
      console.error('Erro ao buscar conversa:', error);
    }
  }, [backendUrl, companyId]);

  // Initialize Socket.IO for real-time updates
  useEffect(() => {
    // WhatsApp service runs on port 3001 locally
    // In production, this should be configured via environment variable
    const wsUrl = process.env.NEXT_PUBLIC_WHATSAPP_WS_URL || 'http://localhost:3001';
    
    const socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket.IO conectado ao WhatsApp Service');
      setSocketConnected(true);
      socket.emit('join-company', companyId);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO desconectado');
      setSocketConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.log('Erro de conexao Socket.IO:', error.message);
      setSocketConnected(false);
    });

    // Real-time message handler
    socket.on('whatsapp:message', (data) => {
      console.log('Nova mensagem WhatsApp:', data);
      // Refresh conversations
      fetchConversations();
      // If viewing the conversation, refresh it
      if (selectedConvId) {
        fetchConversation(selectedConvId);
      }
    });

    socket.on('whatsapp:chat_sync', (data) => {
      console.log('Chat sincronizado:', data);
      fetchConversations();
    });

    socket.on('whatsapp:status', (data) => {
      console.log('Status WhatsApp:', data);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [companyId, fetchConversations, fetchConversation, selectedConvId]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load conversation when selected
  useEffect(() => {
    if (selectedConvId) {
      fetchConversation(selectedConvId);
    }
  }, [selectedConvId, fetchConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages]);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return <MessageCircle className="h-4 w-4 text-emerald-500" />;
      case "instagram":
        return (
          <svg className="h-4 w-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.689-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        );
      case "email":
        return <Mail className="h-4 w-4 text-zinc-400" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const contact = conv.contact;
    if (!contact) return true;

    const matchesSearch =
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === "all" || conv.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConvId || sending) return;

    setSending(true);
    try {
      const response = await fetch(`${backendUrl}/api/crm/conversations/${selectedConvId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-company-id': companyId
        },
        body: JSON.stringify({ content: newMessage.trim() })
      });

      if (response.ok) {
        setNewMessage("");
        // Refresh conversation
        await fetchConversation(selectedConvId);
        await fetchConversations();
      } else {
        const error = await response.json();
        alert(`Erro ao enviar: ${error.detail || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Verifique se o WhatsApp está conectado.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hoje";
    if (date.toDateString() === yesterday.toDateString()) return "Ontem";
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  const selectedContact = selectedConv?.contact;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Conversation List */}
      <div className="flex h-full w-80 flex-shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground">Inbox</h2>
              {socketConnected ? (
                <Wifi className="h-4 w-4 text-emerald-500" title="Conectado em tempo real" />
              ) : (
                <WifiOff className="h-4 w-4 text-zinc-500" title="Desconectado" />
              )}
            </div>
            <button
              onClick={fetchConversations}
              className="p-1.5 rounded hover:bg-secondary"
              title="Atualizar"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="flex-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">Todas</option>
              <option value="open">Abertas</option>
              <option value="pending">Pendentes</option>
              <option value="closed">Fechadas</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">Nenhuma conversa encontrada</p>
              <p className="text-xs mt-2">Conecte o WhatsApp em Integrações para receber mensagens</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const contact = conv.contact;

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  data-testid={`conversation-item-${conv.id}`}
                  className={`cursor-pointer border-b border-border/50 p-4 transition-colors ${
                    selectedConvId === conv.id
                      ? "border-l-2 border-l-primary bg-primary/10"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/40 font-semibold text-primary">
                        {contact?.avatar || contact?.name?.substring(0, 2).toUpperCase() || "?"}
                      </div>
                      {/* Channel icon badge - WhatsApp icon on avatar */}
                      <div 
                        className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border shadow-sm"
                        data-testid={`channel-badge-${conv.channel}`}
                      >
                        {getChannelIcon(conv.channel)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-foreground">
                            {contact?.name || "Contato"}
                          </span>
                          {/* Pipeline stage badge */}
                          {contact?.pipeline_stage && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              contact.pipeline_stage === 'novo_lead' ? 'bg-blue-500/20 text-blue-400' :
                              contact.pipeline_stage === 'contato_feito' ? 'bg-cyan-500/20 text-cyan-400' :
                              contact.pipeline_stage === 'proposta_enviada' ? 'bg-amber-500/20 text-amber-400' :
                              contact.pipeline_stage === 'negociacao' ? 'bg-orange-500/20 text-orange-400' :
                              contact.pipeline_stage === 'ganho' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-zinc-500/20 text-zinc-400'
                            }`}>
                              {contact.pipeline_stage === 'novo_lead' ? 'Novo' :
                               contact.pipeline_stage === 'contato_feito' ? 'Contato' :
                               contact.pipeline_stage === 'proposta_enviada' ? 'Proposta' :
                               contact.pipeline_stage === 'negociacao' ? 'Negociação' :
                               contact.pipeline_stage === 'ganho' ? 'Ganho' :
                               contact.pipeline_stage}
                            </span>
                          )}
                        </div>
                        <span className="ml-2 flex-shrink-0 text-xs text-muted-foreground">
                          {formatDate(conv.last_message_time)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm text-muted-foreground">{conv.last_message}</p>
                        <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                          {getChannelIcon(conv.channel)}
                          {conv.unread_count > 0 && (
                            <span className="min-w-[20px] rounded-full bg-primary px-1.5 py-0.5 text-center text-xs font-semibold text-primary-foreground">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConv && selectedContact ? (
        <>
          <div className="flex flex-1 flex-col bg-background">
            {/* Chat Header */}
            <div className="border-b border-border bg-card px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/40 font-semibold text-primary"
                    onClick={() => onOpenContact(selectedContact.id)}
                  >
                    {selectedContact.avatar || selectedContact.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3
                      className="cursor-pointer font-semibold text-foreground hover:text-primary"
                      onClick={() => onOpenContact(selectedContact.id)}
                    >
                      {selectedContact.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {getChannelIcon(selectedConv.channel)}
                      <span>{selectedContact.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="rounded p-2 hover:bg-secondary">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <button className="rounded p-2 hover:bg-secondary">
                    <Video className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <button className="rounded p-2 hover:bg-secondary">
                    <Star className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {selectedConv.messages?.map((msg, index) => {
                const isMe = msg.sender_type === "user";
                const showDate =
                  index === 0 ||
                  new Date(msg.timestamp).toDateString() !==
                    new Date(selectedConv.messages![index - 1].timestamp).toDateString();

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="my-4 flex items-center justify-center">
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                          {formatDate(msg.timestamp)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-md rounded-2xl px-4 py-2 ${
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-card-foreground shadow-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <div
                          className={`mt-1 flex items-center justify-end gap-1 ${
                            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          <span className="text-xs">{formatTime(msg.timestamp)}</span>
                          {isMe && (
                            <>
                              {msg.status === "read" ? (
                                <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
                              ) : msg.status === "delivered" ? (
                                <CheckCheck className="h-3.5 w-3.5" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-border bg-card p-4">
              <div className="flex items-end gap-2">
                <button className="rounded p-2 hover:bg-secondary">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                </button>
                <div className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Digite sua mensagem..."
                    rows={1}
                    className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    disabled={sending}
                  />
                </div>
                <button className="rounded p-2 hover:bg-secondary">
                  <Smile className="h-5 w-5 text-muted-foreground" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="rounded bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Contact Sidebar */}
          <div className="w-80 overflow-y-auto border-l border-border bg-card">
            <div className="p-6">
              <div className="mb-6 text-center">
                <div
                  className="mx-auto mb-3 flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/40 text-2xl font-bold text-primary"
                  onClick={() => onOpenContact(selectedContact.id)}
                >
                  {selectedContact.avatar || selectedContact.name?.substring(0, 2).toUpperCase()}
                </div>
                <h3
                  className="cursor-pointer text-lg font-semibold text-foreground hover:text-primary"
                  onClick={() => onOpenContact(selectedContact.id)}
                >
                  {selectedContact.name}
                </h3>
              </div>

              <div className="space-y-4">
                {selectedContact.phone && (
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                      Telefone
                    </label>
                    <p className="mt-1 text-sm text-foreground">{selectedContact.phone}</p>
                  </div>
                )}

                {selectedContact.email && (
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-foreground">{selectedContact.email}</p>
                  </div>
                )}

                {selectedContact.company && (
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                      Empresa
                    </label>
                    <p className="mt-1 text-sm text-foreground">{selectedContact.company}</p>
                  </div>
                )}

                {/* Pipeline Stage Selector */}
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Estágio do Funil
                  </label>
                  <select
                    data-testid="pipeline-stage-selector"
                    value={selectedContact.pipeline_stage || 'novo_lead'}
                    onChange={async (e) => {
                      const newStage = e.target.value;
                      try {
                        await fetch(`${backendUrl}/api/crm/contacts/${selectedContact.id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'x-company-id': companyId
                          },
                          body: JSON.stringify({ pipeline_stage: newStage })
                        });
                        // Update local state
                        setSelectedConv(prev => prev ? {
                          ...prev,
                          contact: { ...prev.contact!, pipeline_stage: newStage }
                        } : null);
                        fetchConversations();
                      } catch (e) {
                        console.error('Erro ao atualizar estágio:', e);
                      }
                    }}
                    className="mt-2 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="novo_lead">🔵 Novo Lead</option>
                    <option value="contato_feito">🟢 Contato Feito</option>
                    <option value="proposta_enviada">🟡 Proposta Enviada</option>
                    <option value="negociacao">🟠 Em Negociação</option>
                    <option value="ganho">✅ Ganho</option>
                    <option value="perdido">❌ Perdido</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Tags
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedContact.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-primary/20 px-2 py-1 text-xs font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Respostas Rapidas
                  </label>
                  <div className="mt-2 space-y-2">
                    {[
                      "Ola! Como posso ajudar?",
                      "Obrigado pelo contato!",
                      "Vou verificar e retorno em breve.",
                    ].map((reply) => (
                      <button
                        key={reply}
                        onClick={() => setNewMessage(reply)}
                        className="w-full rounded-lg border border-border px-3 py-2 text-left text-xs text-muted-foreground hover:border-primary hover:text-primary"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onOpenContact(selectedContact.id)}
                  className="w-full rounded-lg border border-border py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Ver perfil completo
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center bg-background">
          <div className="text-center">
            <MessageSquare className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <p className="text-muted-foreground">Selecione uma conversa para começar</p>
            <p className="text-xs text-muted-foreground mt-2">
              Ou conecte o WhatsApp em Integrações para receber mensagens
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
