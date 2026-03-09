"use client";

import React from "react"

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Plus,
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
  X,
  ChevronRight,
  Zap,
  MessageCircle,
  Send,
  Filter,
  Calendar,
  CheckSquare,
  RefreshCw,
  MoreVertical,
  Search,
  Layers,
  Eye,
  Play,
  Pause,
  ImageIcon,
  Database,
  Globe,
  Webhook,
  Calculator,
  GripVertical,
  Link2,
} from "lucide-react";
import { useCRMStore, type WorkflowNode, type Workflow } from "@/lib/store";

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
  ],
  integrations: [
    { type: "integration" as const, icon: Webhook, label: "Webhook", color: "#06b6d4" },
    { type: "integration" as const, icon: Globe, label: "HTTP Request", color: "#06b6d4" },
  ],
};

export function WorkflowBuilder() {
  const { workflows, addWorkflow, updateWorkflow, deleteWorkflow } = useCRMStore();

  const [view, setView] = useState<"list" | "builder">("list");
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showNodePanel, setShowNodePanel] = useState(true);
  const [workflowName, setWorkflowName] = useState("Novo Fluxo");
  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  // Drag state for nodes in canvas
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Drag state for new nodes from panel
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [draggedTemplate, setDraggedTemplate] = useState<(typeof nodeTemplates.triggers)[0] | null>(null);

  // Connection state (two-click system)
  const [connectingFromNode, setConnectingFromNode] = useState<string | null>(null);
  const [connectionPreview, setConnectionPreview] = useState<{ x: number; y: number } | null>(null);
  const [hoveredConnectionPoint, setHoveredConnectionPoint] = useState<string | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<{sourceId: string, targetId: string} | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize with sample nodes when entering builder
  useEffect(() => {
    if (view === "builder" && nodes.length === 0 && !selectedWorkflow) {
      setNodes([
        {
          id: "1",
          type: "trigger",
          title: "Mensagem Recebida",
          config: { channel: "whatsapp" },
          position: { x: 200, y: 100 },
          connections: ["2"],
        },
        {
          id: "2",
          type: "condition",
          title: "Contém palavra-chave?",
          config: { 
            conditionType: "lead_response",
            responseType: "text",
            expectedResponse: "sim, confirmo",
            keywords: ["preço", "valor", "quanto"] 
          },
          position: { x: 200, y: 280 },
          connections: ["3", "4"],
        },
        {
          id: "3",
          type: "message",
          title: "Enviar Tabela de Preços",
          config: { message: "Aqui está nossa tabela de preços..." },
          position: { x: 50, y: 460 },
          connections: [],
        },
        {
          id: "4",
          type: "ai",
          title: "Resposta IA",
          config: { model: "gpt-4", prompt: "Responda de forma amigável" },
          position: { x: 350, y: 460 },
          connections: [],
        },
      ]);
    }
  }, [view, nodes.length, selectedWorkflow]);

  // Load workflow nodes when selecting
  useEffect(() => {
    if (selectedWorkflow) {
      setNodes(selectedWorkflow.nodes);
      setWorkflowName(selectedWorkflow.name);
    }
  }, [selectedWorkflow]);

  // Track mouse position for connection preview
  useEffect(() => {
    if (connectingFromNode && canvasRef.current) {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        setConnectionPreview({
          x: (e.clientX - rect.left) / zoom,
          y: (e.clientY - rect.top) / zoom,
        });
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    } else {
      setConnectionPreview(null);
    }
  }, [connectingFromNode, zoom]);

  // Handle mouse move for dragging nodes
  const handleMouseMove = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!draggingNode || !canvasRef.current) return;

      e.preventDefault();
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom - dragOffset.x;
      const y = (e.clientY - rect.top) / zoom - dragOffset.y;

      setNodes((prev) =>
        prev.map((node) =>
          node.id === draggingNode ? { ...node, position: { x: Math.max(0, x), y: Math.max(0, y) } } : node
        )
      );
    },
    [draggingNode, dragOffset, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
  }, []);

  // Global mouse events for smooth dragging
  useEffect(() => {
    if (draggingNode) {
      const handleGlobalMove = (e: MouseEvent) => handleMouseMove(e);
      const handleGlobalUp = () => handleMouseUp();
      
      document.addEventListener("mousemove", handleGlobalMove);
      document.addEventListener("mouseup", handleGlobalUp);
      
      return () => {
        document.removeEventListener("mousemove", handleGlobalMove);
        document.removeEventListener("mouseup", handleGlobalUp);
      };
    }
  }, [draggingNode, handleMouseMove, handleMouseUp]);

  // Start dragging an existing node
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string, nodePosition: { x: number; y: number }) => {
    // Don't drag if in connecting mode
    if (connectingFromNode) return;
    
    e.preventDefault();
    e.stopPropagation();
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / zoom;
    const mouseY = (e.clientY - rect.top) / zoom;
    
    setDragOffset({
      x: mouseX - nodePosition.x,
      y: mouseY - nodePosition.y,
    });
    setDraggingNode(nodeId);
  };

  // Handle dropping new node from panel
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggedTemplate || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom - 120;
      const y = (e.clientY - rect.top) / zoom - 40;

      const newNode: WorkflowNode = {
        id: Date.now().toString(),
        type: draggedTemplate.type,
        title: draggedTemplate.label,
        config: {},
        position: { x, y },
        connections: [],
      };

      setNodes((prev) => [...prev, newNode]);
      setIsDraggingNew(false);
      setDraggedTemplate(null);
    },
    [draggedTemplate, zoom]
  );

  const handleDragStart = (template: (typeof nodeTemplates.triggers)[0]) => {
    setIsDraggingNew(true);
    setDraggedTemplate(template);
  };

  // Connection handling (two-click system) - VERSÃO CORRIGIDA COM onMouseDown
  const handleConnectionPointClick = (e: React.MouseEvent, nodeId: string, isOutput: boolean) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('🔗 Connection point clicked:', { nodeId, isOutput, connectingFromNode });
    
    if (!connectingFromNode) {
      // First click - start connection from output point
      if (isOutput) {
        console.log('✅ Starting connection from node:', nodeId);
        setConnectingFromNode(nodeId);
      } else {
        console.log('❌ Cannot start connection from input point');
      }
    } else {
      // Second click - complete connection to input point
      console.log('🎯 Attempting to complete connection...');
      if (!isOutput && connectingFromNode !== nodeId) {
        console.log('✅ Valid connection! Creating...');
        // Create connection immediately
        setNodes(prev => {
          const newNodes = prev.map(node => {
            if (node.id === connectingFromNode) {
              // Check if connection already exists
              if (!node.connections.includes(nodeId)) {
                console.log('✨ Connection created successfully!');
                return { ...node, connections: [...node.connections, nodeId] };
              } else {
                console.log('⚠️ Connection already exists');
              }
            }
            return node;
          });
          return newNodes;
        });
      } else {
        console.log('❌ Invalid connection attempt:', { isOutput, sameNode: connectingFromNode === nodeId });
      }
      // Always reset connection mode
      console.log('🔄 Resetting connection mode');
      setConnectingFromNode(null);
      setConnectionPreview(null);
    }
  };

  // Delete connection
  const handleDeleteConnection = (sourceId: string, targetId: string) => {
    setNodes(prev => prev.map(node =>
      node.id === sourceId
        ? { ...node, connections: node.connections.filter(id => id !== targetId) }
        : node
    ));
    setHoveredConnection(null);
  };

  const getNodeColor = (type: string) => {
    const colors: Record<string, string> = {
      trigger: "#10b981",
      message: "#3b82f6",
      condition: "#f59e0b",
      delay: "#f59e0b",
      action: "#8b5cf6",
      ai: "#ec4899",
      integration: "#06b6d4",
    };
    return colors[type] || "#71717a";
  };

  const getNodeIcon = (type: string) => {
    const icons: Record<string, typeof MessageCircle> = {
      trigger: MessageCircle,
      message: Send,
      condition: Split,
      delay: Clock,
      action: Zap,
      ai: Sparkles,
      integration: Webhook,
    };
    return icons[type] || Zap;
  };

  const handleSaveWorkflow = () => {
    if (selectedWorkflow) {
      updateWorkflow(selectedWorkflow.id, {
        name: workflowName,
        nodes,
        lastModified: new Date().toISOString().split("T")[0],
      });
    } else {
      const newWorkflow: Workflow = {
        id: `workflow-${Date.now()}`,
        name: workflowName,
        description: "Fluxo criado pelo usuário",
        status: "draft",
        nodes,
        createdAt: new Date().toISOString().split("T")[0],
        lastModified: new Date().toISOString().split("T")[0],
        triggers: 0,
      };
      addWorkflow(newWorkflow);
    }
    setView("list");
    setSelectedWorkflow(null);
    setNodes([]);
  };

  const renderWorkflowList = () => (
    <div className="flex-1 overflow-auto bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Automações de Chatbot</h2>
            <p className="text-muted-foreground">Crie fluxos automatizados com workflow visual</p>
          </div>
          <button
            onClick={() => {
              setSelectedWorkflow(null);
              setNodes([]);
              setWorkflowName("Novo Fluxo");
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
                  onClick={(e) => {
                    e.stopPropagation();
                    updateWorkflow(workflow.id, {
                      status: workflow.status === "active" ? "paused" : "active",
                    });
                  }}
                >
                  {workflow.status === "active" ? (
                    <Pause className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Play className="h-4 w-4 text-muted-foreground" />
                  )}
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
              setWorkflowName("Novo Fluxo");
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
    <div className="flex h-full overflow-hidden">
      {/* Node Panel */}
      {showNodePanel && (
        <div className="w-72 flex-shrink-0 overflow-y-auto border-r border-border bg-card">
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Componentes</h3>
              <button onClick={() => setShowNodePanel(false)} className="rounded p-1 hover:bg-secondary">
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
                        setIsDraggingNew(false);
                        setDraggedTemplate(null);
                      }}
                      className="flex cursor-grab items-center gap-3 rounded-lg border border-border bg-secondary p-3 transition-all hover:border-primary/50 active:cursor-grabbing"
                    >
                      <div className="rounded-lg p-2" style={{ backgroundColor: `${template.color}20` }}>
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
      <div
        className="relative flex-1 overflow-hidden bg-background"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Toolbar */}
        <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setView("list");
                setSelectedWorkflow(null);
                setNodes([]);
                setConnectingFromNode(null);
              }}
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
            {connectingFromNode && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 shadow-lg animate-pulse">
                <Link2 className="h-4 w-4" />
                <span>Clique no nó de destino</span>
                <button
                  onClick={() => {
                    setConnectingFromNode(null);
                    setConnectionPreview(null);
                  }}
                  className="ml-2 rounded p-0.5 hover:bg-emerald-500/30"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
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
            <button
              onClick={handleSaveWorkflow}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90"
            >
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
          onClick={() => {
            // Cancel connection mode on canvas click
            if (connectingFromNode) {
              setConnectingFromNode(null);
              setConnectionPreview(null);
            }
          }}
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
            backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
            cursor: draggingNode ? "grabbing" : connectingFromNode ? "crosshair" : "default",
          }}
        >
          {/* SVG for connections */}
          <svg
            className="pointer-events-auto absolute inset-0"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          >
            {/* Existing connections */}
            {nodes.map((node) =>
              node.connections.map((targetId) => {
                const target = nodes.find((n) => n.id === targetId);
                if (!target) return null;
                const startX = node.position.x + 120;
                const startY = node.position.y + 80;
                const endX = target.position.x + 120;
                const endY = target.position.y;
                const midY = (startY + endY) / 2;
                
                const isHovered = hoveredConnection?.sourceId === node.id && hoveredConnection?.targetId === targetId;

                return (
                  <g key={`${node.id}-${targetId}`}>
                    {/* Connection line */}
                    <path
                      d={`M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`}
                      stroke="#10b981"
                      strokeWidth={isHovered ? "3" : "2"}
                      fill="none"
                      className={`transition-all ${isHovered ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                      onMouseEnter={() => setHoveredConnection({sourceId: node.id, targetId})}
                      onMouseLeave={() => setHoveredConnection(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    {/* Delete button on connection */}
                    {isHovered && (
                      <g transform={`translate(${(startX + endX) / 2 - 12}, ${midY - 12})`}>
                        <circle
                          r="12"
                          cx="12"
                          cy="12"
                          fill="#ef4444"
                          className="cursor-pointer hover:fill-[#dc2626]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConnection(node.id, targetId);
                          }}
                        />
                        <path
                          d="M 8 8 L 16 16 M 16 8 L 8 16"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          style={{ pointerEvents: 'none' }}
                        />
                      </g>
                    )}
                  </g>
                );
              })
            )}
            
            {/* Connection preview line */}
            {connectingFromNode && connectionPreview && (() => {
              const sourceNode = nodes.find(n => n.id === connectingFromNode);
              if (!sourceNode) return null;
              const startX = sourceNode.position.x + 120;
              const startY = sourceNode.position.y + 80;
              const endX = connectionPreview.x;
              const endY = connectionPreview.y;
              const midY = (startY + endY) / 2;
              
              return (
                <path
                  d={`M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`}
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                  className="opacity-50"
                  style={{ pointerEvents: 'none' }}
                />
              );
            })()}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const Icon = getNodeIcon(node.type);
            const color = getNodeColor(node.type);

            return (
              <div
                key={node.id}
                className={`absolute cursor-grab rounded-xl border-2 bg-card p-4 shadow-lg transition-shadow active:cursor-grabbing ${
                  selectedNode?.id === node.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 hover:shadow-xl"
                } ${draggingNode === node.id ? "z-50 shadow-2xl" : ""}`}
                style={{
                  left: node.position.x * zoom,
                  top: node.position.y * zoom,
                  width: 240 * zoom,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                }}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id, node.position)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!connectingFromNode) {
                    setSelectedNode(node);
                  }
                }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex-shrink-0 rounded-lg p-2" style={{ backgroundColor: `${color}20` }}>
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{node.title}</p>
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
                  <div className="flex-shrink-0">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Node specific content */}
                {node.type === "condition" && (
                  <div className="rounded-lg bg-secondary p-2 text-xs text-muted-foreground">
                    {node.config.conditionType === "lead_response" && (
                      <div>
                        <span className="font-medium">Aguardar resposta: </span>
                        {node.config.responseType === "button" ? "Botão/Menu" : 
                         node.config.responseType === "image" ? "Imagem" :
                         node.config.responseType === "audio" ? "Áudio" :
                         node.config.responseType === "video" ? "Vídeo" :
                         node.config.responseType === "document" ? "Documento" :
                         node.config.responseType === "location" ? "Localização" : "Texto"}
                        {node.config.expectedResponse && (
                          <div className="mt-1 text-[10px]">
                            Opções: {node.config.expectedResponse as string}
                          </div>
                        )}
                      </div>
                    )}
                    {node.config.conditionType === "client_sends" && (
                      <div>Cliente envia mensagem</div>
                    )}
                    {node.config.conditionType === "client_comment" && (
                      <div>Comentário do cliente</div>
                    )}
                    {node.config.conditionType === "conversation_status" && (
                      <div>Status: {node.config.status as string || "configurar..."}</div>
                    )}
                    {node.config.conditionType === "lead_source" && (
                      <div>Fonte: {node.config.source as string || "configurar..."}</div>
                    )}
                    {(node.config.conditionType === "contains" || !node.config.conditionType) && (
                      <div>
                        Se contém: {node.config.keywords ? (node.config.keywords as string) : "configurar..."}
                      </div>
                    )}
                    {node.config.conditionType === "tag" && (
                      <div>Tag: {node.config.tagValue ? (node.config.tagValue as string) : "configurar..."}</div>
                    )}
                  </div>
                )}
                {node.type === "message" && (
                  <div className="line-clamp-2 rounded-lg bg-secondary p-2 text-xs text-muted-foreground">
                    {(node.config.message as string) || "Clique para configurar..."}
                  </div>
                )}
                {node.type === "ai" && (
                  <div className="flex items-center gap-2 rounded-lg bg-secondary p-2">
                    <Sparkles className="h-4 w-4 text-pink-400" />
                    <span className="text-xs text-muted-foreground">
                      {(node.config.model as string) || "GPT-4 Turbo"}
                    </span>
                  </div>
                )}

                {/* Connection points */}
                {node.type !== "trigger" && (
                  <div 
                    className={`absolute -top-2 left-1/2 h-6 w-6 -translate-x-1/2 cursor-pointer rounded-full border-3 transition-all z-[100] ${
                      hoveredConnectionPoint === `${node.id}-input` || connectingFromNode
                        ? "border-emerald-500 bg-emerald-500 scale-125 shadow-lg shadow-emerald-500/50"
                        : "border-emerald-500 bg-white hover:scale-125 hover:shadow-lg hover:bg-emerald-100"
                    }`}
                    onMouseEnter={() => setHoveredConnectionPoint(`${node.id}-input`)}
                    onMouseLeave={() => setHoveredConnectionPoint(null)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleConnectionPointClick(e, node.id, false);
                    }}
                    title="🎯 Clique aqui para RECEBER conexão"
                  />
                )}
                <div 
                  className={`absolute -bottom-2 left-1/2 h-6 w-6 -translate-x-1/2 cursor-pointer rounded-full border-3 transition-all z-[100] ${
                    hoveredConnectionPoint === `${node.id}-output` || connectingFromNode === node.id
                      ? "border-emerald-500 bg-emerald-500 scale-125 shadow-lg shadow-emerald-500/50"
                      : "border-emerald-500 bg-white hover:scale-125 hover:shadow-lg hover:bg-emerald-100"
                  }`}
                  onMouseEnter={() => setHoveredConnectionPoint(`${node.id}-output`)}
                  onMouseLeave={() => setHoveredConnectionPoint(null)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleConnectionPointClick(e, node.id, true);
                  }}
                  title="🚀 Clique aqui para INICIAR conexão"
                />
              </div>
            );
          })}

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <Layers className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Arraste componentes aqui</h3>
                <p className="text-muted-foreground">Comece arrastando um gatilho do painel lateral</p>
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
              <button onClick={() => setSelectedNode(null)} className="rounded p-1 hover:bg-secondary">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Nome</label>
                <input
                  type="text"
                  value={selectedNode.title}
                  onChange={(e) => {
                    setNodes((prev) =>
                      prev.map((n) => (n.id === selectedNode.id ? { ...n, title: e.target.value } : n))
                    );
                    setSelectedNode({ ...selectedNode, title: e.target.value });
                  }}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {selectedNode.type === "message" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Mensagem</label>
                  <textarea
                    rows={4}
                    value={(selectedNode.config.message as string) || ""}
                    onChange={(e) => {
                      const newConfig = { ...selectedNode.config, message: e.target.value };
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, config: newConfig }
                            : n
                        )
                      );
                      setSelectedNode({ ...selectedNode, config: newConfig });
                    }}
                    placeholder="Digite a mensagem..."
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Use {"{nome}"} para variáveis</p>
                </div>
              )}

              {selectedNode.type === "condition" && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Tipo de Condição</label>
                    <select 
                      value={(selectedNode.config.conditionType as string) || "contains"}
                      onChange={(e) => {
                        const newConfig = { ...selectedNode.config, conditionType: e.target.value };
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.id === selectedNode.id ? { ...n, config: newConfig } : n
                          )
                        );
                        setSelectedNode({ ...selectedNode, config: newConfig });
                      }}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="contains">Contém palavra-chave</option>
                      <option value="lead_response">Se o lead responder</option>
                      <option value="client_sends">Cliente enviar</option>
                      <option value="client_comment">Comentário do cliente</option>
                      <option value="conversation_status">Status da conversa</option>
                      <option value="lead_source">Fonte de leads</option>
                      <option value="tag">Tag igual a</option>
                      <option value="field">Valor do campo</option>
                      <option value="time">Horário</option>
                    </select>
                  </div>

                  {(selectedNode.config.conditionType === "contains" || !selectedNode.config.conditionType) && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Palavras-chave</label>
                      <input
                        type="text"
                        value={(selectedNode.config.keywords as string) || ""}
                        onChange={(e) => {
                          const newConfig = { ...selectedNode.config, keywords: e.target.value };
                          setNodes((prev) =>
                            prev.map((n) =>
                              n.id === selectedNode.id ? { ...n, config: newConfig } : n
                            )
                          );
                          setSelectedNode({ ...selectedNode, config: newConfig });
                        }}
                        placeholder="preço, valor, quanto"
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">Separe por vírgulas</p>
                    </div>
                  )}

                  {selectedNode.config.conditionType === "lead_response" && (
                    <>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Como o lead deve responder</label>
                        <select 
                          value={(selectedNode.config.responseType as string) || "text"}
                          onChange={(e) => {
                            const newConfig = { ...selectedNode.config, responseType: e.target.value };
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === selectedNode.id ? { ...n, config: newConfig } : n
                              )
                            );
                            setSelectedNode({ ...selectedNode, config: newConfig });
                          }}
                          className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                          <option value="text">Texto</option>
                          <option value="button">Botão/Menu</option>
                          <option value="image">Imagem</option>
                          <option value="audio">Áudio</option>
                          <option value="video">Vídeo</option>
                          <option value="document">Documento</option>
                          <option value="location">Localização</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                          {selectedNode.config.responseType === "button" ? "Opções esperadas" : "Palavras-chave na resposta"}
                        </label>
                        <input
                          type="text"
                          value={(selectedNode.config.expectedResponse as string) || ""}
                          onChange={(e) => {
                            const newConfig = { ...selectedNode.config, expectedResponse: e.target.value };
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === selectedNode.id ? { ...n, config: newConfig } : n
                              )
                            );
                            setSelectedNode({ ...selectedNode, config: newConfig });
                          }}
                          placeholder={selectedNode.config.responseType === "button" ? "Sim, Não, Talvez" : "sim, confirmo, aceito"}
                          className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {selectedNode.config.responseType === "button" 
                            ? "Opções que o lead pode escolher" 
                            : "Palavras que indicam confirmação"}
                        </p>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Tempo de espera</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={(selectedNode.config.timeout as number) || 60}
                            onChange={(e) => {
                              const newConfig = { ...selectedNode.config, timeout: parseInt(e.target.value) };
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === selectedNode.id ? { ...n, config: newConfig } : n
                                )
                              );
                              setSelectedNode({ ...selectedNode, config: newConfig });
                            }}
                            className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                          />
                          <select 
                            value={(selectedNode.config.timeoutUnit as string) || "minutes"}
                            onChange={(e) => {
                              const newConfig = { ...selectedNode.config, timeoutUnit: e.target.value };
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === selectedNode.id ? { ...n, config: newConfig } : n
                                )
                              );
                              setSelectedNode({ ...selectedNode, config: newConfig });
                            }}
                            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                          >
                            <option value="seconds">Segundos</option>
                            <option value="minutes">Minutos</option>
                            <option value="hours">Horas</option>
                            <option value="days">Dias</option>
                          </select>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Tempo máximo para aguardar resposta</p>
                      </div>
                    </>
                  )}

                  {selectedNode.config.conditionType === "conversation_status" && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Status</label>
                      <select
                        value={(selectedNode.config.status as string) || ""}
                        onChange={(e) => {
                          const newConfig = { ...selectedNode.config, status: e.target.value };
                          setNodes((prev) =>
                            prev.map((n) =>
                              n.id === selectedNode.id ? { ...n, config: newConfig } : n
                            )
                          );
                          setSelectedNode({ ...selectedNode, config: newConfig });
                        }}
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="">Selecione...</option>
                        <option value="open">Aberta</option>
                        <option value="pending">Pendente</option>
                        <option value="responded">Respondida</option>
                        <option value="closed">Fechada</option>
                      </select>
                    </div>
                  )}

                  {selectedNode.config.conditionType === "lead_source" && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Fonte</label>
                      <input
                        type="text"
                        value={(selectedNode.config.source as string) || ""}
                        onChange={(e) => {
                          const newConfig = { ...selectedNode.config, source: e.target.value };
                          setNodes((prev) =>
                            prev.map((n) =>
                              n.id === selectedNode.id ? { ...n, config: newConfig } : n
                            )
                          );
                          setSelectedNode({ ...selectedNode, config: newConfig });
                        }}
                        placeholder="WhatsApp, Instagram, Facebook, Site..."
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}

                  {selectedNode.config.conditionType === "tag" && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Tag</label>
                      <input
                        type="text"
                        value={(selectedNode.config.tagValue as string) || ""}
                        onChange={(e) => {
                          const newConfig = { ...selectedNode.config, tagValue: e.target.value };
                          setNodes((prev) =>
                            prev.map((n) =>
                              n.id === selectedNode.id ? { ...n, config: newConfig } : n
                            )
                          );
                          setSelectedNode({ ...selectedNode, config: newConfig });
                        }}
                        placeholder="VIP, Qualificado, etc"
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="rounded-lg bg-blue-500/10 p-3 border border-blue-500/20">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">💡 Dica de Uso</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Conecte diferentes nós de saída para cada resultado da condição (Sim/Não, múltiplas opções, etc.)
                    </p>
                  </div>
                </>
              )}

              {selectedNode.type === "ai" && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Modelo</label>
                    <select className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                      <option>GPT-4 Turbo</option>
                      <option>GPT-4</option>
                      <option>GPT-3.5 Turbo</option>
                      <option>Claude 3 Opus</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Instruções</label>
                    <textarea
                      rows={4}
                      placeholder="Você é um assistente de vendas amigável..."
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === "delay" && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-foreground">Aguardar</label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-foreground">Unidade</label>
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
                    setNodes((prev) => {
                      // Remove the node and all connections to it
                      const filteredNodes = prev.filter((n) => n.id !== selectedNode.id);
                      return filteredNodes.map(n => ({
                        ...n,
                        connections: n.connections.filter(id => id !== selectedNode.id)
                      }));
                    });
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
