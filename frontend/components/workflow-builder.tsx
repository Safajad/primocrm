"use client";

import React from "react"

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Plus,
  Play,
  Pause,
  Save,
  Trash2,
  MessageSquare,
  Clock,
  Split,
  UserCheck,
  Tag,
  Mail,
  Bot,
  Sparkles,
  MousePointer2,
  GripVertical,
  X,
  ChevronRight,
  Settings,
  Zap,
  ArrowRight,
  MessageCircle,
  Phone,
  FileText,
  ImageIcon,
  Video,
  Link2,
  Database,
  Globe,
  Webhook,
  Send,
  RefreshCw,
  Filter,
  Calculator,
  Calendar,
  CheckSquare,
  AlertCircle,
  Copy,
  Eye,
  MoreVertical,
  ChevronDown,
  Search,
  Layers,
} from "lucide-react";

type NodeType =
  | "trigger"
  | "message"
  | "condition"
  | "delay"
  | "action"
  | "ai"
  | "integration";

interface WorkflowNode {
  id: string;
  type: NodeType;
  title: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
  connections: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft" | "paused";
  nodes: WorkflowNode[];
  createdAt: string;
  lastModified: string;
  triggers: number;
}

const nodeTemplates = {
  triggers: [
    { type: "trigger" as const, icon: MessageCircle, label: "Mensagem Recebida", color: "#10b981" },
    { type: "trigger" as const, icon: UserCheck, label: "Novo Lead", color: "#10b981" },
    { type: "trigger" as const, icon: Tag, label: "Tag Adicionada", color: "#10b981" },
    { type: "trigger" as const, icon: Calendar, label: "Agendamento", color: "#10b981" },
  ],
  actions: [
    { type: "message" as const, icon: Send, label: "Enviar Mensagem", color: "#3b82f6" },
    { type: "message" as const, icon: ImageIcon, label: "Enviar Mídia", color: "#3b82f6" },
    { type: "action" as const, icon: Tag, label: "Adicionar Tag", color: "#8b5cf6" },
    { type: "action" as const, icon: UserCheck, label: "Atribuir Responsável", color: "#8b5cf6" },
    { type: "action" as const, icon: Database, label: "Atualizar Lead", color: "#8b5cf6" },
    { type: "action" as const, icon: Mail, label: "Enviar Email", color: "#8b5cf6" },
  ],
  logic: [
    { type: "condition" as const, icon: Split, label: "Condição", color: "#f59e0b" },
    { type: "delay" as const, icon: Clock, label: "Aguardar", color: "#f59e0b" },
    { type: "condition" as const, icon: Filter, label: "Filtro", color: "#f59e0b" },
    { type: "action" as const, icon: Calculator, label: "Cálculo", color: "#f59e0b" },
  ],
  ai: [
    { type: "ai" as const, icon: Sparkles, label: "Resposta IA", color: "#ec4899" },
    { type: "ai" as const, icon: Bot, label: "Classificar Intenção", color: "#ec4899" },
    { type: "ai" as const, icon: FileText, label: "Extrair Dados", color: "#ec4899" },
  ],
  integrations: [
    { type: "integration" as const, icon: Webhook, label: "Webhook", color: "#06b6d4" },
    { type: "integration" as const, icon: Globe, label: "HTTP Request", color: "#06b6d4" },
    { type: "integration" as const, icon: Database, label: "Banco de Dados", color: "#06b6d4" },
  ],
};

const sampleWorkflows: Workflow[] = [
  {
    id: "1",
    name: "Boas-vindas Automático",
    description: "Envia mensagem de boas-vindas para novos leads",
    status: "active",
    nodes: [],
    createdAt: "2026-01-15",
    lastModified: "2026-01-25",
    triggers: 1250,
  },
  {
    id: "2",
    name: "Qualificação de Lead",
    description: "Fluxo de qualificação com perguntas automáticas",
    status: "active",
    nodes: [],
    createdAt: "2026-01-10",
    lastModified: "2026-01-24",
    triggers: 890,
  },
  {
    id: "3",
    name: "Follow-up Pós-Venda",
    description: "Sequência de mensagens após fechamento",
    status: "paused",
    nodes: [],
    createdAt: "2026-01-05",
    lastModified: "2026-01-20",
    triggers: 456,
  },
  {
    id: "4",
    name: "Atendimento com IA",
    description: "Resposta automática usando inteligência artificial",
    status: "draft",
    nodes: [],
    createdAt: "2026-01-22",
    lastModified: "2026-01-22",
    triggers: 0,
  },
];

export function WorkflowBuilder() {
  const [view, setView] = useState<"list" | "builder">("list");
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflows, setWorkflows] = useState(sampleWorkflows);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNodeType, setDraggedNodeType] = useState<typeof nodeTemplates.triggers[0] | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showNodePanel, setShowNodePanel] = useState(true);

  // Initialize with sample nodes when entering builder
  useEffect(() => {
    if (view === "builder" && nodes.length === 0) {
      setNodes([
        {
          id: "1",
          type: "trigger",
          title: "Mensagem Recebida",
          config: { channel: "whatsapp" },
          position: { x: 100, y: 100 },
          connections: ["2"],
        },
        {
          id: "2",
          type: "condition",
          title: "Contém palavra-chave?",
          config: { keywords: ["preço", "valor", "quanto"] },
          position: { x: 100, y: 250 },
          connections: ["3", "4"],
        },
        {
          id: "3",
          type: "message",
          title: "Enviar Tabela de Preços",
          config: { message: "Aqui está nossa tabela de preços..." },
          position: { x: -50, y: 400 },
          connections: [],
        },
        {
          id: "4",
          type: "ai",
          title: "Resposta IA",
          config: { model: "gpt-4", prompt: "Responda de forma amigável" },
          position: { x: 250, y: 400 },
          connections: [],
        },
      ]);
    }
  }, [view, nodes.length]);

  const handleDragStart = (template: typeof nodeTemplates.triggers[0]) => {
    setIsDragging(true);
    setDraggedNodeType(template);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggedNodeType || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - canvasOffset.x) / zoom;
      const y = (e.clientY - rect.top - canvasOffset.y) / zoom;

      const newNode: WorkflowNode = {
        id: Date.now().toString(),
        type: draggedNodeType.type,
        title: draggedNodeType.label,
        config: {},
        position: { x, y },
        connections: [],
      };

      setNodes((prev) => [...prev, newNode]);
      setIsDragging(false);
      setDraggedNodeType(null);
    },
    [draggedNodeType, canvasOffset, zoom]
  );

  const getNodeColor = (type: NodeType) => {
    const colors = {
      trigger: "#10b981",
      message: "#3b82f6",
      condition: "#f59e0b",
      delay: "#f59e0b",
      action: "#8b5cf6",
      ai: "#ec4899",
      integration: "#06b6d4",
    };
    return colors[type];
  };

  const getNodeIcon = (type: NodeType) => {
    const icons = {
      trigger: MessageCircle,
      message: Send,
      condition: Split,
      delay: Clock,
      action: Zap,
      ai: Sparkles,
      integration: Webhook,
    };
    return icons[type];
  };

  const renderWorkflowList = () => (
    <div className="flex-1 overflow-auto bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Automações de Chatbot</h2>
            <p className="text-muted-foreground">
              Crie fluxos automatizados com workflow visual
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedWorkflow(null);
              setNodes([]);
              setView("builder");
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Fluxo</span>
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-primary/20 p-2">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Fluxos Ativos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {workflows.filter((w) => w.status === "active").length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <RefreshCw className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-sm text-muted-foreground">Execuções Hoje</span>
            </div>
            <p className="text-2xl font-bold text-foreground">2,456</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-amber-500/20 p-2">
                <MessageSquare className="h-5 w-5 text-amber-400" />
              </div>
              <span className="text-sm text-muted-foreground">Mensagens Enviadas</span>
            </div>
            <p className="text-2xl font-bold text-foreground">12.8k</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/20 p-2">
                <CheckSquare className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-sm text-muted-foreground">Taxa de Sucesso</span>
            </div>
            <p className="text-2xl font-bold text-foreground">98.5%</p>
          </div>
        </div>

        {/* Workflow Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg"
              onClick={() => {
                setSelectedWorkflow(workflow);
                setView("builder");
              }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      workflow.status === "active"
                        ? "bg-emerald-500/20"
                        : workflow.status === "paused"
                          ? "bg-amber-500/20"
                          : "bg-zinc-500/20"
                    }`}
                  >
                    <Zap
                      className={`h-5 w-5 ${
                        workflow.status === "active"
                          ? "text-emerald-400"
                          : workflow.status === "paused"
                            ? "text-amber-400"
                            : "text-zinc-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{workflow.name}</h3>
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  </div>
                </div>
                <button
                  className="rounded p-1 opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4" />
                    {workflow.triggers.toLocaleString()}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      workflow.status === "active"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : workflow.status === "paused"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-zinc-500/20 text-zinc-400"
                    }`}
                  >
                    {workflow.status === "active"
                      ? "Ativo"
                      : workflow.status === "paused"
                        ? "Pausado"
                        : "Rascunho"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{workflow.lastModified}</span>
              </div>
            </div>
          ))}

          {/* Add New Card */}
          <button
            onClick={() => {
              setSelectedWorkflow(null);
              setNodes([]);
              setView("builder");
            }}
            className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 p-5 text-muted-foreground transition-all hover:border-primary hover:text-primary"
          >
            <div className="rounded-full border-2 border-current p-3">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-medium">Criar Novo Fluxo</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderBuilder = () => (
    <div className="flex flex-1 overflow-hidden">
      {/* Node Panel */}
      {showNodePanel && (
        <div className="w-72 flex-shrink-0 overflow-y-auto border-r border-border bg-card">
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Componentes</h3>
              <button
                onClick={() => setShowNodePanel(false)}
                className="rounded p-1 hover:bg-secondary"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar componentes..."
                className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {Object.entries(nodeTemplates).map(([category, templates]) => (
              <div key={category} className="mb-4">
                <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  {category === "triggers"
                    ? "Gatilhos"
                    : category === "actions"
                      ? "Ações"
                      : category === "logic"
                        ? "Lógica"
                        : category === "ai"
                          ? "Inteligência Artificial"
                          : "Integrações"}
                </h4>
                <div className="space-y-2">
                  {templates.map((template, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(template)}
                      onDragEnd={() => {
                        setIsDragging(false);
                        setDraggedNodeType(null);
                      }}
                      className="flex cursor-grab items-center gap-3 rounded-lg border border-border bg-secondary p-3 transition-all hover:border-primary/50 active:cursor-grabbing"
                    >
                      <div
                        className="rounded-lg p-2"
                        style={{ backgroundColor: `${template.color}20` }}
                      >
                        <template.icon className="h-4 w-4" style={{ color: template.color }} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{template.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden bg-background">
        {/* Toolbar */}
        <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm font-medium text-foreground shadow-lg hover:bg-secondary"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Voltar
            </button>
            {!showNodePanel && (
              <button
                onClick={() => setShowNodePanel(true)}
                className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm font-medium text-foreground shadow-lg hover:bg-secondary"
              >
                <Layers className="h-4 w-4" />
                Componentes
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              defaultValue={selectedWorkflow?.name || "Novo Fluxo"}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-lg focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg bg-card p-1 shadow-lg">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                className="rounded px-2 py-1 text-sm text-muted-foreground hover:bg-secondary"
              >
                -
              </button>
              <span className="px-2 text-sm text-foreground">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                className="rounded px-2 py-1 text-sm text-muted-foreground hover:bg-secondary"
              >
                +
              </button>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm font-medium text-foreground shadow-lg hover:bg-secondary">
              <Eye className="h-4 w-4" />
              Testar
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90">
              <Save className="h-4 w-4" />
              Salvar
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          ref={canvasRef}
          className="h-full w-full"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
            backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
          }}
        >
          {/* SVG for connections */}
          <svg className="absolute inset-0 pointer-events-none" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
            {nodes.map((node) =>
              node.connections.map((targetId) => {
                const target = nodes.find((n) => n.id === targetId);
                if (!target) return null;
                const startX = node.position.x + 120;
                const startY = node.position.y + 40;
                const endX = target.position.x + 120;
                const endY = target.position.y;
                const midY = (startY + endY) / 2;

                return (
                  <path
                    key={`${node.id}-${targetId}`}
                    d={`M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    className="opacity-60"
                  />
                );
              })
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const Icon = getNodeIcon(node.type);
            const color = getNodeColor(node.type);

            return (
              <div
                key={node.id}
                className={`absolute cursor-pointer rounded-xl border-2 bg-card p-4 shadow-lg transition-all ${
                  selectedNode?.id === node.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
                style={{
                  left: node.position.x * zoom + canvasOffset.x,
                  top: node.position.y * zoom + canvasOffset.y,
                  width: 240 * zoom,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                }}
                onClick={() => setSelectedNode(node)}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg p-2" style={{ backgroundColor: `${color}20` }}>
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">{node.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {node.type === "trigger"
                        ? "Gatilho"
                        : node.type === "message"
                          ? "Mensagem"
                          : node.type === "condition"
                            ? "Condição"
                            : node.type === "delay"
                              ? "Aguardar"
                              : node.type === "ai"
                                ? "IA"
                                : "Ação"}
                    </p>
                  </div>
                  <button className="rounded p-1 hover:bg-secondary">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Node specific content */}
                {node.type === "condition" && (
                  <div className="rounded-lg bg-secondary p-2 text-xs text-muted-foreground">
                    Se contém: preço, valor, quanto
                  </div>
                )}
                {node.type === "message" && (
                  <div className="rounded-lg bg-secondary p-2 text-xs text-muted-foreground line-clamp-2">
                    {(node.config.message as string) || "Clique para configurar..."}
                  </div>
                )}
                {node.type === "ai" && (
                  <div className="flex items-center gap-2 rounded-lg bg-secondary p-2">
                    <Sparkles className="h-4 w-4 text-pink-400" />
                    <span className="text-xs text-muted-foreground">GPT-4 Turbo</span>
                  </div>
                )}

                {/* Connection points */}
                {node.type !== "trigger" && (
                  <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-primary bg-card" />
                )}
                <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-primary bg-card" />
              </div>
            );
          })}

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <MousePointer2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Arraste componentes aqui
                </h3>
                <p className="text-muted-foreground">
                  Comece arrastando um gatilho do painel lateral
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Node Config Panel */}
      {selectedNode && (
        <div className="w-80 flex-shrink-0 overflow-y-auto border-l border-border bg-card">
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Configuração</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="rounded p-1 hover:bg-secondary"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Nome</label>
                <input
                  type="text"
                  value={selectedNode.title}
                  onChange={(e) =>
                    setNodes((prev) =>
                      prev.map((n) =>
                        n.id === selectedNode.id ? { ...n, title: e.target.value } : n
                      )
                    )
                  }
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {selectedNode.type === "message" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Mensagem
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Digite a mensagem..."
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use {"{nome}"} para variáveis
                  </p>
                </div>
              )}

              {selectedNode.type === "condition" && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Tipo de Condição
                    </label>
                    <select className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                      <option>Contém palavra-chave</option>
                      <option>Tag igual a</option>
                      <option>Valor do campo</option>
                      <option>Horário</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Palavras-chave
                    </label>
                    <input
                      type="text"
                      placeholder="preço, valor, quanto"
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === "ai" && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Modelo
                    </label>
                    <select className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                      <option>GPT-4 Turbo</option>
                      <option>GPT-4</option>
                      <option>GPT-3.5 Turbo</option>
                      <option>Claude 3 Opus</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Instruções
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Você é um assistente de vendas amigável..."
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
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
                      <span>Preciso</span>
                      <span>Criativo</span>
                    </div>
                  </div>
                </>
              )}

              {selectedNode.type === "delay" && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Aguardar
                    </label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Unidade
                    </label>
                    <select className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                      <option>Minutos</option>
                      <option>Horas</option>
                      <option>Dias</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <button
                  onClick={() => {
                    setNodes((prev) => prev.filter((n) => n.id !== selectedNode.id));
                    setSelectedNode(null);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir Componente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return view === "list" ? renderWorkflowList() : renderBuilder();
}
