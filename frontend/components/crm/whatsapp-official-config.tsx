"use client";

import { useState } from "react";
import { X, Key, Phone, Webhook, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";

interface WhatsAppOfficialConfigProps {
  onClose: () => void;
  onSave: (config: any) => void;
}

export function WhatsAppOfficialConfig({ onClose, onSave }: WhatsAppOfficialConfigProps) {
  const [config, setConfig] = useState({
    phoneNumberId: "",
    accessToken: "",
    verifyToken: "primo_crm_webhook_token",
    businessAccountId: "",
  });

  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/whatsapp/webhook`
    : '';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    // Salvar configuração (pode ser no localStorage ou Supabase)
    localStorage.setItem('whatsapp_official_config', JSON.stringify(config));
    onSave(config);
    alert('✅ Configuração salva! Agora você pode enviar e receber mensagens via API Oficial.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-foreground">WhatsApp Business API</h3>
            <p className="text-sm text-muted-foreground">Configure a API Oficial do Facebook</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-secondary"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Steps */}
        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step >= s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {s}
            </div>
          ))}
          <div className="flex-1 text-sm text-muted-foreground">
            Passo {step} de 3
          </div>
        </div>

        {/* Step 1: Criar App no Facebook */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-500/10 p-4 border border-blue-500/20">
              <h4 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
                📱 Passo 1: Criar Aplicativo no Meta
              </h4>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>
                    Acesse:{" "}
                    <a
                      href="https://developers.facebook.com/apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Facebook Developers
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Clique em "Criar App"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Selecione "Business" como tipo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Preencha as informações e crie o app</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">5.</span>
                  <span>Adicione o produto "WhatsApp" ao seu app</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">6.</span>
                  <span>Em "Getting Started", você verá Phone Number ID e Access Token</span>
                </li>
              </ol>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Próximo: Configurar Credenciais
            </button>
          </div>
        )}

        {/* Step 2: Configurar Credenciais */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-4">
              {/* Phone Number ID */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Phone className="h-4 w-4" />
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={config.phoneNumberId}
                  onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                  placeholder="123456789012345"
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Encontre em: WhatsApp → API Setup → Phone Number ID
                </p>
              </div>

              {/* Access Token */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Key className="h-4 w-4" />
                  Access Token (Permanente)
                </label>
                <input
                  type="password"
                  value={config.accessToken}
                  onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                  placeholder="EAAxxxxxxxxxx..."
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Gere um token permanente em: WhatsApp → API Setup → Permanent Token
                </p>
              </div>

              {/* Business Account ID */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  Business Account ID (opcional)
                </label>
                <input
                  type="text"
                  value={config.businessAccountId}
                  onChange={(e) => setConfig({ ...config, businessAccountId: e.target.value })}
                  placeholder="123456789012345"
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border border-border px-4 py-3 font-medium text-foreground hover:bg-secondary"
              >
                Voltar
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!config.phoneNumberId || !config.accessToken}
                className="flex-1 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próximo: Configurar Webhook
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Configurar Webhook */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-amber-500/10 p-4 border border-amber-500/20">
              <h4 className="mb-2 font-semibold text-amber-600 dark:text-amber-400">
                🔗 Passo 3: Configurar Webhook
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Configure o webhook no Facebook para receber mensagens em tempo real.
              </p>

              {/* Webhook URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Webhook URL:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={webhookUrl}
                    readOnly
                    className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                  />
                  <button
                    onClick={() => copyToClipboard(webhookUrl)}
                    className="rounded-lg bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Verify Token */}
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-foreground">Verify Token:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={config.verifyToken}
                    readOnly
                    className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                  />
                  <button
                    onClick={() => copyToClipboard(config.verifyToken)}
                    className="rounded-lg bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Vá em WhatsApp → Configuration → Webhook</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Cole a Webhook URL acima</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Cole o Verify Token acima</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Clique em "Verify and Save"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">5.</span>
                  <span>Ative "messages" nos Webhook fields</span>
                </li>
              </ol>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-lg border border-border px-4 py-3 font-medium text-foreground hover:bg-secondary"
              >
                Voltar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                <CheckCircle2 className="mr-2 inline h-5 w-5" />
                Concluir Configuração
              </button>
            </div>
          </div>
        )}

        {/* Help */}
        <div className="mt-6 rounded-lg bg-blue-500/10 p-4 border border-blue-500/20">
          <p className="text-xs text-muted-foreground">
            <strong>💡 Dica:</strong> A API Oficial requer aprovação do Facebook e tem custos por mensagem.
            Para testes, use o WhatsApp (Baileys) que é gratuito.
          </p>
        </div>
      </div>
    </div>
  );
}
