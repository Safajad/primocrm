"use client";

import { useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Filter,
  Download,
  Upload,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  CreditCard,
  Building2,
  ShoppingCart,
  Users,
  Target,
  Receipt,
  FileText,
  RefreshCw,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart,
  ArrowRight,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "cancelled";
  paymentMethod: string;
  relatedDeal?: string;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  budget?: number;
  spent?: number;
}

const sampleTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    category: "Vendas",
    description: "Loja Fashion - Plano Profissional",
    amount: 5000,
    date: "2026-01-27",
    status: "completed",
    paymentMethod: "Pix",
    relatedDeal: "Loja Fashion - Plano Pro",
    tags: ["recorrente", "pix"],
  },
  {
    id: "2",
    type: "income",
    category: "Vendas",
    description: "E-commerce Solutions - Enterprise",
    amount: 12000,
    date: "2026-01-26",
    status: "completed",
    paymentMethod: "Boleto",
    relatedDeal: "E-commerce",
    tags: ["enterprise", "anual"],
  },
  {
    id: "3",
    type: "expense",
    category: "Marketing",
    description: "Facebook Ads - Janeiro",
    amount: 2500,
    date: "2026-01-25",
    status: "completed",
    paymentMethod: "Cartão de Crédito",
    tags: ["ads", "mensal"],
  },
  {
    id: "4",
    type: "expense",
    category: "Software",
    description: "Assinatura OpenAI API",
    amount: 850,
    date: "2026-01-24",
    status: "completed",
    paymentMethod: "Cartão de Crédito",
    tags: ["ai", "mensal"],
  },
  {
    id: "5",
    type: "income",
    category: "Vendas",
    description: "Consultoria Digital - Setup",
    amount: 8000,
    date: "2026-01-23",
    status: "pending",
    paymentMethod: "Transferência",
    relatedDeal: "Consultoria Digital",
    tags: ["one-time"],
  },
  {
    id: "6",
    type: "expense",
    category: "Equipe",
    description: "Freelancer - Design UI",
    amount: 3200,
    date: "2026-01-22",
    status: "pending",
    paymentMethod: "Pix",
    tags: ["freelancer"],
  },
  {
    id: "7",
    type: "income",
    category: "Vendas",
    description: "Tech Startup - Plano Enterprise",
    amount: 25000,
    date: "2026-01-20",
    status: "completed",
    paymentMethod: "Transferência",
    relatedDeal: "Tech Startup",
    tags: ["enterprise", "anual"],
  },
  {
    id: "8",
    type: "expense",
    category: "Infraestrutura",
    description: "Vercel Pro - Hosting",
    amount: 420,
    date: "2026-01-19",
    status: "completed",
    paymentMethod: "Cartão de Crédito",
    tags: ["hosting", "mensal"],
  },
];

const categories: Category[] = [
  { id: "1", name: "Vendas", type: "income", icon: "💰", color: "#10b981", budget: 100000, spent: 50000 },
  { id: "2", name: "Serviços", type: "income", icon: "🛠️", color: "#3b82f6", budget: 30000, spent: 15000 },
  { id: "3", name: "Marketing", type: "expense", icon: "📢", color: "#f59e0b", budget: 5000, spent: 2500 },
  { id: "4", name: "Software", type: "expense", icon: "💻", color: "#8b5cf6", budget: 2000, spent: 850 },
  { id: "5", name: "Equipe", type: "expense", icon: "👥", color: "#ec4899", budget: 15000, spent: 3200 },
  { id: "6", name: "Infraestrutura", type: "expense", icon: "🏢", color: "#06b6d4", budget: 1000, spent: 420 },
];

export function CashFlowManager() {
  const [transactions, setTransactions] = useState(sampleTransactions);
  const [view, setView] = useState<"overview" | "transactions" | "categories">("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [dateRange, setDateRange] = useState("month");
  const [showValues, setShowValues] = useState(true);

  const totalIncome = transactions
    .filter((t) => t.type === "income" && t.status !== "cancelled")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense" && t.status !== "cancelled")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const pendingIncome = transactions
    .filter((t) => t.type === "income" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingExpense = transactions
    .filter((t) => t.type === "expense" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (value: number) => {
    if (!showValues) return "••••••";
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === "all") return true;
    return t.type === filterType;
  });

  const renderOverview = () => (
    <div className="flex-1 overflow-auto bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Fluxo de Caixa</h2>
            <p className="text-muted-foreground">
              Gerencie suas finanças e acompanhe receitas e despesas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowValues(!showValues)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
            >
              {showValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showValues ? "Ocultar" : "Mostrar"}
            </button>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none"
            >
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Ano</option>
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Transação</span>
            </button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Saldo Atual</span>
              <div className="rounded-lg bg-primary/20 p-2">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className={`text-3xl font-bold ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
              {formatCurrency(balance)}
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm text-emerald-400">
              <TrendingUp className="h-4 w-4" />
              +15.3% vs mês anterior
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Receitas</span>
              <div className="rounded-lg bg-emerald-500/20 p-2">
                <ArrowUpRight className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatCurrency(pendingIncome)} pendente
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Despesas</span>
              <div className="rounded-lg bg-red-500/20 p-2">
                <ArrowDownLeft className="h-5 w-5 text-red-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-400">{formatCurrency(totalExpense)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatCurrency(pendingExpense)} pendente
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Margem de Lucro</span>
              <div className="rounded-lg bg-blue-500/20 p-2">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {showValues ? `${Math.round((balance / totalIncome) * 100)}%` : "••%"}
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm text-emerald-400">
              <TrendingUp className="h-4 w-4" />
              Meta: 30%
            </p>
          </div>
        </div>

        {/* Quick Actions & Chart */}
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          {/* Chart Placeholder */}
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Fluxo Mensal</h3>
              <div className="flex items-center gap-2">
                <button className="rounded-lg bg-secondary px-3 py-1 text-sm text-foreground">
                  <BarChart3 className="h-4 w-4" />
                </button>
                <button className="rounded-lg px-3 py-1 text-sm text-muted-foreground hover:bg-secondary">
                  <PieChart className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex h-64 items-end justify-between gap-2">
              {[
                { month: "Ago", income: 45000, expense: 28000 },
                { month: "Set", income: 52000, expense: 31000 },
                { month: "Out", income: 48000, expense: 29000 },
                { month: "Nov", income: 61000, expense: 35000 },
                { month: "Dez", income: 72000, expense: 42000 },
                { month: "Jan", income: totalIncome, expense: totalExpense },
              ].map((data, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-col gap-1">
                    <div
                      className="w-full rounded-t bg-emerald-500/80 transition-all hover:bg-emerald-500"
                      style={{ height: `${(data.income / 80000) * 180}px` }}
                    />
                    <div
                      className="w-full rounded-b bg-red-500/80 transition-all hover:bg-red-500"
                      style={{ height: `${(data.expense / 80000) * 180}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-emerald-500" />
                <span className="text-sm text-muted-foreground">Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-red-500" />
                <span className="text-sm text-muted-foreground">Despesas</span>
              </div>
            </div>
          </div>

          {/* Categories Summary */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Categorias</h3>
              <button
                onClick={() => setView("categories")}
                className="text-sm text-primary hover:text-primary/80"
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-4">
              {categories.slice(0, 5).map((cat) => (
                <div key={cat.id} className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon}</span>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{cat.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {showValues
                          ? `R$ ${cat.spent?.toLocaleString()} / ${cat.budget?.toLocaleString()}`
                          : "•••• / ••••"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, ((cat.spent || 0) / (cat.budget || 1)) * 100)}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-semibold text-foreground">Transações Recentes</h3>
            <button
              onClick={() => setView("transactions")}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
            >
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-secondary/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      transaction.type === "income"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.category} • {transaction.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.type === "income" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <div className="flex items-center justify-end gap-2 text-sm">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        transaction.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : transaction.status === "pending"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-zinc-500/20 text-zinc-400"
                      }`}
                    >
                      {transaction.status === "completed"
                        ? "Confirmado"
                        : transaction.status === "pending"
                          ? "Pendente"
                          : "Cancelado"}
                    </span>
                    <span className="text-muted-foreground">{transaction.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="flex-1 overflow-auto bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("overview")}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </button>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Todas as Transações</h2>
              <p className="text-muted-foreground">{filteredTransactions.length} transações encontradas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar transações..."
                className="w-64 rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "all" | "income" | "expense")}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">Todas</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary">
              <Download className="h-4 w-4" />
              Exportar
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Nova Transação
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Descrição
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Categoria
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Data
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">
                    Valor
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-secondary/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            transaction.type === "income"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.paymentMethod}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded bg-secondary px-2 py-1 text-sm text-foreground">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{transaction.date}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          transaction.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : transaction.status === "pending"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-zinc-500/20 text-zinc-400"
                        }`}
                      >
                        {transaction.status === "completed" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : transaction.status === "pending" ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {transaction.status === "completed"
                          ? "Confirmado"
                          : transaction.status === "pending"
                            ? "Pendente"
                            : "Cancelado"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`font-semibold ${
                          transaction.type === "income" ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-5 py-4">
            <p className="text-sm text-muted-foreground">
              Mostrando 1-{filteredTransactions.length} de {filteredTransactions.length} resultados
            </p>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground">
                1
              </button>
              <button className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary">
                2
              </button>
              <button className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="flex-1 overflow-auto bg-background p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("overview")}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </button>
            <h2 className="text-2xl font-semibold text-foreground">Categorias</h2>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Nova Categoria
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {cat.type === "income" ? "Receita" : "Despesa"}
                    </p>
                  </div>
                </div>
                <button className="rounded p-1 hover:bg-secondary">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Utilizado</span>
                <span className="font-medium text-foreground">
                  {showValues
                    ? `R$ ${cat.spent?.toLocaleString()} / R$ ${cat.budget?.toLocaleString()}`
                    : "•••• / ••••"}
                </span>
              </div>
              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((cat.spent || 0) / (cat.budget || 1)) * 100)}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {Math.round(((cat.spent || 0) / (cat.budget || 1)) * 100)}% do orçamento
                </span>
                <span
                  className={
                    ((cat.spent || 0) / (cat.budget || 1)) > 0.8
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }
                >
                  {showValues
                    ? `R$ ${((cat.budget || 0) - (cat.spent || 0)).toLocaleString()} restante`
                    : "•••• restante"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {view === "overview" && renderOverview()}
      {view === "transactions" && renderTransactions()}
      {view === "categories" && renderCategories()}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-lg font-semibold text-foreground">Nova Transação</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded p-1 hover:bg-secondary"
              >
                <ChevronRight className="h-5 w-5 rotate-45 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-500 bg-emerald-500/10 py-3 font-medium text-emerald-400">
                    <ArrowUpRight className="h-5 w-5" />
                    Receita
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-lg border border-border py-3 font-medium text-muted-foreground hover:bg-secondary">
                    <ArrowDownLeft className="h-5 w-5" />
                    Despesa
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Descrição</label>
                  <input
                    type="text"
                    placeholder="Ex: Pagamento cliente X"
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Valor</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        R$
                      </span>
                      <input
                        type="text"
                        placeholder="0,00"
                        className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Data</label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Categoria</label>
                    <select className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                      <option>Vendas</option>
                      <option>Serviços</option>
                      <option>Marketing</option>
                      <option>Software</option>
                      <option>Equipe</option>
                      <option>Infraestrutura</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Forma de Pagamento
                    </label>
                    <select className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                      <option>Pix</option>
                      <option>Cartão de Crédito</option>
                      <option>Boleto</option>
                      <option>Transferência</option>
                      <option>Dinheiro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Vincular a Negócio (opcional)
                  </label>
                  <select className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                    <option value="">Selecione um negócio...</option>
                    <option>Loja Fashion - Plano Pro</option>
                    <option>E-commerce Solutions</option>
                    <option>Tech Startup</option>
                    <option>Consultoria Digital</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Observações (opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Adicione uma nota..."
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Salvar Transação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
