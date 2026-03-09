"use client";

import { useEffect, useState } from "react";
import {
  Users,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Target,
  CheckSquare,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { dashboardApi, contactsApi, dealsApi, tasksApi, type DashboardStats, type Contact, type Deal, type Task } from "@/lib/api";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export function DashboardConnected({ onNavigate }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statsData, contactsData, dealsData, tasksData] = await Promise.all([
        dashboardApi.getStats(),
        contactsApi.getAll(),
        dealsApi.getAll(),
        tasksApi.getAll(),
      ]);
      
      setStats(statsData);
      setContacts(contactsData);
      setDeals(dealsData);
      setTasks(tasksData);
    } catch (err: any) {
      console.error("Erro ao carregar dashboard:", err);
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Calculate derived metrics
  const totalLeads = stats?.total_contacts || 0;
  const totalDeals = stats?.total_deals || 0;
  const totalValue = stats?.total_value || 0;
  const pendingTasks = stats?.pending_tasks || 0;
  
  // Pipeline stages mapping
  const stageNames: Record<string, string> = {
    novo_lead: "Novo Lead",
    contato_feito: "Contato Feito",
    proposta_enviada: "Proposta Enviada",
    negociacao: "Negociacao",
    ganho: "Ganho",
  };
  
  const stageColors: Record<string, string> = {
    novo_lead: "bg-blue-500",
    contato_feito: "bg-cyan-500",
    proposta_enviada: "bg-amber-500",
    negociacao: "bg-orange-500",
    ganho: "bg-emerald-500",
  };

  // Convert deals_by_stage to pipeline summary
  const pipelineSummary = Object.entries(stats?.deals_by_stage || {}).map(([stage, data]) => ({
    id: stage,
    name: stageNames[stage] || stage,
    count: data.count,
    value: data.value,
    color: stageColors[stage] || "bg-gray-500",
  }));

  // Calculate total pipeline value
  const totalPipelineValue = pipelineSummary.reduce((sum, s) => sum + s.value, 0);

  // Get recent contacts
  const recentContacts = [...contacts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Get today's tasks
  const today = new Date().toDateString();
  const todayTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    return new Date(t.due_date).toDateString() === today;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Visao geral do seu CRM em tempo real
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total de Leads</span>
              <div className="rounded-lg bg-blue-500/20 p-2">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalLeads}</p>
            <p className="mt-1 flex items-center text-xs text-emerald-500">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +12% este mes
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Negocios Abertos</span>
              <div className="rounded-lg bg-purple-500/20 p-2">
                <MessageSquare className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalDeals}</p>
            <div className="mt-1 flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {pendingTasks} tarefas pendentes
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Valor Total</span>
              <div className="rounded-lg bg-emerald-500/20 p-2">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-500">
              {formatCurrency(totalValue)}
            </p>
            <p className="mt-1 flex items-center text-xs text-emerald-500">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              Pipeline ativo
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Taxa de Conversao</span>
              <div className="rounded-lg bg-amber-500/20 p-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {totalDeals > 0 ? Math.round((pipelineSummary.find(s => s.id === 'ganho')?.count || 0) / totalDeals * 100) : 0}%
            </p>
            <p className="mt-1 flex items-center text-xs text-emerald-500">
              <Target className="mr-1 h-3 w-3" />
              Meta: 30%
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pipeline de Vendas */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Pipeline de Vendas</h3>
                <p className="text-sm text-muted-foreground">
                  Total: {formatCurrency(totalPipelineValue)}
                </p>
              </div>
              <button
                onClick={() => onNavigate("pipeline")}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Ver completo
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {pipelineSummary.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">Nenhum negocio no pipeline</p>
                <button
                  onClick={() => onNavigate("pipeline")}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Criar primeiro negocio
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {pipelineSummary.map((stage) => (
                  <div key={stage.id} className="flex items-center gap-4">
                    <div className="w-32 text-sm">
                      <p className="font-medium text-foreground">{stage.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {stage.count} ({formatCurrency(stage.value)})
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full ${stage.color}`}
                          style={{
                            width: `${totalPipelineValue > 0 ? (stage.value / totalPipelineValue) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tarefas de Hoje */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Tarefas de Hoje</h3>
                <p className="text-sm text-muted-foreground">{todayTasks.length} pendentes</p>
              </div>
              <button
                onClick={() => onNavigate("tasks")}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Ver todas
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckSquare className="mb-2 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma tarefa para hoje
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <div
                      className={`mt-0.5 h-4 w-4 rounded border-2 ${
                        task.status === "completed"
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-muted-foreground"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {task.priority === "high" ? "Alta prioridade" : 
                         task.priority === "medium" ? "Media prioridade" : "Baixa prioridade"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Contatos Recentes</h3>
              <p className="text-sm text-muted-foreground">
                Ultimas interacoes com seus leads
              </p>
            </div>
            <button
              onClick={() => onNavigate("communications")}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Ver todas
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {recentContacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhum contato cadastrado</p>
              <button
                onClick={() => onNavigate("communications")}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Adicionar primeiro contato
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                      {contact.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {contact.email || contact.phone || "Sem contato"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      contact.status === "customer" ? "bg-emerald-500/20 text-emerald-500" :
                      contact.status === "qualified" ? "bg-blue-500/20 text-blue-500" :
                      "bg-amber-500/20 text-amber-500"
                    }`}>
                      {contact.status === "customer" ? "Cliente" :
                       contact.status === "qualified" ? "Qualificado" : "Lead"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
