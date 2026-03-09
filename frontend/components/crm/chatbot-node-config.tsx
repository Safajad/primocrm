"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Bot,
  Sparkles,
  User,
  Copy,
  RotateCcw,
  Settings,
  Save,
  MessageSquare,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useCRMStore, type Contact } from "@/lib/store";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatbotNodeConfigProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  nodeData: any;
  onSave: (config: ChatbotConfig) => void;
}

export interface ChatbotConfig {
  model: "gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo";
  systemPrompt: string;
  temperature: number;
  linkedContactId: string | null;
  name: string;
}

export function ChatbotNodeConfig({
  isOpen,
  onClose,
  nodeId,
  nodeData,
  onSave,
}: ChatbotNodeConfigProps) {
  const { contacts, settings } = useCRMStore();
  const [activeTab, setActiveTab] = useState<"config" | "test">("config");
  
  // Config state
  const [config, setConfig] = useState<ChatbotConfig>({
    model: nodeData?.config?.model || "gpt-3.5-turbo",
    systemPrompt: nodeData?.config?.systemPrompt || "Você é um assistente de atendimento do Primo CRM. Seja profissional, prestativo e objetivo nas respostas.",
    temperature: nodeData?.config?.temperature || 0.7,
    linkedContactId: nodeData?.config?.linkedContactId || null,
    name: nodeData?.label || "Chatbot IA",
  });

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedContact = contacts.find(c => c.id === config.linkedContactId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt: config.systemPrompt,
          model: config.model,
          temperature: config.temperature,
          contactInfo: selectedContact ? {
            name: selectedContact.name,
            email: selectedContact.email,
            phone: selectedContact.phone,
            company: selectedContact.company,
            tags: selectedContact.tags,
            notes: selectedContact.notes,
          } : null,
          sessionId: nodeId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao enviar mensagem");
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: data.id || `msg-${Date.now()}`,
        role: "assistant",
        content: data.content || data.parts?.[0]?.text || "Sem resposta",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: `msg-error-${Date.now()}`,
        role: "assistant",
        content: error instanceof Error 
          ? (error.message.includes("429") || error.message.includes("quota")
            ? "Sua chave OpenAI excedeu o limite de uso. Verifique seu plano e creditos em platform.openai.com"
            : `Erro: ${error.message}`)
          : "Falha ao conectar com a IA",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, config, selectedContact, nodeId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Configurar Chatbot IA</h3>
              <p className="text-sm text-muted-foreground">
                Configure o comportamento do chatbot para este nó
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-card">
          <button
            onClick={() => setActiveTab("config")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "config"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            Configuracao
          </button>
          <button
            onClick={() => setActiveTab("test")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "test"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Testar Chat
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "config" ? (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Nome */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Nome do Chatbot
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="Ex: Atendente Virtual"
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Modelo */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Modelo de IA
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", desc: "Rapido e economico" },
                      { id: "gpt-4", name: "GPT-4", desc: "Mais inteligente" },
                      { id: "gpt-4-turbo", name: "GPT-4 Turbo", desc: "Melhor custo-beneficio" },
                    ].map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setConfig({ ...config, model: model.id as any })}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          config.model === model.id
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-medium text-foreground">{model.name}</div>
                        <div className="text-xs text-muted-foreground">{model.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* System Prompt */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Instrucoes do Sistema
                  </label>
                  <textarea
                    rows={5}
                    value={config.systemPrompt}
                    onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                    placeholder="Descreva como o chatbot deve se comportar..."
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Define a personalidade e comportamento do chatbot
                  </p>
                </div>

                {/* Temperatura */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Temperatura: {config.temperature.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Mais preciso</span>
                    <span>Mais criativo</span>
                  </div>
                </div>

                {/* Vincular Contato */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Vincular a Contato (opcional)
                  </label>
                  <select
                    value={config.linkedContactId || ""}
                    onChange={(e) => setConfig({ ...config, linkedContactId: e.target.value || null })}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="">Nenhum contato vinculado</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} - {contact.email}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    O chatbot tera acesso as informacoes do contato selecionado
                  </p>
                </div>

                {/* Info do contato vinculado */}
                {selectedContact && (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">Contato Vinculado</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nome:</span>
                        <span className="ml-2 text-foreground">{selectedContact.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <span className="ml-2 text-foreground">{selectedContact.email}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Telefone:</span>
                        <span className="ml-2 text-foreground">{selectedContact.phone}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Empresa:</span>
                        <span className="ml-2 text-foreground">{selectedContact.company || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Chat Test Tab */
            <div className="flex h-full flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                      <p className="text-lg font-medium text-foreground mb-2">
                        Teste o Chatbot
                      </p>
                      <p className="text-muted-foreground">
                        Envie uma mensagem para testar as respostas com a configuracao atual
                      </p>
                    </div>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] ${msg.role === "user" ? "order-2" : ""}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "border border-border bg-secondary text-foreground"
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                        </div>
                        <div
                          className={`mt-1 flex items-center gap-2 text-xs text-muted-foreground ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span>
                            {msg.timestamp.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {msg.role === "assistant" && (
                            <button
                              onClick={() => copyMessage(msg.content)}
                              className="rounded p-1 hover:bg-secondary"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl border border-border bg-secondary px-4 py-3">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-border bg-card p-4">
                <div className="max-w-2xl mx-auto flex items-end gap-3">
                  <button
                    onClick={() => setMessages([])}
                    className="rounded-lg p-2.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    title="Limpar conversa"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                  <div className="flex-1 rounded-xl border border-border bg-secondary px-4 py-3">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Digite uma mensagem de teste..."
                      rows={1}
                      className="max-h-32 w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="rounded-xl bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-secondary/50 px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Modelo: <span className="font-medium text-foreground">{config.model}</span>
            {selectedContact && (
              <> | Contato: <span className="font-medium text-foreground">{selectedContact.name}</span></>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Save className="h-4 w-4" />
              Salvar Configuracao
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
