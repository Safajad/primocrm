"use client";

import { useState } from "react";
import {
  Sparkles,
  Bot,
  Brain,
  MessageSquare,
  Settings,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  Copy,
  MoreVertical,
  Zap,
  FileText,
  Users,
  Target,
  TrendingUp,
  Clock,
  CheckSquare,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Send,
  Mic,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Lightbulb,
  BookOpen,
  Wand2,
  Gauge,
  Shield,
  Globe,
} from "lucide-react";

interface AIAgent {
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
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  feedback?: "positive" | "negative";
}

const sampleAgents: AIAgent[] = [
  {
    id: "1",
    name: "Vendedor Virtual",
    description: "Especialista em vendas e negociações",
    model: "GPT-4 Turbo",
    status: "active",
    conversations: 1250,
    successRate: 92,
    avatar: "🤖",
    personality: "Profissional e persuasivo",
    capabilities: ["Qualificação de leads", "Apresentação de produtos", "Negociação", "Follow-up"],
  },
  {
    id: "2",
    name: "Suporte Técnico",
    description: "Resolve dúvidas e problemas técnicos",
    model: "GPT-4",
    status: "active",
    conversations: 890,
    successRate: 88,
    avatar: "🛠️",
    personality: "Técnico e paciente",
    capabilities: ["Troubleshooting", "FAQ", "Tutoriais", "Escalonamento"],
  },
  {
    id: "3",
    name: "Assistente Financeiro",
    description: "Auxilia com questões de pagamento",
    model: "GPT-3.5 Turbo",
    status: "inactive",
    conversations: 456,
    successRate: 85,
    avatar: "💰",
    personality: "Formal e detalhista",
    capabilities: ["Cobranças", "Parcelamentos", "Reembolsos", "Notas fiscais"],
  },
  {
    id: "4",
    name: "Agendador",
    description: "Gerencia agendamentos e reuniões",
    model: "GPT-4 Turbo",
    status: "training",
    conversations: 0,
    successRate: 0,
    avatar: "📅",
    personality: "Organizado e eficiente",
    capabilities: ["Agendamento", "Reagendamento", "Confirmações", "Lembretes"],
  },
];

const sampleChat: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "Olá, gostaria de saber mais sobre os planos disponíveis",
    timestamp: "10:30",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "Olá! Fico feliz em ajudar! 😊\n\nTemos 3 planos principais:\n\n**Básico** - R$ 97/mês\n- Até 1.000 conversas\n- 1 usuário\n- Suporte por email\n\n**Profissional** - R$ 197/mês\n- Conversas ilimitadas\n- 5 usuários\n- Suporte prioritário\n- Integrações avançadas\n\n**Enterprise** - Sob consulta\n- Tudo do Profissional\n- Usuários ilimitados\n- SLA dedicado\n- API personalizada\n\nQual plano atende melhor suas necessidades?",
    timestamp: "10:30",
    feedback: "positive",
  },
  {
    id: "3",
    role: "user",
    content: "O profissional parece interessante. Tem desconto para pagamento anual?",
    timestamp: "10:31",
  },
  {
    id: "4",
    role: "assistant",
    content:
      "Ótima escolha! O plano Profissional é nosso mais popular! 🎯\n\nSim, oferecemos **20% de desconto** no pagamento anual!\n\nNo plano Profissional:\n- Mensal: R$ 197/mês\n- Anual: R$ 157,60/mês (economia de R$ 472/ano)\n\nAlém disso, no pagamento anual você ganha:\n- ✅ 2 meses grátis de bônus\n- ✅ Onboarding personalizado\n- ✅ Treinamento exclusivo\n\nPosso preparar uma proposta personalizada para você?",
    timestamp: "10:32",
  },
];

export function AIAssistant() {
  const [view, setView] = useState<"agents" | "playground" | "settings">("agents");
  const [agents, setAgents] = useState(sampleAgents);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(sampleChat);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Entendi! Vou processar sua solicitação.\n\nCom base no que você mencionou, posso te ajudar de algumas formas:\n\n1. **Enviar uma proposta detalhada** por email\n2. **Agendar uma demonstração** com nosso time\n3. **Liberar um trial gratuito** de 14 dias\n\nQual opção você prefere?",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const renderAgents = () => (
    <div className="flex-1 overflow-auto bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Assistentes de IA</h2>
            <p className="text-muted-foreground">
              Configure agentes inteligentes para automatizar conversas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("playground")}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-medium text-foreground hover:bg-secondary"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Playground</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Agente</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-pink-500/20 p-2">
                <Sparkles className="h-5 w-5 text-pink-400" />
              </div>
              <span className="text-sm text-muted-foreground">Agentes Ativos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {agents.filter((a) => a.status === "active").length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-sm text-muted-foreground">Conversas IA</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {agents.reduce((sum, a) => sum + a.conversations, 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/20 p-2">
                <Target className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-sm text-muted-foreground">Taxa de Sucesso</span>
            </div>
            <p className="text-2xl font-bold text-foreground">89%</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-amber-500/20 p-2">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <span className="text-sm text-muted-foreground">Tempo Médio</span>
            </div>
            <p className="text-2xl font-bold text-foreground">1.2s</p>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg"
              onClick={() => setSelectedAgent(agent)}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-2xl">
                    {agent.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.model}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    agent.status === "active"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : agent.status === "training"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-zinc-500/20 text-zinc-400"
                  }`}
                >
                  {agent.status === "active"
                    ? "Ativo"
                    : agent.status === "training"
                      ? "Treinando"
                      : "Inativo"}
                </span>
              </div>

              <p className="mb-4 text-sm text-muted-foreground">{agent.description}</p>

              <div className="mb-4 flex flex-wrap gap-1">
                {agent.capabilities.slice(0, 3).map((cap) => (
                  <span
                    key={cap}
                    className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {cap}
                  </span>
                ))}
                {agent.capabilities.length > 3 && (
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    +{agent.capabilities.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    {agent.conversations.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                    {agent.successRate}%
                  </span>
                </div>
                <button
                  className="rounded p-1 opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}

          {/* Create New Agent Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 p-5 text-muted-foreground transition-all hover:border-primary hover:text-primary"
          >
            <div className="rounded-full border-2 border-current p-3">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-medium">Criar Novo Agente</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPlayground = () => (
    <div className="flex flex-1 overflow-hidden">
      {/* Chat Area */}
      <div className="flex flex-1 flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("agents")}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Voltar
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-xl">
                🤖
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Vendedor Virtual</h3>
                <p className="text-sm text-muted-foreground">GPT-4 Turbo • Ativo</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary">
              <RotateCcw className="h-4 w-4" />
              Resetar
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary">
              <Settings className="h-4 w-4" />
              Configurar
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl ${
                    msg.role === "user" ? "order-2" : "order-1"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-card-foreground shadow-sm border border-border"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  </div>
                  <div
                    className={`mt-2 flex items-center gap-2 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1">
                        <button
                          className={`rounded p-1 hover:bg-secondary ${
                            msg.feedback === "positive" ? "text-emerald-400" : "text-muted-foreground"
                          }`}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button
                          className={`rounded p-1 hover:bg-secondary ${
                            msg.feedback === "negative" ? "text-red-400" : "text-muted-foreground"
                          }`}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                        <button className="rounded p-1 text-muted-foreground hover:bg-secondary">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card p-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2">
              <button className="rounded-lg p-2 hover:bg-secondary">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="flex-1 rounded-xl border border-border bg-secondary px-4 py-3">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Digite uma mensagem para testar o agente..."
                  rows={1}
                  className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <button className="rounded-lg p-2 hover:bg-secondary">
                <Mic className="h-5 w-5 text-muted-foreground" />
              </button>
              <button
                onClick={handleSendMessage}
                className="rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Pressione Enter para enviar • Shift + Enter para nova linha
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Suggestions */}
      <div className="w-80 flex-shrink-0 overflow-y-auto border-l border-border bg-card">
        <div className="p-4">
          <h3 className="mb-4 font-semibold text-foreground">Sugestões de Teste</h3>

          <div className="space-y-2">
            {[
              "Quero saber sobre os preços",
              "Vocês fazem parcelamento?",
              "Quanto tempo demora a entrega?",
              "Posso cancelar a qualquer momento?",
              "Tem suporte 24 horas?",
              "Como funciona o trial?",
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(suggestion)}
                className="flex w-full items-center gap-2 rounded-lg border border-border bg-secondary p-3 text-left text-sm text-foreground transition-all hover:border-primary/50"
              >
                <Lightbulb className="h-4 w-4 flex-shrink-0 text-amber-400" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <h4 className="mb-3 text-sm font-semibold text-foreground">Métricas em Tempo Real</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tempo de resposta</span>
                <span className="text-sm font-medium text-foreground">1.2s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tokens usados</span>
                <span className="text-sm font-medium text-foreground">856</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Confiança</span>
                <span className="text-sm font-medium text-emerald-400">94%</span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <h4 className="mb-3 text-sm font-semibold text-foreground">Contexto Detectado</h4>
            <div className="flex flex-wrap gap-1">
              <span className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">
                Interesse em preços
              </span>
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
                Lead qualificado
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                Alto potencial
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {view === "agents" && renderAgents()}
      {view === "playground" && renderPlayground()}

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-lg font-semibold text-foreground">Criar Novo Agente IA</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded p-1 hover:bg-secondary"
              >
                <ChevronRight className="h-5 w-5 rotate-45 text-muted-foreground" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Nome do Agente
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Vendedor Virtual"
                      className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Modelo de IA
                    </label>
                    <select className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                      <option>GPT-4 Turbo</option>
                      <option>GPT-4</option>
                      <option>GPT-3.5 Turbo</option>
                      <option>Claude 3 Opus</option>
                      <option>Claude 3 Sonnet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Descrição
                  </label>
                  <input
                    type="text"
                    placeholder="O que este agente faz?"
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Personalidade
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Descreva como o agente deve se comportar..."
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Instruções do Sistema
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Você é um assistente de vendas profissional. Seu objetivo é..."
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Capacidades
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      "Qualificação de leads",
                      "Apresentação de produtos",
                      "Negociação",
                      "Suporte técnico",
                      "Agendamento",
                      "FAQ",
                      "Cobranças",
                      "Follow-up",
                    ].map((cap) => (
                      <label key={cap} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border bg-secondary text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">{cap}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Temperatura
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="70"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Preciso (0)</span>
                    <span>Criativo (1)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Criar Agente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
