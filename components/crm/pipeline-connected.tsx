"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  DollarSign,
  MoreVertical,
  Loader2,
  RefreshCw,
  X,
  Check,
  User,
  Trash2,
  Edit,
  ChevronRight,
  Calendar,
  Target,
} from "lucide-react";
import { dealsApi, contactsApi, type Deal, type DealCreate, type Contact } from "@/lib/api";

const PIPELINE_STAGES = [
  { id: "novo_lead", name: "Novo Lead", color: "bg-blue-500" },
  { id: "contato_feito", name: "Contato Feito", color: "bg-cyan-500" },
  { id: "proposta_enviada", name: "Proposta Enviada", color: "bg-amber-500" },
  { id: "negociacao", name: "Negociacao", color: "bg-orange-500" },
  { id: "ganho", name: "Ganho", color: "bg-emerald-500" },
];

export function PipelineConnected() {
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);

  // Form state
  const [formData, setFormData] = useState<DealCreate>({
    title: "",
    value: 0,
    stage: "novo_lead",
    contact_id: "",
    probability: 10,
    expected_close_date: "",
    notes: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dealsData, contactsData] = await Promise.all([
        dealsApi.getAll(),
        contactsApi.getAll(),
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!formData.title.trim()) return;
    
    setSaving(true);
    try {
      const newDeal = await dealsApi.create(formData);
      setDeals([newDeal, ...deals]);
      setShowCreateModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingDeal || !formData.title.trim()) return;
    
    setSaving(true);
    try {
      const updated = await dealsApi.update(editingDeal.id, formData);
      setDeals(deals.map(d => d.id === updated.id ? updated : d));
      setEditingDeal(null);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStageChange = async (dealId: string, newStage: string) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;
    
    try {
      const updated = await dealsApi.update(dealId, { ...deal, stage: newStage });
      setDeals(deals.map(d => d.id === updated.id ? updated : d));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este negocio?")) return;
    
    try {
      await dealsApi.delete(id);
      setDeals(deals.filter(d => d.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      value: 0,
      stage: "novo_lead",
      contact_id: "",
      probability: 10,
      expected_close_date: "",
      notes: "",
    });
  };

  const openEditModal = (deal: Deal) => {
    setFormData({
      title: deal.title,
      value: deal.value,
      stage: deal.stage,
      contact_id: deal.contact_id || "",
      probability: deal.probability,
      expected_close_date: deal.expected_close_date || "",
      notes: deal.notes || "",
    });
    setEditingDeal(deal);
  };

  // Drag and drop handlers
  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageId: string) => {
    if (draggedDeal && draggedDeal.stage !== stageId) {
      handleStageChange(draggedDeal.id, stageId);
    }
    setDraggedDeal(null);
  };

  const getContactName = (contactId?: string) => {
    if (!contactId) return null;
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || null;
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getStageDeals = (stageId: string) => deals.filter(d => d.stage === stageId);
  const getStageValue = (stageId: string) => getStageDeals(stageId).reduce((sum, d) => sum + d.value, 0);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pipeline de Vendas</h1>
            <p className="text-muted-foreground">
              {deals.length} negocios | Total: {formatCurrency(deals.reduce((s, d) => s + d.value, 0))}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Novo Negocio
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          {error}
          <button onClick={() => setError(null)} className="float-right">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Pipeline Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 min-w-max">
          {PIPELINE_STAGES.map((stage) => (
            <div
              key={stage.id}
              className="w-80 flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
            >
              {/* Stage Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                  <h3 className="font-semibold text-foreground">{stage.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    ({getStageDeals(stage.id).length})
                  </span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {formatCurrency(getStageValue(stage.id))}
                </span>
              </div>

              {/* Stage Column */}
              <div className="space-y-3 min-h-[400px] rounded-xl bg-secondary/30 p-3">
                {getStageDeals(stage.id).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Target className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Arraste negocios aqui
                    </p>
                  </div>
                ) : (
                  getStageDeals(stage.id).map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => handleDragStart(deal)}
                      className={`group cursor-grab rounded-lg border bg-card p-4 transition-all hover:border-primary/50 ${
                        draggedDeal?.id === deal.id ? "opacity-50 border-primary" : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground">{deal.title}</h4>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(deal)}
                            className="p-1 rounded hover:bg-secondary text-muted-foreground"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(deal.id)}
                            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-lg font-bold text-emerald-500 mb-2">
                        {formatCurrency(deal.value)}
                      </p>

                      {getContactName(deal.contact_id) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <User className="h-3 w-3" />
                          <span>{getContactName(deal.contact_id)}</span>
                        </div>
                      )}

                      {deal.expected_close_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(deal.expected_close_date).toLocaleDateString("pt-BR")}</span>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="h-1.5 flex-1 rounded-full bg-secondary mr-2">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{deal.probability}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingDeal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-card rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {editingDeal ? "Editar Negocio" : "Novo Negocio"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingDeal(null);
                  resetForm();
                }}
                className="p-1 rounded hover:bg-secondary text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Titulo *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nome do negocio"
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Valor (R$)</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Estagio</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                >
                  {PIPELINE_STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Contato</label>
                <select
                  value={formData.contact_id}
                  onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Selecione um contato</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Probabilidade: {formData.probability}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Data de Fechamento</label>
                <input
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observacoes..."
                  rows={2}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingDeal(null);
                  resetForm();
                }}
                className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-lg hover:bg-secondary/80"
              >
                Cancelar
              </button>
              <button
                onClick={editingDeal ? handleUpdate : handleCreate}
                disabled={saving || !formData.title.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {editingDeal ? "Salvar" : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
