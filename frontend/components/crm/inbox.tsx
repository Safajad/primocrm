"use client";

import { useState, useRef, useEffect } from "react";
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
  Tag,
  Clock,
  Check,
  CheckCheck,
  X,
  ChevronDown,
} from "lucide-react";
import { useCRMStore, type Message } from "@/lib/store";

interface InboxProps {
  onOpenContact: (contactId: string) => void;
}

export function Inbox({ onOpenContact }: InboxProps) {
  const {
    conversations,
    contacts,
    users,
    currentUser,
    addMessage,
    markAsRead,
    updateConversation,
  } = useCRMStore();

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "pending" | "closed">("all");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);
  const selectedContact = selectedConv
    ? contacts.find((c) => c.id === selectedConv.contactId)
    : null;

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages]);

  // Mark as read when selecting conversation
  useEffect(() => {
    if (selectedConvId) {
      markAsRead(selectedConvId);
    }
  }, [selectedConvId, markAsRead]);

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
      case "facebook":
        return (
          <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case "email":
        return <Mail className="h-4 w-4 text-zinc-400" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const contact = contacts.find((c) => c.id === conv.contactId);
    if (!contact) return false;

    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === "all" || conv.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConvId) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConvId,
      senderId: currentUser.id,
      senderType: "user",
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    addMessage(selectedConvId, message);
    setNewMessage("");
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

  const getResponsible = (id: string | null) => users.find((u) => u.id === id);

  return (
    <div className="flex h-full">
      {/* Conversation List */}
      <div className="flex h-full w-80 flex-shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border p-4">
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
            <button className="rounded-lg p-1.5 hover:bg-secondary">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const contact = contacts.find((c) => c.id === conv.contactId);
              if (!contact) return null;

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`cursor-pointer border-b border-border/50 p-4 transition-colors ${
                    selectedConvId === conv.id
                      ? "border-l-2 border-l-primary bg-primary/10"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/40 font-semibold text-primary">
                        {contact.avatar}
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${
                          contact.status === "online"
                            ? "bg-emerald-500"
                            : contact.status === "away"
                              ? "bg-amber-500"
                              : "bg-zinc-500"
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {contact.name}
                        </span>
                        <span className="ml-2 flex-shrink-0 text-xs text-muted-foreground">
                          {formatDate(conv.lastMessageTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm text-muted-foreground">{conv.lastMessage}</p>
                        <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                          {getChannelIcon(conv.channel)}
                          {conv.unreadCount > 0 && (
                            <span className="min-w-[20px] rounded-full bg-primary px-1.5 py-0.5 text-center text-xs font-semibold text-primary-foreground">
                              {conv.unreadCount}
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
                    {selectedContact.avatar}
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
                      <span>
                        {selectedContact.status === "online" ? "Online" : "Offline"}
                      </span>
                      {selectedConv.responsibleId && (
                        <>
                          <span>•</span>
                          <span>Resp: {getResponsible(selectedConv.responsibleId)?.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="rounded p-2 hover:bg-secondary"
                    title="Atribuir responsável"
                  >
                    <UserPlus className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <button className="rounded p-2 hover:bg-secondary">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <button className="rounded p-2 hover:bg-secondary">
                    <Video className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <button className="rounded p-2 hover:bg-secondary">
                    <Star className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <button className="rounded p-2 hover:bg-secondary">
                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {selectedConv.messages.map((msg, index) => {
                const isMe = msg.senderType === "user";
                const showDate =
                  index === 0 ||
                  new Date(msg.timestamp).toDateString() !==
                    new Date(selectedConv.messages[index - 1].timestamp).toDateString();

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
                  />
                </div>
                <button className="rounded p-2 hover:bg-secondary">
                  <Smile className="h-5 w-5 text-muted-foreground" />
                </button>
                <button
                  onClick={handleSendMessage}
                  className="rounded bg-primary p-2 text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="h-5 w-5" />
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
                  {selectedContact.avatar}
                </div>
                <h3
                  className="cursor-pointer text-lg font-semibold text-foreground hover:text-primary"
                  onClick={() => onOpenContact(selectedContact.id)}
                >
                  {selectedContact.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cliente desde{" "}
                  {new Date(selectedContact.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Telefone
                  </label>
                  <p className="mt-1 text-sm text-foreground">{selectedContact.phone}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-foreground">{selectedContact.email}</p>
                </div>

                {selectedContact.company && (
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                      Empresa
                    </label>
                    <p className="mt-1 text-sm text-foreground">{selectedContact.company}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Tags
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedContact.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-primary/20 px-2 py-1 text-xs font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                    <button className="rounded border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary">
                      + Adicionar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Responsavel
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    {selectedConv.responsibleId ? (
                      <>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground">
                          {getResponsible(selectedConv.responsibleId)?.avatar}
                        </div>
                        <span className="text-sm text-foreground">
                          {getResponsible(selectedConv.responsibleId)?.name}
                        </span>
                        <button
                          onClick={() => setShowAssignModal(true)}
                          className="ml-auto text-xs text-primary hover:text-primary/80"
                        >
                          Alterar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="text-sm text-primary hover:text-primary/80"
                      >
                        Atribuir responsavel
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Status da Conversa
                  </label>
                  <div className="mt-2">
                    <select
                      value={selectedConv.status}
                      onChange={(e) => updateConversation(selectedConv.id, { status: e.target.value as "open" | "pending" | "closed" })}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="open">Aberta</option>
                      <option value="pending">Pendente</option>
                      <option value="closed">Fechada</option>
                    </select>
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
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedConvId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Atribuir Responsável</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="rounded p-1 hover:bg-secondary"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    updateConversation(selectedConvId, { responsibleId: user.id });
                    setShowAssignModal(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary ${
                    selectedConv?.responsibleId === user.id ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/40 font-semibold text-primary">
                    {user.avatar}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.department}</p>
                  </div>
                  <div
                    className={`h-3 w-3 rounded-full ${
                      user.status === "online"
                        ? "bg-emerald-500"
                        : user.status === "away"
                          ? "bg-amber-500"
                          : "bg-zinc-500"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
