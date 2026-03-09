"use client";

import React from "react"

import { useState } from "react";
import {
  Plus,
  MoreVertical,
  User,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  X,
  ChevronDown,
  Search,
  Filter,
  GripVertical,
} from "lucide-react";
import { useCRMStore, type Deal } from "@/lib/store";

interface PipelineProps {
  onOpenContact: (contactId: string) => void;
}

export function Pipeline({ onOpenContact }: PipelineProps) {
  const {
    deals,
    pipelineStages,
    contacts,
    users,
    addDeal,
    updateDeal,
    deleteDeal,
    moveDealToStage,
  } = useCRMStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [newDeal, setNewDeal] = useState({
    title: "",
    value: "",
    contactId: "",
    responsibleId: "",
    stage: "new",
    expectedCloseDate: "",
    notes: "",
  });

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getContactById = (id: string) => contacts.find((c) => c.id === id);
  const getUserById = (id: string | null) => users.find((u) => u.id === id);

  const filteredDeals = deals.filter((deal) => {
    const contact = getContactById(deal.contactId);
    return (
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedDealId) {
      moveDealToStage(draggedDealId, stageId);
    }
    setDraggedDealId(null);
    setDragOverStage(null);
  };

  const handleAddDeal = () => {
    if (!newDeal.title || !newDeal.value || !newDeal.contactId) return;

    const deal: Deal = {
      id: `deal-${Date.now()}`,
      title: newDeal.title,
      value: parseFloat(newDeal.value),
      contactId: newDeal.contactId,
      responsibleId: newDeal.responsibleId || null,
      stage: newDeal.stage,
      probability: 20,
      expectedCloseDate: newDeal.expectedCloseDate,
      createdAt: new Date().toISOString().split("T")[0],
      tags: [],
      notes: newDeal.notes,
      products: [],
    };

    addDeal(deal);
    setNewDeal({
      title: "",
      value: "",
      contactId: "",
      responsibleId: "",
      stage: "new",
      expectedCloseDate: "",
      notes: "",
    });
    setShowAddModal(false);
  };

  const handleEditDeal = () => {
    if (!selectedDeal) return;
    updateDeal(selectedDeal.id, selectedDeal);
    setShowEditModal(false);
    setSelectedDeal(null);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Funil de Vendas</h2>
          <p className="text-sm text-muted-foreground">
            Total em pipeline:{" "}
            {formatCurrency(
              deals.filter((d) => d.stage !== "won" && d.stage !== "lost").reduce((s, d) => s + d.value, 0)
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar negócios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Negócio</span>
          </button>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex h-full gap-4">
          {pipelineStages
            .filter((s) => s.id !== "lost")
            .map((stage) => {
              const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
              const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

              return (
                <div
                  key={stage.id}
                  className={`flex w-80 flex-shrink-0 flex-col rounded-xl border bg-card transition-colors ${
                    dragOverStage === stage.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Stage Header */}
                  <div className="border-b border-border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        <h3 className="font-semibold text-foreground">{stage.name}</h3>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          {stageDeals.length}
                        </span>
                      </div>
                      <button className="rounded p-1 hover:bg-secondary">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                    <p className="text-sm font-medium" style={{ color: stage.color }}>
                      {formatCurrency(stageTotal)}
                    </p>
                  </div>

                  {/* Deals List */}
                  <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {stageDeals.map((deal) => {
                      const contact = getContactById(deal.contactId);
                      const responsible = getUserById(deal.responsibleId);

                      return (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal.id)}
                          onDragEnd={() => setDraggedDealId(null)}
                          className={`cursor-grab rounded-lg border border-border bg-secondary p-4 transition-all hover:shadow-md active:cursor-grabbing ${
                            draggedDealId === deal.id ? "opacity-50" : ""
                          }`}
                        >
                          <div className="mb-3 flex items-start justify-between">
                            <div>
                              <p className="font-medium text-foreground">{deal.title}</p>
                              {contact && (
                                <p
                                  className="cursor-pointer text-sm text-muted-foreground hover:text-primary"
                                  onClick={() => onOpenContact(contact.id)}
                                >
                                  {contact.name}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setSelectedDeal(deal);
                                setShowEditModal(true);
                              }}
                              className="rounded p-1 hover:bg-card"
                            >
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </div>

                          <p className="mb-3 text-lg font-bold text-primary">
                            {formatCurrency(deal.value)}
                          </p>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{deal.expectedCloseDate}</span>
                            </div>
                            {responsible && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-card text-[10px] font-medium">
                                {responsible.avatar}
                              </div>
                            )}
                          </div>

                          {/* Probability bar */}
                          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-card">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${deal.probability}%`,
                                backgroundColor: stage.color,
                              }}
                            />
                          </div>
                          <p className="mt-1 text-right text-xs text-muted-foreground">
                            {deal.probability}% probabilidade
                          </p>
                        </div>
                      );
                    })}

                    {stageDeals.length === 0 && (
                      <div className="py-8 text-center text-muted-foreground">
                        <p className="text-sm">Nenhum negócio nesta etapa</p>
                      </div>
                    )}
                  </div>

                  {/* Add Deal Button */}
                  <div className="border-t border-border p-3">
                    <button
                      onClick={() => {
                        setNewDeal((prev) => ({ ...prev, stage: stage.id }));
                        setShowAddModal(true);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Novo Negócio</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded p-1 hover:bg-secondary"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Título do Negócio *
                </label>
                <input
                  type="text"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                  placeholder="Ex: Plano Profissional"
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Valor *
                  </label>
                  <input
                    type="number"
                    value={newDeal.value}
                    onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Previsão de Fechamento
                  </label>
                  <input
                    type="date"
                    value={newDeal.expectedCloseDate}
                    onChange={(e) => setNewDeal({ ...newDeal, expectedCloseDate: e.target.value })}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Contato *
                </label>
                <select
                  value={newDeal.contactId}
                  onChange={(e) => setNewDeal({ ...newDeal, contactId: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
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
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Responsável
                </label>
                <select
                  value={newDeal.responsibleId}
                  onChange={(e) => setNewDeal({ ...newDeal, responsibleId: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Selecione um responsável</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Etapa do Funil
                </label>
                <select
                  value={newDeal.stage}
                  onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  {pipelineStages
                    .filter((s) => s.id !== "lost")
                    .map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Observações
                </label>
                <textarea
                  value={newDeal.notes}
                  onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                  rows={3}
                  placeholder="Adicione notas sobre este negócio..."
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddDeal}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Criar Negócio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Deal Modal */}
      {showEditModal && selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Editar Negócio</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedDeal(null);
                }}
                className="rounded p-1 hover:bg-secondary"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Título do Negócio
                </label>
                <input
                  type="text"
                  value={selectedDeal.title}
                  onChange={(e) =>
                    setSelectedDeal({ ...selectedDeal, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Valor
                  </label>
                  <input
                    type="number"
                    value={selectedDeal.value}
                    onChange={(e) =>
                      setSelectedDeal({ ...selectedDeal, value: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Probabilidade (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedDeal.probability}
                    onChange={(e) =>
                      setSelectedDeal({
                        ...selectedDeal,
                        probability: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                      })
                    }
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Responsável
                </label>
                <select
                  value={selectedDeal.responsibleId || ""}
                  onChange={(e) =>
                    setSelectedDeal({ ...selectedDeal, responsibleId: e.target.value || null })
                  }
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Sem responsável</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Observações
                </label>
                <textarea
                  value={selectedDeal.notes}
                  onChange={(e) =>
                    setSelectedDeal({ ...selectedDeal, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => {
                  deleteDeal(selectedDeal.id);
                  setShowEditModal(false);
                  setSelectedDeal(null);
                }}
                className="flex items-center gap-2 rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedDeal(null);
                  }}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditDeal}
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
