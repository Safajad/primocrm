"use client";

import {
  Users,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Target,
  CheckSquare,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  ChevronRight,
} from "lucide-react";
import { useCRMStore } from "@/lib/store";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { contacts, conversations, deals, tasks, transactions, users, pipelineStages } =
    useCRMStore();

  // Calculate metrics
  const totalLeads = contacts.length;
  const openConversations = conversations.filter((c) => c.status === "open").length;
  const totalDealsValue = deals
    .filter((d) => d.stage !== "lost")
    .reduce((sum, d) => sum + d.value, 0);
  const wonDeals = deals.filter((d) => d.stage === "won");
  const wonDealsValue = wonDeals.reduce((sum, d) => sum + d.value, 0);
  const conversionRate =
    deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;

  // Financial metrics from transactions
  // Faturamento: R$ 52.500,00 | Saldo: R$ 45.530,00 | Margem: 86%
  const totalIncome = transactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const saldoAtual = totalIncome - totalExpense;
  const margem = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const pendingTasks = tasks.filter((t) => !t.completed);
  const todayTasks = pendingTasks.filter(
    (t) => new Date(t.dueDate).toDateString() === new Date().toDateString()
  );

  const recentConversations = [...conversations]
    .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
    .slice(0, 5);

  const getContactById = (id: string) => contacts.find((c) => c.id === id);
  const getUserById = (id: string | null) => users.find((u) => u.id === id);

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  // Pipeline summary
  const pipelineSummary = pipelineStages
    .filter((s) => s.id !== "lost")
    .map((stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage.id);
      return {
        ...stage,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + d.value, 0),
      };
    });

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu CRM em tempo real
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total de Leads</span>
              <div className="rounded-lg bg-blue-500/20 p-2">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalLeads}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
              +12% este mês
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Conversas Abertas</span>
              <div className="rounded-lg bg-emerald-500/20 p-2">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{openConversations}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-amber-400">
              <Clock className="h-4 w-4" />
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0)} não lidas
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Faturamento</span>
              <div className="rounded-lg bg-primary/20 p-2">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-primary">{formatCurrency(totalIncome)}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
              Saldo: {formatCurrency(saldoAtual)}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Margem de Lucro</span>
              <div className="rounded-lg bg-amber-500/20 p-2">
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{margem}%</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
              Receita: {formatCurrency(totalIncome - totalExpense)}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pipeline Overview */}
          <div className="rounded-xl border border-border bg-card lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-semibold text-foreground">Pipeline de Vendas</h2>
                <p className="text-sm text-muted-foreground">
                  Total: {formatCurrency(totalDealsValue)}
                </p>
              </div>
              <button
                onClick={() => onNavigate("pipeline")}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
              >
                Ver completo
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex gap-4">
                {pipelineSummary.map((stage) => (
                  <div key={stage.id} className="flex-1">
                    <div
                      className="mb-2 h-2 rounded-full"
                      style={{ backgroundColor: `${stage.color}30` }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          backgroundColor: stage.color,
                          width: `${Math.min(100, (stage.value / totalDealsValue) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs font-medium text-foreground">{stage.name}</p>
                    <p className="text-sm font-bold" style={{ color: stage.color }}>
                      {stage.count} ({formatCurrency(stage.value)})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks Today */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-semibold text-foreground">Tarefas de Hoje</h2>
                <p className="text-sm text-muted-foreground">{todayTasks.length} pendentes</p>
              </div>
              <button
                onClick={() => onNavigate("tasks")}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
              >
                Ver todas
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="divide-y divide-border">
              {todayTasks.length === 0 ? (
                <div className="p-5 text-center text-muted-foreground">
                  <CheckSquare className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">Nenhuma tarefa para hoje</p>
                </div>
              ) : (
                todayTasks.slice(0, 4).map((task) => {
                  const assignee = getUserById(task.assigneeId);
                  return (
                    <div key={task.id} className="flex items-center gap-3 px-5 py-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          task.priority === "high"
                            ? "bg-destructive"
                            : task.priority === "medium"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {assignee?.name || "Sem responsável"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="mt-6 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="font-semibold text-foreground">Conversas Recentes</h2>
              <p className="text-sm text-muted-foreground">
                Últimas interações com seus leads
              </p>
            </div>
            <button
              onClick={() => onNavigate("inbox")}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
            >
              Ver todas
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {recentConversations.map((conv) => {
              const contact = getContactById(conv.contactId);
              const responsible = getUserById(conv.responsibleId);
              if (!contact) return null;

              return (
                <div
                  key={conv.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/40 font-semibold text-primary">
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
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{contact.name}</p>
                        {conv.unreadCount > 0 && (
                          <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatTime(conv.lastMessageTime)}
                    </p>
                    {responsible && (
                      <p className="text-xs text-muted-foreground">{responsible.name}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
