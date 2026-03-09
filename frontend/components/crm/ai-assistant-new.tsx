"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Bot,
  MessageSquare,
  Plus,
  Play,
  Pause,
  Trash2,
  Target,
  TrendingUp,
  Clock,
  Send,
  Copy,
  RotateCcw,
  ChevronRight,
  Check,
  X,
  Settings,
  BookOpen,
  Zap,
  MessageCircle,
  Instagram,
  Facebook,
  Mail,
  Globe,
  FileText,
  Link,
  HelpCircle,
  Sliders,
  Smile,
  AlertTriangle,
  User,
  Volume2,
  Loader2,
  Power,
  Edit3,
  Save,
  ChevronDown,
} from "lucide-react";
import { useCRMStore, type AIAgent } from "@/lib/store";

// Types for the new structure
interface KnowledgeSource {
  id: string;
  type: "text" | "faq" | "url";
  title: string;
  content: string;
  createdAt: string;
}

interface AgentDirectives {
  responseLength: "short" | "medium" | "long";
  creativity: number; // 0-100
  tone: "formal" | "casual" | "friendly" | "professional";
  useEmojis: boolean;
  askFollowUp: boolean;
  transferToHuman: boolean;
  language: string;
  workingHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  offlineMessage: string;
}

interface AgentChannels {
  whatsapp: boolean;
  instagram: boolean;
  telegram: boolean;
  facebook: boolean;
  email: boolean;
  website: boolean;
}

// Extended AIAgent type
interface ExtendedAgent extends AIAgent {
  channels?: AgentChannels;
  knowledge?: KnowledgeSource[];
  directives?: AgentDirectives;
  isActive?: boolean;
}

const defaultDirectives: AgentDirectives = {
  responseLength: "medium",
  creativity: 50,
  tone: "professional",
  useEmojis: false,
  askFollowUp: true,
  transferToHuman: true,
  language: "pt-BR",
  workingHours: {
    enabled: false,
    start: "09:00",
    end: "18:00",
  },
  offlineMessage: "Obrigado pelo contato! Retornaremos em breve.",
};

const defaultChannels: AgentChannels = {
  whatsapp: true,
  instagram: false,
  telegram: false,
  facebook: false,
  email: false,
  website: false,
};

export function AIAssistantNew() {
  const { aiAgents, addAIAgent, updateAIAgent, deleteAIAgent } = useCRMStore();

  const [view, setView] = useState<"list" | "edit">("list");
  const [selectedAgent, setSelectedAgent] = useState<ExtendedAgent | null>(null);
  const [activeTab, setActiveTab] = useState<"channels" | "knowledge" | "directives">("channels");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Chat test state
  const [showTestChat, setShowTestChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{id: string; role: string; content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Knowledge source form
  const [newKnowledge, setNewKnowledge] = useState({
    type: "text" as "text" | "faq" | "url",
    title: "",
    content: "",
  });

  // New agent form
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    avatar: "",
  });

  // PDF Upload state
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfDocuments, setPdfDocuments] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch PDF documents
  const fetchPdfDocuments = useCallback(async () => {
    if (!selectedAgent) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/crm/knowledge/documents?agent_id=${selectedAgent.id}`, {
        headers: { 'x-company-id': 'default-company' }
      });
      if (response.ok) {
        const docs = await response.json();
        setPdfDocuments(docs);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  }, [selectedAgent]);

  useEffect(() => {
    if (selectedAgent && activeTab === 'knowledge') {
      fetchPdfDocuments();
    }
  }, [selectedAgent, activeTab, fetchPdfDocuments]);

  // Handle PDF upload
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedAgent) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Apenas arquivos PDF sao aceitos');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Maximo: 10MB');
      return;
    }

    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/crm/knowledge/upload?agent_id=${selectedAgent.id}`, {
        method: 'POST',
        headers: { 'x-company-id': 'default-company' },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        fetchPdfDocuments();
        alert(`Documento "${result.filename}" carregado com sucesso!`);
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail || 'Falha ao carregar documento'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao carregar documento');
    } finally {
      setUploadingPdf(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Delete PDF document
  const handleDeletePdf = async (docId: string) => {
    if (!confirm('Excluir este documento?')) return;
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/crm/knowledge/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'x-company-id': 'default-company' }
      });
      
      if (response.ok) {
        fetchPdfDocuments();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Initialize agent with extended properties
  const getExtendedAgent = (agent: AIAgent): ExtendedAgent => ({
    ...agent,
    channels: (agent as ExtendedAgent).channels || defaultChannels,
    knowledge: (agent as ExtendedAgent).knowledge || [],
    directives: (agent as ExtendedAgent).directives || defaultDirectives,
    isActive: (agent as ExtendedAgent).isActive ?? agent.status === "active",
  });

  // Handle agent selection
  const handleSelectAgent = (agent: AIAgent) => {
    setSelectedAgent(getExtendedAgent(agent));
    setActiveTab("channels");
    setView("edit");
  };

  // Handle channel toggle
  const handleChannelToggle = (channel: keyof AgentChannels) => {
    if (!selectedAgent) return;
    const updated = {
      ...selectedAgent,
      channels: {
        ...selectedAgent.channels!,
        [channel]: !selectedAgent.channels![channel],
      },
    };
    setSelectedAgent(updated);
  };

  // Handle directive change
  const handleDirectiveChange = <K extends keyof AgentDirectives>(
    key: K,
    value: AgentDirectives[K]
  ) => {
    if (!selectedAgent) return;
    setSelectedAgent({
      ...selectedAgent,
      directives: {
        ...selectedAgent.directives!,
        [key]: value,
      },
    });
  };

  // Add knowledge source
  const handleAddKnowledge = () => {
    if (!selectedAgent || !newKnowledge.title || !newKnowledge.content) return;
    if (newKnowledge.content.length > 3000) {
      alert("O conteudo deve ter no maximo 3000 caracteres");
      return;
    }
    
    const knowledge: KnowledgeSource = {
      id: `knowledge-${Date.now()}`,
      type: newKnowledge.type,
      title: newKnowledge.title,
      content: newKnowledge.content,
      createdAt: new Date().toISOString(),
    };
    
    setSelectedAgent({
      ...selectedAgent,
      knowledge: [...(selectedAgent.knowledge || []), knowledge],
    });
    
    setNewKnowledge({ type: "text", title: "", content: "" });
  };

  // Remove knowledge source
  const handleRemoveKnowledge = (id: string) => {
    if (!selectedAgent) return;
    setSelectedAgent({
      ...selectedAgent,
      knowledge: selectedAgent.knowledge?.filter((k) => k.id !== id) || [],
    });
  };

  // Save agent
  const handleSaveAgent = () => {
    if (!selectedAgent) return;
    updateAIAgent(selectedAgent.id, {
      ...selectedAgent,
      status: selectedAgent.isActive ? "active" : "inactive",
    } as any);
    setView("list");
  };

  // Toggle agent active state
  const handleToggleActive = () => {
    if (!selectedAgent) return;
    setSelectedAgent({
      ...selectedAgent,
      isActive: !selectedAgent.isActive,
    });
  };

  // Create new agent
  const handleCreateAgent = () => {
    if (!newAgent.name) return;
    
    const agent: ExtendedAgent = {
      id: `agent-${Date.now()}`,
      name: newAgent.name,
      description: newAgent.description || "Agente personalizado",
      model: "gpt-4-turbo",
      status: "inactive",
      conversations: 0,
      successRate: 0,
      avatar: newAgent.avatar || newAgent.name.substring(0, 2).toUpperCase(),
      personality: "",
      capabilities: [],
      systemPrompt: "",
      temperature: 0.7,
      apiKeyConfigured: true,
      channels: defaultChannels,
      knowledge: [],
      directives: defaultDirectives,
      isActive: false,
    };
    
    addAIAgent(agent as AIAgent);
    setNewAgent({ name: "", description: "", avatar: "" });
    setShowCreateModal(false);
    handleSelectAgent(agent);
  };

  // Build system prompt from directives and knowledge
  const buildSystemPrompt = (agent: ExtendedAgent): string => {
    const d = agent.directives!;
    let prompt = `Voce e ${agent.name}, um assistente de IA do Primo CRM.\n\n`;
    
    // Tone
    const toneMap = {
      formal: "Use um tom formal e profissional.",
      casual: "Use um tom casual e descontraido.",
      friendly: "Use um tom amigavel e acolhedor.",
      professional: "Use um tom profissional mas acessivel.",
    };
    prompt += toneMap[d.tone] + "\n";
    
    // Response length
    const lengthMap = {
      short: "Mantenha respostas curtas e diretas (1-2 frases).",
      medium: "Use respostas de tamanho medio (2-4 frases).",
      long: "Forneca respostas detalhadas e completas.",
    };
    prompt += lengthMap[d.responseLength] + "\n";
    
    // Creativity
    if (d.creativity > 70) {
      prompt += "Seja criativo e inovador nas respostas.\n";
    } else if (d.creativity < 30) {
      prompt += "Seja objetivo e factual, evite elaboracoes.\n";
    }
    
    // Emojis
    if (d.useEmojis) {
      prompt += "Use emojis ocasionalmente para tornar a conversa mais leve.\n";
    } else {
      prompt += "Evite usar emojis.\n";
    }
    
    // Follow up
    if (d.askFollowUp) {
      prompt += "Faca perguntas de acompanhamento quando apropriado.\n";
    }
    
    // Transfer
    if (d.transferToHuman) {
      prompt += "Se nao souber responder ou o cliente pedir, ofereca transferir para um atendente humano.\n";
    }
    
    // Knowledge base
    if (agent.knowledge && agent.knowledge.length > 0) {
      prompt += "\n--- BASE DE CONHECIMENTO ---\n";
      agent.knowledge.forEach((k) => {
        prompt += `\n[${k.title}]: ${k.content}\n`;
      });
      prompt += "\nUse essas informacoes para responder perguntas relacionadas.\n";
    }
    
    return prompt;
  };

  // Test chat
  const handleSendTestMessage = async () => {
    if (!chatInput.trim() || isLoading || !selectedAgent) return;
    
    const userMsg = { id: `msg-${Date.now()}`, role: "user", content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsLoading(true);
    
    try {
      const systemPrompt = buildSystemPrompt(selectedAgent);
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt,
          model: "gpt-3.5-turbo",
          temperature: selectedAgent.directives?.creativity 
            ? selectedAgent.directives.creativity / 100 
            : 0.7,
        }),
      });
      
      const data = await response.json();
      if (data.content) {
        setChatMessages((prev) => [
          ...prev,
          { id: `msg-${Date.now()}`, role: "assistant", content: data.content },
        ]);
      } else if (data.error) {
        setChatMessages((prev) => [
          ...prev,
          { id: `msg-${Date.now()}`, role: "assistant", content: `Erro: ${data.error}` },
        ]);
      }
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        { id: `msg-${Date.now()}`, role: "assistant", content: "Erro ao conectar com a IA" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Channel icon component
  const ChannelIcon = ({ channel }: { channel: string }) => {
    const icons: Record<string, React.ReactNode> = {
      whatsapp: <MessageCircle className="h-5 w-5" />,
      instagram: <Instagram className="h-5 w-5" />,
      telegram: <Send className="h-5 w-5" />,
      facebook: <Facebook className="h-5 w-5" />,
      email: <Mail className="h-5 w-5" />,
      website: <Globe className="h-5 w-5" />,
    };
    return <>{icons[channel]}</>;
  };

  // Render agent list
  const renderAgentList = () => (
    <div className="flex-1 overflow-auto bg-background p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Assistentes de IA</h2>
            <p className="text-muted-foreground">
              Configure agentes inteligentes para automatizar atendimentos
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
            data-testid="new-agent-btn"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Agente</span>
          </button>
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

        {/* Agents Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aiAgents.map((agent) => {
            const ext = getExtendedAgent(agent);
            const activeChannels = Object.entries(ext.channels || {})
              .filter(([_, v]) => v)
              .map(([k]) => k);
            
            return (
              <div
                key={agent.id}
                className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg"
                onClick={() => handleSelectAgent(agent)}
                data-testid={`agent-card-${agent.id}`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-primary/20 text-lg font-bold text-primary">
                      {agent.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">{agent.description}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      agent.status === "active"
                        ? "bg-emerald-500/20 text-emerald-500"
                        : "bg-zinc-500/20 text-zinc-400"
                    }`}
                  >
                    {agent.status === "active" ? "Ativo" : "Inativo"}
                  </span>
                </div>

                {/* Active channels */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Canais:</span>
                  <div className="flex gap-1">
                    {activeChannels.length > 0 ? (
                      activeChannels.map((ch) => (
                        <div
                          key={ch}
                          className="rounded bg-secondary p-1"
                          title={ch}
                        >
                          <ChannelIcon channel={ch} />
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Nenhum</span>
                    )}
                  </div>
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
            );
          })}

          {/* Create New Agent Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 p-5 text-muted-foreground transition-all hover:border-primary hover:text-primary"
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

  // Render agent editor
  const renderAgentEditor = () => {
    if (!selectedAgent) return null;
    
    return (
      <div className="flex h-full overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView("list")}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Voltar
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-primary/20 text-lg font-bold text-primary">
                  {selectedAgent.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedAgent.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedAgent.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Active toggle */}
              <button
                onClick={handleToggleActive}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedAgent.isActive
                    ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                    : "bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/30"
                }`}
              >
                <Power className="h-4 w-4" />
                {selectedAgent.isActive ? "Ativo" : "Inativo"}
              </button>
              
              <button
                onClick={() => {
                  setChatMessages([]);
                  setShowTestChat(true);
                }}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                <MessageSquare className="h-4 w-4" />
                Testar
              </button>
              
              <button
                onClick={handleSaveAgent}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                Salvar
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border bg-card">
            <button
              onClick={() => setActiveTab("channels")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "channels"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              Canais
            </button>
            <button
              onClick={() => setActiveTab("knowledge")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "knowledge"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Conhecimento
            </button>
            <button
              onClick={() => setActiveTab("directives")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "directives"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sliders className="h-4 w-4" />
              Diretrizes
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "channels" && renderChannelsTab()}
            {activeTab === "knowledge" && renderKnowledgeTab()}
            {activeTab === "directives" && renderDirectivesTab()}
          </div>
        </div>

        {/* Test Chat Sidebar */}
        {showTestChat && (
          <div className="w-96 flex-shrink-0 border-l border-border bg-card flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-semibold text-foreground">Testar Agente</h3>
              <button
                onClick={() => setShowTestChat(false)}
                className="rounded p-1 hover:bg-secondary"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Envie uma mensagem para testar o agente
                  </p>
                </div>
              )}
              
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setChatMessages([])}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                  title="Limpar conversa"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendTestMessage()}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <button
                  onClick={handleSendTestMessage}
                  disabled={!chatInput.trim() || isLoading}
                  className="rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Channels Tab
  const renderChannelsTab = () => {
    if (!selectedAgent) return null;
    
    const channels = [
      { id: "whatsapp", name: "WhatsApp", icon: MessageCircle, color: "text-green-500", bgColor: "bg-green-500/20" },
      { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500", bgColor: "bg-pink-500/20" },
      { id: "telegram", name: "Telegram", icon: Send, color: "text-blue-500", bgColor: "bg-blue-500/20" },
      { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600", bgColor: "bg-blue-600/20" },
      { id: "email", name: "Email", icon: Mail, color: "text-amber-500", bgColor: "bg-amber-500/20" },
      { id: "website", name: "Website Chat", icon: Globe, color: "text-purple-500", bgColor: "bg-purple-500/20" },
    ];
    
    return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Canais de Atendimento</h3>
          <p className="text-sm text-muted-foreground">
            Selecione em quais canais este agente deve atender automaticamente
          </p>
        </div>
        
        <div className="space-y-3">
          {channels.map((channel) => {
            const isActive = selectedAgent.channels?.[channel.id as keyof AgentChannels] || false;
            const Icon = channel.icon;
            
            return (
              <div
                key={channel.id}
                className={`flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleChannelToggle(channel.id as keyof AgentChannels)}
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl p-3 ${channel.bgColor}`}>
                    <Icon className={`h-6 w-6 ${channel.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{channel.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {isActive ? "Agente ativo neste canal" : "Clique para ativar"}
                    </p>
                  </div>
                </div>
                <div
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    isActive ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <div
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                      isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-500">Importante</p>
              <p className="text-sm text-amber-500/80">
                O agente so respondera automaticamente nos canais que estiverem integrados ao CRM.
                Configure as integracoes na secao "Integracoes" do menu.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Knowledge Tab
  const renderKnowledgeTab = () => {
    if (!selectedAgent) return null;
    
    return (
      <div className="max-w-3xl">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Base de Conhecimento</h3>
          <p className="text-sm text-muted-foreground">
            Adicione informacoes que o agente deve usar para responder perguntas
          </p>
        </div>

        {/* PDF Upload Section */}
        <div className="mb-6 rounded-xl border border-dashed border-primary/50 bg-primary/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Upload de Documento PDF</h4>
                <p className="text-sm text-muted-foreground">Carregue PDFs para alimentar o conhecimento da IA</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              className="hidden"
              data-testid="pdf-upload-input"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPdf}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              data-testid="upload-pdf-btn"
            >
              {uploadingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Upload PDF
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Formatos aceitos: PDF | Tamanho maximo: 10MB</p>
          
          {/* PDF Documents List */}
          {pdfDocuments.length > 0 && (
            <div className="mt-4 space-y-2">
              <h5 className="text-sm font-medium text-foreground">Documentos Carregados ({pdfDocuments.length})</h5>
              {pdfDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {(doc.file_size / 1024).toFixed(1)} KB | {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePdf(doc.id)}
                    className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Add Knowledge Form */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h4 className="font-medium text-foreground mb-4">Adicionar Conhecimento Manual</h4>
          
          {/* Type Selection */}
          <div className="mb-4">
            <label className="text-sm font-medium text-foreground mb-2 block">Tipo</label>
            <div className="flex gap-2">
              {[
                { id: "text", label: "Texto", icon: FileText },
                { id: "faq", label: "FAQ", icon: HelpCircle },
                { id: "url", label: "URL", icon: Link },
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setNewKnowledge({ ...newKnowledge, type: type.id as any })}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      newKnowledge.type === type.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Title */}
          <div className="mb-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              {newKnowledge.type === "faq" ? "Pergunta" : "Titulo"}
            </label>
            <input
              type="text"
              value={newKnowledge.title}
              onChange={(e) => setNewKnowledge({ ...newKnowledge, title: e.target.value })}
              placeholder={newKnowledge.type === "faq" ? "Ex: Qual o horario de funcionamento?" : "Ex: Informacoes da Empresa"}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          
          {/* Content */}
          <div className="mb-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              {newKnowledge.type === "faq" ? "Resposta" : newKnowledge.type === "url" ? "URL" : "Conteudo"}
            </label>
            <textarea
              rows={4}
              value={newKnowledge.content}
              onChange={(e) => setNewKnowledge({ ...newKnowledge, content: e.target.value })}
              placeholder={
                newKnowledge.type === "faq"
                  ? "Ex: Funcionamos de segunda a sexta, das 9h as 18h."
                  : newKnowledge.type === "url"
                  ? "https://exemplo.com/pagina"
                  : "Digite o conteudo..."
              }
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>Maximo de 3000 caracteres</span>
              <span className={newKnowledge.content.length > 3000 ? "text-red-500" : ""}>
                {newKnowledge.content.length}/3000
              </span>
            </div>
          </div>
          
          <button
            onClick={handleAddKnowledge}
            disabled={!newKnowledge.title || !newKnowledge.content || newKnowledge.content.length > 3000}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>
        
        {/* Knowledge List */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">
            Conhecimentos Adicionados ({selectedAgent.knowledge?.length || 0})
          </h4>
          
          {(!selectedAgent.knowledge || selectedAgent.knowledge.length === 0) && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                Nenhum conhecimento adicionado ainda
              </p>
            </div>
          )}
          
          {selectedAgent.knowledge?.map((k) => (
            <div
              key={k.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {k.type === "faq" && <HelpCircle className="h-4 w-4 text-primary" />}
                    {k.type === "text" && <FileText className="h-4 w-4 text-primary" />}
                    {k.type === "url" && <Link className="h-4 w-4 text-primary" />}
                    <span className="text-xs uppercase text-muted-foreground">{k.type}</span>
                  </div>
                  <h5 className="font-medium text-foreground mb-1">{k.title}</h5>
                  <p className="text-sm text-muted-foreground line-clamp-2">{k.content}</p>
                </div>
                <button
                  onClick={() => handleRemoveKnowledge(k.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Directives Tab
  const renderDirectivesTab = () => {
    if (!selectedAgent) return null;
    const d = selectedAgent.directives!;
    
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Diretrizes do Agente</h3>
          <p className="text-sm text-muted-foreground">
            Configure como o agente deve se comportar nas conversas
          </p>
        </div>
        
        {/* Response Length */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-primary" />
            Tamanho das Respostas
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "short", label: "Curta", desc: "1-2 frases" },
              { id: "medium", label: "Media", desc: "2-4 frases" },
              { id: "long", label: "Longa", desc: "Detalhada" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleDirectiveChange("responseLength", opt.id as any)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  d.responseLength === opt.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="font-medium text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Creativity Slider */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Criatividade: {d.creativity}%
          </h4>
          <input
            type="range"
            min="0"
            max="100"
            value={d.creativity}
            onChange={(e) => handleDirectiveChange("creativity", parseInt(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Objetivo e Factual</span>
            <span>Criativo e Elaborado</span>
          </div>
        </div>
        
        {/* Tone */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-primary" />
            Tom de Voz
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "formal", label: "Formal", desc: "Linguagem corporativa" },
              { id: "professional", label: "Profissional", desc: "Equilibrado e acessivel" },
              { id: "friendly", label: "Amigavel", desc: "Caloroso e acolhedor" },
              { id: "casual", label: "Casual", desc: "Descontraido e leve" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleDirectiveChange("tone", opt.id as any)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  d.tone === opt.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="font-medium text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Toggles */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Comportamentos
          </h4>
          
          {[
            { id: "useEmojis", label: "Usar Emojis", desc: "Adiciona emojis ocasionalmente" },
            { id: "askFollowUp", label: "Perguntas de Acompanhamento", desc: "Faz perguntas para entender melhor" },
            { id: "transferToHuman", label: "Transferir para Humano", desc: "Oferece transferencia quando necessario" },
          ].map((toggle) => (
            <div
              key={toggle.id}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="font-medium text-foreground">{toggle.label}</p>
                <p className="text-sm text-muted-foreground">{toggle.desc}</p>
              </div>
              <button
                onClick={() => handleDirectiveChange(toggle.id as any, !d[toggle.id as keyof AgentDirectives])}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  d[toggle.id as keyof AgentDirectives] ? "bg-primary" : "bg-secondary"
                }`}
              >
                <div
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    d[toggle.id as keyof AgentDirectives] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
        
        {/* Working Hours */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Horario de Atendimento
              </h4>
              <p className="text-sm text-muted-foreground">Limite quando o agente responde</p>
            </div>
            <button
              onClick={() => handleDirectiveChange("workingHours", { ...d.workingHours, enabled: !d.workingHours.enabled })}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                d.workingHours.enabled ? "bg-primary" : "bg-secondary"
              }`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  d.workingHours.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          
          {d.workingHours.enabled && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Inicio</label>
                  <input
                    type="time"
                    value={d.workingHours.start}
                    onChange={(e) => handleDirectiveChange("workingHours", { ...d.workingHours, start: e.target.value })}
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Fim</label>
                  <input
                    type="time"
                    value={d.workingHours.end}
                    onChange={(e) => handleDirectiveChange("workingHours", { ...d.workingHours, end: e.target.value })}
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Mensagem Fora do Horario</label>
                <textarea
                  rows={2}
                  value={d.offlineMessage}
                  onChange={(e) => handleDirectiveChange("offlineMessage", e.target.value)}
                  placeholder="Ex: Obrigado pelo contato! Retornaremos em breve."
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {view === "list" ? renderAgentList() : renderAgentEditor()}

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Criar Novo Agente</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
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
                  placeholder="Ex: Atendente Virtual"
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
              <div className="flex justify-end gap-3 pt-4">
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
    </div>
  );
}
