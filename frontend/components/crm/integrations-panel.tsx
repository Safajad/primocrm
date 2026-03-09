"use client";

import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Instagram,
  Send,
  QrCode,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Phone,
  Users,
  MessageSquare,
  Settings,
  AlertCircle,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  icon: typeof MessageCircle;
  color: string;
  status: "connected" | "disconnected" | "configuring";
  description: string;
}

export function IntegrationsPanel() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "whatsapp-baileys",
      name: "WhatsApp (Baileys)",
      icon: MessageCircle,
      color: "#25D366",
      status: "disconnected",
      description: "Conecte via QR Code - Gratuito, sem custos adicionais",
    },
    {
      id: "whatsapp-official",
      name: "WhatsApp Business API",
      icon: MessageCircle,
      color: "#128C7E",
      status: "disconnected",
      description: "API Oficial do Facebook - Requer aprovação e custos por mensagem",
    },
    {
      id: "instagram",
      name: "Instagram Direct",
      icon: Instagram,
      color: "#E4405F",
      status: "disconnected",
      description: "Gerencie mensagens diretas do Instagram em um único lugar",
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: Send,
      color: "#0088cc",
      status: "disconnected",
      description: "Integre seu bot do Telegram para atendimento automatizado",
    },
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    // Gerar sessionId único para o usuário
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || `user-${Date.now()}` : `user-${Date.now()}`;
    setSessionId(userId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', userId);
    }
  }, []);

  const connectWhatsApp = async () => {
    setIsConnecting(true);
    setShowQRCode(true);

    try {
      // Usar a nova API do whatsapp-web.js
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      
      // Iniciar sessão
      const response = await fetch(`${backendUrl}/api/webhooks/whatsapp-unofficial/session/start/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      console.log('Sessão iniciada:', data);

      // Polling para obter QR Code e status
      const checkStatus = setInterval(async () => {
        try {
          // Verificar status da sessão
          const statusResponse = await fetch(`${backendUrl}/api/webhooks/whatsapp-unofficial/session/status/${sessionId}`);
          const statusData = await statusResponse.json();
          console.log('Status:', statusData);

          if (statusData.status === 'ready') {
            setIntegrations((prev) =>
              prev.map((int) =>
                int.id === 'whatsapp-baileys'
                  ? { ...int, status: 'connected' }
                  : int
              )
            );
            setShowQRCode(false);
            setIsConnecting(false);
            clearInterval(checkStatus);
            alert('✅ WhatsApp conectado com sucesso!');
          } else if (statusData.status === 'qr_ready' && statusData.hasQrCode) {
            // Buscar QR Code
            const qrResponse = await fetch(`${backendUrl}/api/webhooks/whatsapp-unofficial/session/qr/${sessionId}`);
            const qrData = await qrResponse.json();
            if (qrData.success && qrData.qrCode) {
              setQRCode(qrData.qrCode);
            }
          }
        } catch (e) {
          console.log('Erro no polling:', e);
        }
      }, 2000);

      // Timeout após 2 minutos
      setTimeout(() => {
        clearInterval(checkStatus);
        if (isConnecting) {
          setIsConnecting(false);
          setShowQRCode(false);
          alert('⏱️ Tempo esgotado. Tente novamente.');
        }
      }, 120000);
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      setIsConnecting(false);
      setShowQRCode(false);
      alert('❌ Erro ao conectar. Verifique se o serviço está rodando.');
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/webhooks/whatsapp-unofficial/session/logout/${sessionId}`, {
        method: 'POST',
      });

      setIntegrations((prev) =>
        prev.map((int) =>
          int.id === 'whatsapp-baileys' ? { ...int, status: 'disconnected' } : int
        )
      );
      alert('✅ WhatsApp desconectado!');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      alert('❌ Erro ao desconectar WhatsApp');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "disconnected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "configuring":
        return <RefreshCw className="h-5 w-5 animate-spin text-amber-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Conectado";
      case "disconnected":
        return "Desconectado";
      case "configuring":
        return "Configurando...";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-foreground">Integrações</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Conecte seus canais de comunicação para centralizar o atendimento
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl">
          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/20 p-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {integrations.filter((i) => i.status === "connected").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Conectadas</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/20 p-3">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">3</p>
                  <p className="text-sm text-muted-foreground">Disponíveis</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-500/20 p-3">
                  <Users className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">2.4k</p>
                  <p className="text-sm text-muted-foreground">Contatos Sincronizados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className="rounded-xl p-3"
                    style={{ backgroundColor: `${integration.color}20` }}
                  >
                    <integration.icon
                      className="h-8 w-8"
                      style={{ color: integration.color }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(integration.status)}
                    <span
                      className={`text-sm font-medium ${
                        integration.status === "connected"
                          ? "text-emerald-500"
                          : integration.status === "configuring"
                            ? "text-amber-500"
                            : "text-red-500"
                      }`}
                    >
                      {getStatusText(integration.status)}
                    </span>
                  </div>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {integration.name}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {integration.description}
                </p>

                <div className="flex gap-2">
                  {integration.status === "connected" ? (
                    <>
                      <button
                        onClick={() => {
                          if (integration.id === "whatsapp-baileys") {
                            disconnectWhatsApp();
                          } else if (integration.id === "whatsapp-official") {
                            alert("⚙️ Configurações da API Oficial - Em breve!");
                          }
                        }}
                        className="flex-1 rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                      >
                        {integration.id === "whatsapp-official" ? "Configurar" : "Desconectar"}
                      </button>
                      {integration.id !== "whatsapp-official" && (
                        <button
                          onClick={() => setSelectedIntegration(integration.id)}
                          className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                          Configurar
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        if (integration.id === "whatsapp-baileys") {
                          connectWhatsApp();
                        } else if (integration.id === "whatsapp-official") {
                          setSelectedIntegration(integration.id);
                        } else {
                          alert(
                            `🚧 Integração com ${integration.name} em desenvolvimento!`
                          );
                        }
                      }}
                      disabled={integration.id !== "whatsapp-baileys" && integration.id !== "whatsapp-official"}
                      className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {integration.id === "whatsapp-official" ? "Configurar API" : "Conectar"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* QR Code Modal */}
          {showQRCode && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Conectar WhatsApp
                  </h3>
                  <button
                    onClick={() => {
                      setShowQRCode(false);
                      setIsConnecting(false);
                    }}
                    className="rounded-lg p-2 hover:bg-secondary"
                  >
                    ✕
                  </button>
                </div>

                {qrCode ? (
                  <>
                    <div className="mb-4 flex justify-center rounded-lg bg-white p-4">
                      <img
                        src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                        alt="QR Code WhatsApp"
                        className="h-48 w-48"
                      />
                    </div>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p className="flex items-start gap-2">
                        <span className="mt-0.5">1.</span>
                        <span>Abra o WhatsApp no seu telefone</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="mt-0.5">2.</span>
                        <span>
                          Toque em <strong>Menu</strong> ou{" "}
                          <strong>Configurações</strong> e selecione{" "}
                          <strong>Aparelhos conectados</strong>
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="mt-0.5">3.</span>
                        <span>
                          Toque em <strong>Conectar um aparelho</strong>
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="mt-0.5">4.</span>
                        <span>Aponte seu telefone para esta tela para capturar o QR code</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <RefreshCw className="mb-4 h-12 w-12 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Gerando QR Code...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
