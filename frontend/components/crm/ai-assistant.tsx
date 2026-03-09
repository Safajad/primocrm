"use client";

import React from "react"

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Sparkles,
  Bot,
  MessageSquare,
  Plus,
  Play,
  Pause,
  Trash2,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Send,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  ChevronRight,
  AlertCircle,
  Key,
  Check,
  X,
  Eye,
  EyeOff,
  Settings,
} from "lucide-react";
import { useCRMStore, type AIAgent } from "@/lib/store";

export function AIAssistant() {
  const { aiAgents, addAIAgent, updateAIAgent, deleteAIAgent, settings, updateSettings } =
    useCRMStore();

  const [view, setView] = useState<"agents" | "playground" | "config">("agents");
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    model: "openai/gpt-4o-mini",
    personality: "",
    systemPrompt: "",
    temperature: 0.7,
    capabilities: [] as string[],
  });

  // Use AI SDK useChat hook
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages,
          systemPrompt: selectedAgent?.systemPrompt,
          model: selectedAgent?.model || "openai/gpt-4o-mini",
          temperature: selectedAgent?.temperature || 0.7,
        },
      }),
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !selectedAgent) return;

    sendMessage({ text: input });
    setInput("");
  };

  const handleSaveApiKey = () => {
    updateSettings({ openaiApiKey: apiKeyInput });
    setShowApiKeyModal(false);
    setApiKeyInput("");
  };

  const handleCreateAgent = () => {
    if (!newAgent.name) return;

    const agent: AIAgent = {
      id: `agent-${Date.now()}`,
      name: newAgent.name,
      description: newAgent.description || "Agente personalizado",
      model: newAgent.model,
      status: "inactive",
      conversations: 0,
      successRate: 0,
      avatar: "AI",
      personality: newAgent.personality,
      capabilities: newAgent.capabilities.length > 0 ? newAgent.capabilities : ["Atendimento", "FAQ"],
      systemPrompt: newAgent.systemPrompt || `Voce e um assistente de ${newAgent.name}. Seja profissional e prestativo.`,
      temperature: newAgent.temperature,
      apiKeyConfigured: !!settings.openaiApiKey,
    };

    addAIAgent(agent);
    setNewAgent({
      name: "",
      description: "",
      model: "openai/gpt-4o-mini",
      personality: "",
      systemPrompt: "",
      temperature: 0.7,
      capabilities: [],
    });
    setShowCreateModal(false);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
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
              onClick={() => setShowApiKeyModal(true)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-medium ${
                settings.openaiApiKey
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                  : "border-amber-500/50 bg-amber-500/10 text-amber-500"
              }`}
            >
              <Key className="h-4 w-4" />
              <span>{settings.openaiApiKey ? "API Configurada" : "Configurar API"}</span>
            </button>
            <button
              onClick={() => {
                setSelectedAgent(aiAgents[0] || null);
                setMessages([]);
                setView("playground");
              }}
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
                <Sparkles className="h-5 w-5 text-pink-500" />
              </div>
              <span className="text-sm text-muted-foreground">Agentes Ativos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {aiAgents.filter((a) => a.status === "active").length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-sm text-muted-foreground">Conversas IA</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {aiAgents.reduce((sum, a) => sum + a.conversations, 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/20 p-2">
                <Target className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="text-sm text-muted-foreground">Taxa de Sucesso</span>
            </div>
            <p className="text-2xl font-bold text-foreground">89%</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-amber-500/20 p-2">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <span className="text-sm text-muted-foreground">Tempo Medio</span>
            </div>
            <p className="text-2xl font-bold text-foreground">1.2s</p>
          </div>
        </div>

        {/* API Key Warning */}
        {!settings.openaiApiKey && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/50 bg-amber-500/10 p-4">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <div className="flex-1">
              <p className="font-medium text-amber-500">API Key nao configurada</p>
              <p className="text-sm text-amber-500/80">
                A IA funcionara com o modelo padrao. Configure sua chave OpenAI para mais opcoes.
              </p>
            </div>
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400"
            >
              Configurar
            </button>
          </div>
        )}

        {/* Agents Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aiAgents.map((agent) => (
            <div
              key={agent.id}
              className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg"
              onClick={() => {
                setSelectedAgent(agent);
                setMessages([]);
                setView("playground");
              }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-primary/20 text-lg font-bold text-primary">
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
                      ? "bg-emerald-500/20 text-emerald-500"
                      : agent.status === "training"
                        ? "bg-amber-500/20 text-amber-500"
                        : "bg-zinc-500/20 text-zinc-400"
                  }`}
                >
                  {agent.status === "active" ? "Ativo" : agent.status === "training" ? "Treinando" : "Inativo"}
                </span>
              </div>

              <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{agent.description}</p>

              <div className="mb-4 flex flex-wrap gap-1">
                {agent.capabilities.slice(0, 3).map((cap) => (
                  <span key={cap} className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
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
                  <span className="flex items-center gap-1 text-emerald-500">
                    <TrendingUp className="h-4 w-4" />
                    {agent.successRate}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="rounded p-1 opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAIAgent(agent.id, {
                        status: agent.status === "active" ? "inactive" : "active",
                      });
                    }}
                  >
                    {agent.status === "active" ? (
                      <Pause className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Play className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    className="rounded p-1 opacity-0 transition-opacity hover:bg-secondary hover:text-destructive group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAIAgent(agent.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
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
    <div className="flex h-full overflow-hidden">
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
            {selectedAgent && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-primary/20 text-lg font-bold text-primary">
                  {selectedAgent.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedAgent.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedAgent.model} - {selectedAgent.status === "active" ? "Ativo" : "Inativo"}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar
            </button>
            <select
              value={selectedAgent?.id || ""}
              onChange={(e) => {
                const agent = aiAgents.find((a) => a.id === e.target.value);
                setSelectedAgent(agent || null);
                setMessages([]);
              }}
              className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {aiAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.length === 0 && (
              <div className="py-12 text-center">
                <Bot className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Teste o {selectedAgent?.name || "Agente"}
                </p>
                <p className="text-muted-foreground">
                  Inicie uma conversa para testar as respostas do agente
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-2xl ${msg.role === "user" ? "order-2" : "order-1"}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-card-foreground shadow-sm"
                    }`}
                  >
                    {msg.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <p key={index} className="whitespace-pre-wrap text-sm">
                            {part.text}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <div
                    className={`mt-2 flex items-center gap-2 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground">
                      {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1">
                        <button className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-emerald-500">
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-red-500">
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            const text = msg.parts
                              .filter((p): p is { type: "text"; text: string } => p.type === "text")
                              .map((p) => p.text)
                              .join("");
                            handleCopyMessage(text);
                          }}
                          className="rounded p-1 text-muted-foreground hover:bg-secondary"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card p-4">
          <form onSubmit={handleSendMessage} className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2">
              <button type="button" className="rounded-lg p-2 hover:bg-secondary">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="flex-1 rounded-xl border border-border bg-secondary px-4 py-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Digite sua mensagem..."
                  rows={1}
                  className="max-h-32 w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-lg bg-primary p-3 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Agent Config Sidebar */}
      {selectedAgent && (
        <div className="w-80 flex-shrink-0 overflow-y-auto border-l border-border bg-card p-4">
          <h3 className="mb-4 font-semibold text-foreground">Configuracao do Agente</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Nome</label>
              <input
                type="text"
                value={selectedAgent.name}
                onChange={(e) => updateAIAgent(selectedAgent.id, { name: e.target.value })}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Modelo</label>
              <select
                value={selectedAgent.model}
                onChange={(e) => updateAIAgent(selectedAgent.id, { model: e.target.value })}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                <option value="openai/gpt-4o">GPT-4o</option>
                <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
                <option value="anthropic/claude-3-5-sonnet-latest">Claude 3.5 Sonnet</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Temperatura: {selectedAgent.temperature}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedAgent.temperature}
                onChange={(e) => updateAIAgent(selectedAgent.id, { temperature: Number.parseFloat(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Menor = mais focado, Maior = mais criativo
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Instrucoes do Sistema</label>
              <textarea
                rows={6}
                value={selectedAgent.systemPrompt}
                onChange={(e) => updateAIAgent(selectedAgent.id, { systemPrompt: e.target.value })}
                placeholder="Instrucoes para o agente..."
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Status</label>
              <button
                onClick={() =>
                  updateAIAgent(selectedAgent.id, {
                    status: selectedAgent.status === "active" ? "inactive" : "active",
                  })
                }
                className={`w-full rounded-lg px-4 py-2 text-sm font-medium ${
                  selectedAgent.status === "active"
                    ? "bg-emerald-500/20 text-emerald-500"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {selectedAgent.status === "active" ? "Ativo" : "Inativo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {view === "agents" ? renderAgents() : renderPlayground()}

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Criar Novo Agente</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Nome do Agente</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="Ex: Vendedor Virtual"
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Descricao</label>
                <input
                  type="text"
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  placeholder="Ex: Especialista em vendas"
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Modelo</label>
                <select
                  value={newAgent.model}
                  onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="openai/gpt-4o-mini">GPT-4o Mini (Recomendado)</option>
                  <option value="openai/gpt-4o">GPT-4o</option>
                  <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="anthropic/claude-3-5-sonnet-latest">Claude 3.5 Sonnet</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Instrucoes do Sistema</label>
                <textarea
                  rows={4}
                  value={newAgent.systemPrompt}
                  onChange={(e) => setNewAgent({ ...newAgent, systemPrompt: e.target.value })}
                  placeholder="Descreva como o agente deve se comportar..."
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Temperatura: {newAgent.temperature}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newAgent.temperature}
                  onChange={(e) => setNewAgent({ ...newAgent, temperature: Number.parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateAgent}
                  disabled={!newAgent.name}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Criar Agente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Configurar API Key</h3>
              <button onClick={() => setShowApiKeyModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              A IA ja funciona sem configuracao. Configure sua propria chave OpenAI para ter controle total.
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">OpenAI API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKeyInput || settings.openaiApiKey}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-..."
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2 pr-10 text-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {settings.openaiApiKey && (
                <div className="flex items-center gap-2 text-sm text-emerald-500">
                  <Check className="h-4 w-4" />
                  API Key ja configurada
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveApiKey}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
