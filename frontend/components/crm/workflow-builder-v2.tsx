"use client";

import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
  Panel,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
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
  X,
  ChevronRight,
  Zap,
  MessageCircle,
  Send,
  Filter,
  Calendar,
  CheckSquare,
  RefreshCw,
  Search,
  Layers,
  Eye,
  Play,
  Pause,
  Settings,
  Power,
  Phone,
  AtSign,
  Hash,
  ArrowRight,
  GitBranch,
  Timer,
  AlertCircle,
} from "lucide-react";
import { useCRMStore, type Workflow } from "@/lib/store";

// Custom Node Component with connection handles
const CustomNode = ({ data, id }: any) => {
  const Icon = data.icon || Zap;
  const color = data.color || "#10b981";

  return (
    <div className="relative px-4 py-3 shadow-lg rounded-lg border-2 border-border bg-card min-w-[200px] hover:border-primary/50 transition-colors">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
        style={{ top: -6 }}
      />
      
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 rounded-lg p-2" style={{ backgroundColor: `${color}20` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">{data.label}</div>
          <div className="text-xs text-muted-foreground">{data.type}</div>
        </div>
      </div>
      {data.description && (
        <div className="mt-2 text-xs text-muted-foreground bg-secondary rounded p-2">
          {data.description}
        </div>
      )}
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
        style={{ bottom: -6 }}
      />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// Templates de nós - SEM IA (IA é funcionalidade separada)
const nodeTemplates = {
  triggers: [
    { type: "trigger", icon: MessageCircle, label: "Mensagem Recebida", color: "#10b981" },
    { type: "trigger", icon: UserCheck, label: "Novo Lead", color: "#10b981" },
    { type: "trigger", icon: Tag, label: "Tag Adicionada", color: "#10b981" },
    { type: "trigger", icon: Calendar, label: "Agendamento", color: "#10b981" },
    { type: "trigger", icon: Phone, label: "Chamada Recebida", color: "#10b981" },
    { type: "trigger", icon: AtSign, label: "Mencao Recebida", color: "#10b981" },
  ],
  actions: [
    { type: "action", icon: Send, label: "Enviar Mensagem", color: "#3b82f6" },
    { type: "action", icon: Tag, label: "Adicionar Tag", color: "#3b82f6" },
    { type: "action", icon: UserCheck, label: "Atribuir Responsavel", color: "#3b82f6" },
    { type: "action", icon: Mail, label: "Enviar Email", color: "#3b82f6" },
    { type: "action", icon: Hash, label: "Atualizar Campo", color: "#3b82f6" },
    { type: "action", icon: ArrowRight, label: "Mover no Funil", color: "#3b82f6" },
  ],
  logic: [
    { type: "condition", icon: Split, label: "Condicao Se/Senao", color: "#f59e0b" },
    { type: "delay", icon: Clock, label: "Aguardar Tempo", color: "#f59e0b" },
    { type: "filter", icon: Filter, label: "Filtrar Contatos", color: "#f59e0b" },
    { type: "branch", icon: GitBranch, label: "Ramificar Fluxo", color: "#f59e0b" },
    { type: "timer", icon: Timer, label: "Agendar Acao", color: "#f59e0b" },
    { type: "stop", icon: AlertCircle, label: "Finalizar Fluxo", color: "#ef4444" },
  ],
};

export function WorkflowBuilderV2() {
  const { workflows, addWorkflow, updateWorkflow } = useCRMStore();

  const [view, setView] = useState<"list" | "builder">("list");
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflowName, setWorkflowName] = useState("Novo Fluxo");
  const [showNodePanel, setShowNodePanel] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isActive, setIsActive] = useState(false);

  // React Flow State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Initialize with sample nodes
  useEffect(() => {
    if (view === "builder" && nodes.length === 0 && !selectedWorkflow) {
      const initialNodes: Node[] = [
        {
          id: "1",
          type: "custom",
          position: { x: 250, y: 50 },
          data: {
            label: "Mensagem Recebida",
            type: "Gatilho",
            icon: MessageCircle,
            color: "#10b981",
            description: "WhatsApp",
          },
        },
        {
          id: "2",
          type: "custom",
          position: { x: 250, y: 180 },
          data: {
            label: "Condicao Se/Senao",
            type: "Logica",
            icon: Split,
            color: "#f59e0b",
            description: "Se contem 'preco'",
          },
        },
        {
          id: "3",
          type: "custom",
          position: { x: 80, y: 320 },
          data: {
            label: "Enviar Mensagem",
            type: "Acao",
            icon: Send,
            color: "#3b82f6",
            description: "Tabela de precos",
          },
        },
        {
          id: "4",
          type: "custom",
          position: { x: 420, y: 320 },
          data: {
            label: "Adicionar Tag",
            type: "Acao",
            icon: Tag,
            color: "#3b82f6",
            description: "interessado",
          },
        },
      ];

      const initialEdges: Edge[] = [
        {
          id: "e1-2",
          source: "1",
          target: "2",
          type: "smoothstep",
          animated: true,
          style: { stroke: "#10b981", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
        },
        {
          id: "e2-3",
          source: "2",
          target: "3",
          type: "smoothstep",
          animated: true,
          style: { stroke: "#10b981", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
          label: "Sim",
        },
        {
          id: "e2-4",
          source: "2",
          target: "4",
          type: "smoothstep",
          animated: true,
          style: { stroke: "#10b981", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
          label: "Nao",
        },
      ];

      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [view, nodes.length, selectedWorkflow, setNodes, setEdges]);

  // Handle connection between nodes
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const newEdge = {
        ...params,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#10b981", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Handle node click
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Handle pane click (deselect node)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Add new node from template
  const addNodeFromTemplate = useCallback(
    (template: any) => {
      const nodeId = `node-${Date.now()}`;
      const typeMap: Record<string, string> = {
        trigger: "Gatilho",
        action: "Acao",
        condition: "Logica",
        delay: "Logica",
        filter: "Logica",
        branch: "Logica",
        timer: "Logica",
        stop: "Logica",
      };
      
      const newNode: Node = {
        id: nodeId,
        type: "custom",
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100,
        },
        data: {
          label: template.label,
          type: typeMap[template.type] || "Acao",
          nodeType: template.type,
          icon: template.icon,
          color: template.color,
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  // Delete selected node
  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  // Save workflow
  const handleSaveWorkflow = useCallback(() => {
    const workflowData = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.type,
        title: n.data.label,
        config: {},
        position: n.position,
        connections: edges.filter((e) => e.source === n.id).map((e) => e.target),
      })),
    };

    if (selectedWorkflow) {
      updateWorkflow(selectedWorkflow.id, {
        name: workflowName,
        nodes: workflowData.nodes,
        lastModified: new Date().toISOString().split("T")[0],
      });
    } else {
      const newWorkflow: Workflow = {
        id: `workflow-${Date.now()}`,
        name: workflowName,
        description: "Fluxo criado pelo usuário",
        status: "draft",
        nodes: workflowData.nodes,
        createdAt: new Date().toISOString().split("T")[0],
        lastModified: new Date().toISOString().split("T")[0],
        triggers: 0,
      };
      addWorkflow(newWorkflow);
    }

    setView("list");
    setSelectedWorkflow(null);
    setNodes([]);
    setEdges([]);
  }, [nodes, edges, workflowName, selectedWorkflow, updateWorkflow, addWorkflow, setNodes, setEdges]);

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
              setEdges([]);
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
              setEdges([]);
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
                      ? "Acoes"
                      : "Logica"}
                </h4>
                <div className="space-y-2">
                  {templates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => addNodeFromTemplate(template)}
                      className="flex w-full items-center gap-3 rounded-lg border border-border bg-secondary p-3 transition-all hover:border-primary/50 hover:bg-secondary/80"
                    >
                      <div className="rounded-lg p-2" style={{ backgroundColor: `${template.color}20` }}>
                        <template.icon className="h-4 w-4" style={{ color: template.color }} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{template.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="relative flex-1 bg-background">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: true,
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#27272a" />
          <Controls className="bg-card border-border" />
          <MiniMap
            className="bg-card border-border"
            nodeColor={(node) => {
              return node.data.color || "#10b981";
            }}
          />

          {/* Top Toolbar */}
          <Panel position="top-left" className="flex items-center gap-2">
            <button
              onClick={() => {
                setView("list");
                setSelectedWorkflow(null);
                setNodes([]);
                setEdges([]);
              }}
              className="flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-2 text-sm font-medium text-foreground shadow-lg hover:bg-secondary"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Voltar
            </button>
            {!showNodePanel && (
              <button
                onClick={() => setShowNodePanel(true)}
                className="flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-2 text-sm font-medium text-foreground shadow-lg hover:bg-secondary"
              >
                <Layers className="h-4 w-4" />
                Componentes
              </button>
            )}
          </Panel>

          <Panel position="top-center" className="flex items-center gap-2">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-lg focus:border-primary focus:outline-none"
            />
          </Panel>

          <Panel position="top-right" className="flex items-center gap-2">
            {/* Botao Ligar/Desligar */}
            <button
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium shadow-lg transition-colors ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                  : "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
              }`}
            >
              <Power className="h-4 w-4" />
              {isActive ? "Ativo" : "Inativo"}
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-2 text-sm font-medium text-foreground shadow-lg hover:bg-secondary">
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
          </Panel>

          {/* Info Panel */}
          <Panel position="bottom-left" className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>✨ <strong>Arraste</strong> os nós para mover</div>
              <div>🔗 <strong>Clique e arraste</strong> dos pontos para conectar</div>
              <div>🗑️ <strong>Selecione + Delete</strong> para remover</div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Node Config Panel */}
      {selectedNode && (
        <div className="w-80 flex-shrink-0 overflow-y-auto border-l border-border bg-card">
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Configuracao</h3>
              <button onClick={() => setSelectedNode(null)} className="rounded p-1 hover:bg-secondary">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Nome</label>
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(e) => {
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, label: e.target.value } }
                          : n
                      )
                    );
                  }}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Descricao</label>
                <textarea
                  rows={3}
                  value={selectedNode.data.description || ""}
                  onChange={(e) => {
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, description: e.target.value } }
                          : n
                      )
                    );
                  }}
                  placeholder="Digite uma descricao..."
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="rounded-lg bg-blue-500/10 p-3 border border-blue-500/20">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Conexoes</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Clique e arraste dos pontos do no para criar conexoes
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <button
                  onClick={deleteSelectedNode}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir No
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
