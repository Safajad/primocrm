"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Edit,
  Camera,
  Save,
  X,
  Target,
  MessageSquare,
  CheckSquare,
  TrendingUp,
  Award,
  Clock,
  BarChart,
} from "lucide-react";
import { useCRMStore } from "@/lib/store";

export function ProfilePanel() {
  const { currentUser, updateUser, deals, tasks, conversations } = useCRMStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(currentUser);

  // Calculate user statistics
  const userDeals = deals.filter((d) => d.responsibleId === currentUser.id);
  const wonDeals = userDeals.filter((d) => d.stage === "won");
  const totalSales = wonDeals.reduce((sum, d) => sum + d.value, 0);
  const userTasks = tasks.filter((t) => t.assigneeId === currentUser.id);
  const completedTasks = userTasks.filter((t) => t.completed);
  const userConversations = conversations.filter((c) => c.responsibleId === currentUser.id);

  const stats = [
    { label: "Vendas Totais", value: `R$ ${totalSales.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Negocios Ganhos", value: wonDeals.length.toString(), icon: Award, color: "text-amber-500" },
    { label: "Negocios Ativos", value: userDeals.filter((d) => !["won", "lost"].includes(d.stage)).length.toString(), icon: Target, color: "text-blue-500" },
    { label: "Conversas Ativas", value: userConversations.filter((c) => c.status === "open").length.toString(), icon: MessageSquare, color: "text-pink-500" },
    { label: "Tarefas Concluidas", value: `${completedTasks.length}/${userTasks.length}`, icon: CheckSquare, color: "text-primary" },
    { label: "Taxa de Conversao", value: userDeals.length > 0 ? `${Math.round((wonDeals.length / userDeals.length) * 100)}%` : "0%", icon: BarChart, color: "text-cyan-500" },
  ];

  const recentActivity = [
    { type: "deal", action: "Fechou negocio", detail: "Loja Virtual Pro - R$ 18.000", time: "2 dias atras" },
    { type: "task", action: "Completou tarefa", detail: "Revisar contrato E-commerce", time: "3 dias atras" },
    { type: "message", action: "Respondeu mensagem", detail: "Ana Costa - WhatsApp", time: "5 horas atras" },
    { type: "deal", action: "Moveu negocio", detail: "Tech Startup para Negociacao", time: "1 semana atras" },
  ];

  const handleSave = () => {
    updateUser(currentUser.id, editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(currentUser);
    setIsEditing(false);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background p-6">
      <div className="mx-auto w-full max-w-4xl">
        {/* Profile Header */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/40 text-4xl font-bold text-primary">
                {currentUser.avatar}
              </div>
              <button className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg hover:bg-primary/90">
                <Camera className="h-4 w-4" />
              </button>
              <span
                className={`absolute right-2 top-2 h-4 w-4 rounded-full border-2 border-card ${
                  currentUser.status === "online"
                    ? "bg-emerald-500"
                    : currentUser.status === "away"
                      ? "bg-amber-500"
                      : "bg-zinc-500"
                }`}
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-xl font-bold text-foreground focus:border-primary focus:outline-none"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={editedUser.email}
                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                        className="flex-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={editedUser.phone || ""}
                        onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                        className="flex-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={editedUser.department || ""}
                        onChange={(e) => setEditedUser({ ...editedUser, department: e.target.value })}
                        className="flex-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-foreground">{currentUser.name}</h1>
                  <p className="mb-3 text-muted-foreground">
                    {currentUser.role === "admin" ? "Administrador" : currentUser.role === "manager" ? "Gerente" : "Agente"}
                    {currentUser.department && ` - ${currentUser.department}`}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {currentUser.email}
                    </span>
                    {currentUser.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {currentUser.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Desde Jan 2026
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Save className="h-4 w-4" />
                    Salvar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  <Edit className="h-4 w-4" />
                  Editar Perfil
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`rounded-lg bg-secondary p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Atividade Recente</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div
                  className={`rounded-lg p-2 ${
                    activity.type === "deal"
                      ? "bg-emerald-500/20 text-emerald-500"
                      : activity.type === "task"
                        ? "bg-amber-500/20 text-amber-500"
                        : "bg-blue-500/20 text-blue-500"
                  }`}
                >
                  {activity.type === "deal" ? (
                    <Target className="h-4 w-4" />
                  ) : activity.type === "task" ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.detail}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Desempenho Mensal</h2>
          <div className="flex h-64 items-center justify-center rounded-lg bg-secondary">
            <div className="text-center">
              <BarChart className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Grafico de desempenho</p>
              <p className="text-sm text-muted-foreground">Vendas vs Meta</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
