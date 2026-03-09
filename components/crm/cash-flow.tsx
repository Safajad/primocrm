"use client";

import React from "react"

import { useState } from "react";
import { useCRMStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Wallet,
  Receipt,
  PiggyBank,
  CreditCard,
  Building2,
  ShoppingCart,
  Briefcase,
  Car,
  Utensils,
  Home,
  Zap,
  Phone,
  Users,
  Target,
  Link2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const categoryIcons: Record<string, React.ReactNode> = {
  vendas: <ShoppingCart className="h-4 w-4" />,
  servicos: <Briefcase className="h-4 w-4" />,
  comissoes: <Users className="h-4 w-4" />,
  investimentos: <TrendingUp className="h-4 w-4" />,
  salarios: <Users className="h-4 w-4" />,
  marketing: <Target className="h-4 w-4" />,
  infraestrutura: <Building2 className="h-4 w-4" />,
  impostos: <Receipt className="h-4 w-4" />,
  aluguel: <Home className="h-4 w-4" />,
  transporte: <Car className="h-4 w-4" />,
  alimentacao: <Utensils className="h-4 w-4" />,
  telefone: <Phone className="h-4 w-4" />,
  energia: <Zap className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  vendas: "#10b981",
  servicos: "#3b82f6",
  comissoes: "#8b5cf6",
  investimentos: "#f59e0b",
  salarios: "#ef4444",
  marketing: "#ec4899",
  infraestrutura: "#6366f1",
  impostos: "#f97316",
  aluguel: "#14b8a6",
  transporte: "#84cc16",
  alimentacao: "#eab308",
  telefone: "#06b6d4",
  energia: "#a855f7",
};

export function CashFlowManager() {
  const { transactions, deals, contacts, users, addTransaction, updateTransaction, deleteTransaction, addNotification } = useCRMStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "chart">("list");
  
  const [newTransaction, setNewTransaction] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    dealId: "",
    contactId: "",
    userId: "",
    paymentMethod: "pix",
    status: "completed" as "pending" | "completed" | "cancelled",
    notes: "",
    recurring: false,
    recurringPeriod: "monthly",
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const pendingIncome = transactions
    .filter((t) => t.type === "income" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingExpense = transactions
    .filter((t) => t.type === "expense" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  // Monthly data for chart
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.toLocaleDateString("pt-BR", { month: "short" });
    
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
    });

    return {
      month,
      receitas: monthTransactions.filter((t) => t.type === "income" && t.status === "completed").reduce((s, t) => s + t.amount, 0),
      despesas: monthTransactions.filter((t) => t.type === "expense" && t.status === "completed").reduce((s, t) => s + t.amount, 0),
    };
  });

  // Category breakdown
  const categoryData = Object.entries(
    transactions
      .filter((t) => t.type === "expense" && t.status === "completed")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value, color: categoryColors[name] || "#71717a" }));

  const filteredTransactions = transactions
    .filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          t.description.toLowerCase().includes(search) ||
          t.category.toLowerCase().includes(search)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSaveTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description || !newTransaction.category) {
      addNotification({
        type: "error",
        title: "Campos obrigatórios",
        message: "Preencha valor, descrição e categoria",
      });
      return;
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction, {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
      });
      addNotification({
        type: "success",
        title: "Transação atualizada",
        message: "A transação foi atualizada com sucesso",
      });
    } else {
      addTransaction({
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
      });
      addNotification({
        type: "success",
        title: "Transação adicionada",
        message: `${newTransaction.type === "income" ? "Receita" : "Despesa"} registrada com sucesso`,
      });
    }

    setShowNewTransaction(false);
    setEditingTransaction(null);
    setNewTransaction({
      type: "income",
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      dealId: "",
      contactId: "",
      userId: "",
      paymentMethod: "pix",
      status: "completed",
      notes: "",
      recurring: false,
      recurringPeriod: "monthly",
    });
  };

  const handleEditTransaction = (transaction: typeof transactions[0]) => {
    setNewTransaction({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      date: transaction.date,
      dealId: transaction.dealId || "",
      contactId: transaction.contactId || "",
      userId: transaction.userId || "",
      paymentMethod: transaction.paymentMethod || "pix",
      status: transaction.status,
      notes: transaction.notes || "",
      recurring: transaction.recurring || false,
      recurringPeriod: transaction.recurringPeriod || "monthly",
    });
    setEditingTransaction(transaction.id);
    setShowNewTransaction(true);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    addNotification({
      type: "success",
      title: "Transação excluída",
      message: "A transação foi removida com sucesso",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const incomeCategories = ["vendas", "servicos", "comissoes", "investimentos"];
  const expenseCategories = ["salarios", "marketing", "infraestrutura", "impostos", "aluguel", "transporte", "alimentacao", "telefone", "energia"];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fluxo de Caixa</h1>
            <p className="text-muted-foreground">Controle financeiro completo</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={showNewTransaction} onOpenChange={setShowNewTransaction}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {editingTransaction ? "Editar Transação" : "Nova Transação"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Type Selection */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={newTransaction.type === "income" ? "default" : "outline"}
                      className={newTransaction.type === "income" ? "bg-emerald-600 hover:bg-emerald-700 flex-1" : "flex-1"}
                      onClick={() => setNewTransaction({ ...newTransaction, type: "income", category: "" })}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Receita
                    </Button>
                    <Button
                      type="button"
                      variant={newTransaction.type === "expense" ? "default" : "outline"}
                      className={newTransaction.type === "expense" ? "bg-red-600 hover:bg-red-700 flex-1" : "flex-1"}
                      onClick={() => setNewTransaction({ ...newTransaction, type: "expense", category: "" })}
                    >
                      <ArrowDownRight className="h-4 w-4 mr-2" />
                      Despesa
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Valor *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                        <Input
                          type="number"
                          placeholder="0,00"
                          value={newTransaction.amount}
                          onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                          className="bg-secondary border-border text-foreground pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Data</label>
                      <Input
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Descrição *</label>
                    <Input
                      placeholder="Descrição da transação"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Categoria *</label>
                      <Select
                        value={newTransaction.category}
                        onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
                      >
                        <SelectTrigger className="bg-secondary border-border text-foreground">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {(newTransaction.type === "income" ? incomeCategories : expenseCategories).map((cat) => (
                            <SelectItem key={cat} value={cat} className="text-foreground">
                              <div className="flex items-center gap-2">
                                {categoryIcons[cat]}
                                <span className="capitalize">{cat}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Status</label>
                      <Select
                        value={newTransaction.status}
                        onValueChange={(value: "pending" | "completed" | "cancelled") => setNewTransaction({ ...newTransaction, status: value })}
                      >
                        <SelectTrigger className="bg-secondary border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="completed" className="text-foreground">Concluído</SelectItem>
                          <SelectItem value="pending" className="text-foreground">Pendente</SelectItem>
                          <SelectItem value="cancelled" className="text-foreground">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Forma de Pagamento</label>
                      <Select
                        value={newTransaction.paymentMethod}
                        onValueChange={(value) => setNewTransaction({ ...newTransaction, paymentMethod: value })}
                      >
                        <SelectTrigger className="bg-secondary border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="pix" className="text-foreground">PIX</SelectItem>
                          <SelectItem value="credit_card" className="text-foreground">Cartão de Crédito</SelectItem>
                          <SelectItem value="debit_card" className="text-foreground">Cartão de Débito</SelectItem>
                          <SelectItem value="bank_transfer" className="text-foreground">Transferência</SelectItem>
                          <SelectItem value="cash" className="text-foreground">Dinheiro</SelectItem>
                          <SelectItem value="boleto" className="text-foreground">Boleto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Responsável</label>
                      <Select
                        value={newTransaction.userId}
                        onValueChange={(value) => setNewTransaction({ ...newTransaction, userId: value })}
                      >
                        <SelectTrigger className="bg-secondary border-border text-foreground">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id} className="text-foreground">
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-2">
                        <Link2 className="h-3 w-3" />
                        Vincular a Negócio
                      </label>
                      <Select
                        value={newTransaction.dealId}
                        onValueChange={(value) => {
                          const deal = deals.find((d) => d.id === value);
                          setNewTransaction({
                            ...newTransaction,
                            dealId: value,
                            contactId: deal?.contactId || newTransaction.contactId,
                          });
                        }}
                      >
                        <SelectTrigger className="bg-secondary border-border text-foreground">
                          <SelectValue placeholder="Opcional" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="" className="text-foreground">Nenhum</SelectItem>
                          {deals.map((deal) => (
                            <SelectItem key={deal.id} value={deal.id} className="text-foreground">
                              {deal.title} - {formatCurrency(deal.value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        Vincular a Contato
                      </label>
                      <Select
                        value={newTransaction.contactId}
                        onValueChange={(value) => setNewTransaction({ ...newTransaction, contactId: value })}
                      >
                        <SelectTrigger className="bg-secondary border-border text-foreground">
                          <SelectValue placeholder="Opcional" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="" className="text-foreground">Nenhum</SelectItem>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id} className="text-foreground">
                              {contact.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Observações</label>
                    <Input
                      placeholder="Notas adicionais"
                      value={newTransaction.notes}
                      onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTransaction.recurring}
                        onChange={(e) => setNewTransaction({ ...newTransaction, recurring: e.target.checked })}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-foreground">Transação recorrente</span>
                    </label>
                    {newTransaction.recurring && (
                      <Select
                        value={newTransaction.recurringPeriod}
                        onValueChange={(value) => setNewTransaction({ ...newTransaction, recurringPeriod: value })}
                      >
                        <SelectTrigger className="bg-secondary border-border text-foreground w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="weekly" className="text-foreground">Semanal</SelectItem>
                          <SelectItem value="monthly" className="text-foreground">Mensal</SelectItem>
                          <SelectItem value="yearly" className="text-foreground">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNewTransaction(false);
                        setEditingTransaction(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleSaveTransaction}
                    >
                      {editingTransaction ? "Salvar Alterações" : "Adicionar Transação"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Atual</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${balance >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                <Wallet className={`h-6 w-6 ${balance >= 0 ? "text-emerald-500" : "text-red-500"}`} />
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receitas</p>
                <p className="text-2xl font-bold text-emerald-500">{formatCurrency(totalIncome)}</p>
                {pendingIncome > 0 && (
                  <p className="text-xs text-muted-foreground">+{formatCurrency(pendingIncome)} pendente</p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpense)}</p>
                {pendingExpense > 0 && (
                  <p className="text-xs text-muted-foreground">+{formatCurrency(pendingExpense)} pendente</p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Margem</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <PiggyBank className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="col-span-2 space-y-6">
            {/* Line Chart */}
            <Card className="bg-card border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Evolução Mensal</h3>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="bg-secondary border-border text-foreground w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="week" className="text-foreground">Semana</SelectItem>
                    <SelectItem value="month" className="text-foreground">Mês</SelectItem>
                    <SelectItem value="year" className="text-foreground">Ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#71717a" />
                  <YAxis stroke="#71717a" tickFormatter={(v) => `R$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#141417", border: "1px solid #27272a" }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Transactions List */}
            <Card className="bg-card border-border">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Transações</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-secondary border-border text-foreground w-48"
                      />
                    </div>
                    <Select value={filterType} onValueChange={(v: "all" | "income" | "expense") => setFilterType(v)}>
                      <SelectTrigger className="bg-secondary border-border text-foreground w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="all" className="text-foreground">Todos</SelectItem>
                        <SelectItem value="income" className="text-foreground">Receitas</SelectItem>
                        <SelectItem value="expense" className="text-foreground">Despesas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                {filteredTransactions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma transação encontrada</p>
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const contact = contacts.find((c) => c.id === transaction.contactId);
                    const deal = deals.find((d) => d.id === transaction.dealId);
                    const user = users.find((u) => u.id === transaction.userId);

                    return (
                      <div key={transaction.id} className="p-4 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                transaction.type === "income" ? "bg-emerald-500/10" : "bg-red-500/10"
                              }`}
                            >
                              {transaction.type === "income" ? (
                                <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                              ) : (
                                <ArrowDownRight className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{transaction.description}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="capitalize">{transaction.category}</span>
                                <span>•</span>
                                <span>{new Date(transaction.date).toLocaleDateString("pt-BR")}</span>
                                {contact && (
                                  <>
                                    <span>•</span>
                                    <span>{contact.name}</span>
                                  </>
                                )}
                                {user && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {user.name}
                                    </span>
                                  </>
                                )}
                              </div>
                              {deal && (
                                <div className="flex items-center gap-1 text-xs text-primary mt-1">
                                  <Link2 className="h-3 w-3" />
                                  {deal.title}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p
                                className={`font-semibold ${
                                  transaction.type === "income" ? "text-emerald-500" : "text-red-500"
                                }`}
                              >
                                {transaction.type === "income" ? "+" : "-"}
                                {formatCurrency(transaction.amount)}
                              </p>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  transaction.status === "completed"
                                    ? "border-emerald-500/50 text-emerald-500"
                                    : transaction.status === "pending"
                                    ? "border-yellow-500/50 text-yellow-500"
                                    : "border-red-500/50 text-red-500"
                                }`}
                              >
                                {transaction.status === "completed"
                                  ? "Concluído"
                                  : transaction.status === "pending"
                                  ? "Pendente"
                                  : "Cancelado"}
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-border">
                                <DropdownMenuItem
                                  className="text-foreground"
                                  onClick={() => handleEditTransaction(transaction)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-500"
                                  onClick={() => handleDeleteTransaction(transaction.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Breakdown */}
            <Card className="bg-card border-border p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Despesas por Categoria</h3>
              {categoryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#141417", border: "1px solid #27272a" }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {categoryData.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-sm text-foreground capitalize">{cat.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{formatCurrency(cat.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <PiggyBank className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sem dados de despesas</p>
                </div>
              )}
            </Card>

            {/* Recent from Sales */}
            <Card className="bg-card border-border p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Vendas Recentes</h3>
              <div className="space-y-3">
                {deals
                  .filter((d) => d.stage === "won")
                  .slice(0, 5)
                  .map((deal) => {
                    const contact = contacts.find((c) => c.id === deal.contactId);
                    const hasTransaction = transactions.some((t) => t.dealId === deal.id);

                    return (
                      <div key={deal.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-xs">
                              {contact?.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{deal.title}</p>
                            <p className="text-xs text-muted-foreground">{contact?.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-emerald-500">{formatCurrency(deal.value)}</p>
                          {hasTransaction ? (
                            <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-500">
                              Registrado
                            </Badge>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-primary h-6 px-2"
                              onClick={() => {
                                setNewTransaction({
                                  type: "income",
                                  amount: deal.value.toString(),
                                  description: `Venda: ${deal.title}`,
                                  category: "vendas",
                                  date: new Date().toISOString().split("T")[0],
                                  dealId: deal.id,
                                  contactId: deal.contactId,
                                  userId: deal.assignedTo,
                                  paymentMethod: "pix",
                                  status: "completed",
                                  notes: "",
                                  recurring: false,
                                  recurringPeriod: "monthly",
                                });
                                setShowNewTransaction(true);
                              }}
                            >
                              + Registrar
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {deals.filter((d) => d.stage === "won").length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    <p className="text-sm">Nenhuma venda fechada</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
