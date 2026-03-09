"use client";

import { useState } from "react";
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  Instagram,
  Facebook,
  Send,
  Edit,
  Save,
  Trash2,
  Plus,
  Tag,
  Target,
  DollarSign,
  Calendar,
  Clock,
  User,
  Building,
  FileText,
  CheckSquare,
  ChevronDown,
  ExternalLink,
  MoreVertical,
  ArrowRight,
} from "lucide-react";
import { useCRMStore, type Contact, type Deal, type Task, type Transaction } from "@/lib/store";

interface ContactProfileProps {
  contactId: string;
  onClose: () => void;
}

export function ContactProfile({ contactId, onClose }: ContactProfileProps) {
  const {
    contacts,
    updateContact,
    deleteContact,
    users,
    deals,
    addDeal,
    updateDeal,
    deleteDeal,
    tasks,
    addTask,
    conversations,
    transactions,
    addTransaction,
    pipelineStages,
    addNotification,
  } = useCRMStore();

  const contact = contacts.find((c) => c.id === contactId);
  const contactDeals = deals.filter((d) => d.contactId === contactId);
  const contactTasks = tasks.filter((t) => t.relatedContactId === contactId);
  const contactConversations = conversations.filter((c) => c.contactId === contactId);
  const contactTransactions = transactions.filter((t) =>
    contactDeals.some((d) => d.id === t.relatedDealId)
  );

  const [activeTab, setActiveTab] = useState<"overview" | "deals" | "tasks" | "history" | "notes">("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState<Contact | null>(contact || null);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTag, setNewTag] = useState("");

  // New deal form
  const [newDeal, setNewDeal] = useState({
    title: "",
    value: 0,
    stage: "new",
    expectedCloseDate: "",
    notes: "",
  });

  // New task form
  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as "high" | "medium" | "low",
  });

  if (!contact) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Contato nao encontrado</p>
      </div>
    );
  }

  const responsible = users.find((u) => u.id === contact.responsibleId);

  const handleSaveContact = () => {
    if (editedContact) {
      updateContact(contactId, editedContact);
      setIsEditing(false);
    }
  };

  const handleAddTag = () => {
    if (newTag && editedContact && !editedContact.tags.includes(newTag)) {
      setEditedContact({
        ...editedContact,
        tags: [...editedContact.tags, newTag],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (editedContact) {
      setEditedContact({
        ...editedContact,
        tags: editedContact.tags.filter((t) => t !== tag),
      });
    }
  };

  const handleCreateDeal = () => {
    const deal: Deal = {
      id: `deal-${Date.now()}`,
      title: newDeal.title || `${contact.name} - Novo Negocio`,
      value: newDeal.value,
      contactId: contact.id,
      responsibleId: contact.responsibleId,
      stage: newDeal.stage,
      probability: 20,
      expectedCloseDate: newDeal.expectedCloseDate || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
      tags: [],
      notes: newDeal.notes,
      products: [],
    };
    addDeal(deal);
    setShowAddDeal(false);
    setNewDeal({ title: "", value: 0, stage: "new", expectedCloseDate: "", notes: "" });

    addNotification({
      id: `notif-${Date.now()}`,
      type: "deal",
      title: "Novo negocio criado",
      description: `${deal.title} foi adicionado ao pipeline`,
      read: false,
      timestamp: new Date().toISOString(),
      relatedId: deal.id,
    });
  };

  const handleCreateTask = () => {
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTaskForm.title,
      description: newTaskForm.description,
      dueDate: newTaskForm.dueDate,
      priority: newTaskForm.priority,
      completed: false,
      assigneeId: contact.responsibleId,
      relatedContactId: contact.id,
      relatedDealId: null,
      createdAt: new Date().toISOString(),
      reminders: [],
    };
    addTask(task);
    setShowAddTask(false);
    setNewTaskForm({ title: "", description: "", dueDate: "", priority: "medium" });
  };

  const handleWinDeal = (deal: Deal) => {
    updateDeal(deal.id, { stage: "won", probability: 100 });

    // Create income transaction
    const transaction: Transaction = {
      id: `trans-${Date.now()}`,
      type: "income",
      category: "Vendas",
      description: deal.title,
      amount: deal.value,
      date: new Date().toISOString().split("T")[0],
      status: "completed",
      paymentMethod: "Pix",
      relatedDealId: deal.id,
      tags: ["venda"],
      createdBy: contact.responsibleId || "user-1",
    };
    addTransaction(transaction);

    addNotification({
      id: `notif-${Date.now()}`,
      type: "deal",
      title: "Negocio ganho!",
      description: `${deal.title} - R$ ${deal.value.toLocaleString()}`,
      read: false,
      timestamp: new Date().toISOString(),
      relatedId: deal.id,
    });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  const totalDealValue = contactDeals.reduce((sum, d) => sum + d.value, 0);
  const wonDealsValue = contactDeals.filter((d) => d.stage === "won").reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/40 text-lg font-semibold text-primary">
                {contact.avatar}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-card ${
                  contact.status === "online"
                    ? "bg-emerald-500"
                    : contact.status === "away"
                      ? "bg-amber-500"
                      : "bg-zinc-500"
                }`}
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{contact.name}</h1>
              <p className="text-sm text-muted-foreground">
                {contact.company || contact.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Phone className="h-4 w-4" />
          </button>
          <button className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Mail className="h-4 w-4" />
          </button>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {getChannelIcon(contact.channel)}
            <span className="ml-2">Enviar Mensagem</span>
          </button>
          <button className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-card px-6">
        <nav className="flex gap-1">
          {[
            { id: "overview", label: "Visao Geral" },
            { id: "deals", label: `Negocios (${contactDeals.length})` },
            { id: "tasks", label: `Tarefas (${contactTasks.length})` },
            { id: "history", label: "Historico" },
            { id: "notes", label: "Notas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Valor Total em Negocios</p>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {totalDealValue.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Vendas Realizadas</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    R$ {wonDealsValue.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Conversas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {contactConversations.length}
                  </p>
                </div>
              </div>

              {/* Contact Details */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Informacoes do Contato</h3>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedContact(contact);
                        }}
                        className="rounded-lg border border-border px-3 py-1 text-sm text-foreground hover:bg-secondary"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveContact}
                        className="rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
                      >
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditedContact(contact);
                      }}
                      className="rounded-lg border border-border px-3 py-1 text-sm text-foreground hover:bg-secondary"
                    >
                      <Edit className="mr-1 inline h-3 w-3" />
                      Editar
                    </button>
                  )}
                </div>

                {isEditing && editedContact ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-muted-foreground">Nome</label>
                      <input
                        type="text"
                        value={editedContact.name}
                        onChange={(e) => setEditedContact({ ...editedContact, name: e.target.value })}
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-muted-foreground">Email</label>
                      <input
                        type="email"
                        value={editedContact.email}
                        onChange={(e) => setEditedContact({ ...editedContact, email: e.target.value })}
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-muted-foreground">Telefone</label>
                      <input
                        type="tel"
                        value={editedContact.phone}
                        onChange={(e) => setEditedContact({ ...editedContact, phone: e.target.value })}
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-muted-foreground">Empresa</label>
                      <input
                        type="text"
                        value={editedContact.company || ""}
                        onChange={(e) => setEditedContact({ ...editedContact, company: e.target.value })}
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm text-muted-foreground">Responsavel</label>
                      <select
                        value={editedContact.responsibleId || ""}
                        onChange={(e) => setEditedContact({ ...editedContact, responsibleId: e.target.value || null })}
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="">Nenhum</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm text-muted-foreground">Tags</label>
                      <div className="mb-2 flex flex-wrap gap-2">
                        {editedContact.tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Nova tag..."
                          className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                          onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                        />
                        <button
                          onClick={handleAddTag}
                          className="rounded-lg bg-secondary px-3 py-2 text-foreground hover:bg-secondary/80"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm text-foreground">{contact.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Telefone</p>
                          <p className="text-sm text-foreground">{contact.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Empresa</p>
                          <p className="text-sm text-foreground">{contact.company || "-"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Responsavel</p>
                          <p className="text-sm text-foreground">{responsible?.name || "Nao atribuido"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getChannelIcon(contact.channel)}
                        <div>
                          <p className="text-xs text-muted-foreground">Canal</p>
                          <p className="text-sm capitalize text-foreground">{contact.channel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Criado em</p>
                          <p className="text-sm text-foreground">
                            {new Date(contact.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                    {contact.tags.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs text-muted-foreground">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {contact.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Deals */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Negocios Recentes</h3>
                  <button
                    onClick={() => setShowAddDeal(true)}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Negocio
                  </button>
                </div>
                {contactDeals.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Nenhum negocio registrado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {contactDeals.slice(0, 3).map((deal) => {
                      const stage = pipelineStages.find((s) => s.id === deal.stage);
                      return (
                        <div
                          key={deal.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: stage?.color }}
                            />
                            <div>
                              <p className="font-medium text-foreground">{deal.title}</p>
                              <p className="text-sm text-muted-foreground">{stage?.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              R$ {deal.value.toLocaleString()}
                            </p>
                            {deal.stage !== "won" && deal.stage !== "lost" && (
                              <button
                                onClick={() => handleWinDeal(deal)}
                                className="text-xs text-emerald-500 hover:text-emerald-400"
                              >
                                Marcar como Ganho
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 font-semibold text-foreground">Acoes Rapidas</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowAddDeal(true)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary"
                  >
                    <Target className="h-4 w-4 text-emerald-500" />
                    Criar Negocio
                  </button>
                  <button
                    onClick={() => setShowAddTask(true)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary"
                  >
                    <CheckSquare className="h-4 w-4 text-amber-500" />
                    Criar Tarefa
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Agendar Reuniao
                  </button>
                </div>
              </div>

              {/* Upcoming Tasks */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 font-semibold text-foreground">Proximas Tarefas</h3>
                {contactTasks.filter((t) => !t.completed).length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-2">
                    Sem tarefas pendentes
                  </p>
                ) : (
                  <div className="space-y-2">
                    {contactTasks
                      .filter((t) => !t.completed)
                      .slice(0, 3)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 rounded-lg bg-secondary p-2 text-sm"
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              task.priority === "high"
                                ? "bg-red-500"
                                : task.priority === "medium"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                          />
                          <span className="flex-1 truncate text-foreground">{task.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(task.dueDate).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Source */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 font-semibold text-foreground">Origem</h3>
                <p className="text-sm text-muted-foreground">
                  {contact.source || "Nao especificada"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "deals" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Todos os Negocios</h3>
              <button
                onClick={() => setShowAddDeal(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Novo Negocio
              </button>
            </div>

            {contactDeals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <Target className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h4 className="mb-2 font-semibold text-foreground">Nenhum negocio</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Crie um novo negocio para este contato
                </p>
                <button
                  onClick={() => setShowAddDeal(true)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  Criar Negocio
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {contactDeals.map((deal) => {
                  const stage = pipelineStages.find((s) => s.id === deal.stage);
                  const dealResponsible = users.find((u) => u.id === deal.responsibleId);
                  return (
                    <div
                      key={deal.id}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <span
                              className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                              style={{ backgroundColor: stage?.color }}
                            >
                              {stage?.name}
                            </span>
                            {deal.stage === "won" && (
                              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-500">
                                Ganho
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-foreground">{deal.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Responsavel: {dealResponsible?.name || "Nao atribuido"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-foreground">
                            R$ {deal.value.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Previsao: {new Date(deal.expectedCloseDate).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      {deal.stage !== "won" && deal.stage !== "lost" && (
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleWinDeal(deal)}
                            className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                          >
                            Marcar como Ganho
                          </button>
                          <button
                            onClick={() => updateDeal(deal.id, { stage: "lost" })}
                            className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
                          >
                            Perdido
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Tarefas</h3>
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Nova Tarefa
              </button>
            </div>

            {contactTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <CheckSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h4 className="mb-2 font-semibold text-foreground">Nenhuma tarefa</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Crie tarefas para acompanhar este contato
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {contactTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-xl border border-border bg-card p-4 ${
                      task.completed ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {
                          const { toggleTaskComplete } = useCRMStore.getState();
                          toggleTaskComplete(task.id);
                        }}
                        className="mt-1 h-4 w-4 rounded border-border"
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 ${
                              task.priority === "high"
                                ? "bg-red-500/20 text-red-500"
                                : task.priority === "medium"
                                  ? "bg-amber-500/20 text-amber-500"
                                  : "bg-emerald-500/20 text-emerald-500"
                            }`}
                          >
                            {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baixa"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Historico de Interacoes</h3>
            {contactConversations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma conversa encontrada</p>
            ) : (
              <div className="space-y-4">
                {contactConversations.map((conv) => (
                  <div key={conv.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(conv.channel)}
                        <span className="font-medium capitalize text-foreground">{conv.channel}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(conv.lastMessageTime).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {conv.messages.slice(-3).map((msg) => (
                        <div
                          key={msg.id}
                          className={`rounded-lg p-2 text-sm ${
                            msg.senderType === "contact"
                              ? "bg-secondary text-foreground"
                              : "bg-primary/10 text-foreground"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Notas</h3>
            <div className="rounded-xl border border-border bg-card p-4">
              <textarea
                rows={6}
                value={contact.notes}
                onChange={(e) => updateContact(contactId, { notes: e.target.value })}
                placeholder="Adicione notas sobre este contato..."
                className="w-full resize-none rounded-lg border border-border bg-secondary p-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Deal Modal */}
      {showAddDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Novo Negocio</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Titulo</label>
                <input
                  type="text"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                  placeholder={`${contact.name} - Novo Negocio`}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Valor (R$)</label>
                <input
                  type="number"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal({ ...newDeal, value: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Estagio</label>
                <select
                  value={newDeal.stage}
                  onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  {pipelineStages.filter((s) => s.id !== "won" && s.id !== "lost").map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Previsao de Fechamento</label>
                <input
                  type="date"
                  value={newDeal.expectedCloseDate}
                  onChange={(e) => setNewDeal({ ...newDeal, expectedCloseDate: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddDeal(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateDeal}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Criar Negocio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Nova Tarefa</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Titulo</label>
                <input
                  type="text"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  placeholder="Titulo da tarefa"
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Descricao</label>
                <textarea
                  rows={3}
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Data</label>
                  <input
                    type="date"
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Prioridade</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as "high" | "medium" | "low" })}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTaskForm.title || !newTaskForm.dueDate}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Criar Tarefa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
