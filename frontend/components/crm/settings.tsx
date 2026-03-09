"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Building,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Key,
  Plug,
  MessageCircle,
  Instagram,
  Facebook,
  Mail,
  Check,
  X,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
} from "lucide-react";
import { useCRMStore } from "@/lib/store";

export function SettingsPanel() {
  const { settings, updateSettings, currentUser, updateUser, users } = useCRMStore();
  const [activeSection, setActiveSection] = useState("general");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  const sections = [
    { id: "general", icon: Building, label: "Geral" },
    { id: "profile", icon: User, label: "Perfil" },
    { id: "notifications", icon: Bell, label: "Notificacoes" },
    { id: "integrations", icon: Plug, label: "Integracoes" },
    { id: "api", icon: Key, label: "API Keys" },
    { id: "appearance", icon: Palette, label: "Aparencia" },
    { id: "security", icon: Shield, label: "Seguranca" },
    { id: "billing", icon: CreditCard, label: "Faturamento" },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    updateSettings(tempSettings);
    setIsSaving(false);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Informacoes da Empresa</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Nome da Empresa</label>
            <input
              type="text"
              value={tempSettings.companyName}
              onChange={(e) => setTempSettings({ ...tempSettings, companyName: e.target.value })}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Fuso Horario</label>
            <select
              value={tempSettings.timezone}
              onChange={(e) => setTempSettings({ ...tempSettings, timezone: e.target.value })}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
            >
              <option value="America/Sao_Paulo">Brasilia (GMT-3)</option>
              <option value="America/New_York">New York (GMT-5)</option>
              <option value="Europe/London">London (GMT+0)</option>
              <option value="Europe/Paris">Paris (GMT+1)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Idioma</label>
            <select
              value={tempSettings.language}
              onChange={(e) => setTempSettings({ ...tempSettings, language: e.target.value })}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
            >
              <option value="pt-BR">Portugues (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Espanol</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Moeda</label>
            <select
              value={tempSettings.currency}
              onChange={(e) => setTempSettings({ ...tempSettings, currency: e.target.value })}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
            >
              <option value="BRL">Real (R$)</option>
              <option value="USD">Dollar ($)</option>
              <option value="EUR">Euro (E)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Seu Perfil</h3>
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/40 text-2xl font-bold text-primary">
            {currentUser.avatar}
          </div>
          <div>
            <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">
              Alterar Foto
            </button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Nome Completo</label>
            <input
              type="text"
              value={currentUser.name}
              onChange={(e) => updateUser(currentUser.id, { name: e.target.value })}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={currentUser.email}
              onChange={(e) => updateUser(currentUser.id, { email: e.target.value })}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Telefone</label>
            <input
              type="tel"
              value={currentUser.phone || ""}
              onChange={(e) => updateUser(currentUser.id, { phone: e.target.value })}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Departamento</label>
            <input
              type="text"
              value={currentUser.department || ""}
              onChange={(e) => updateUser(currentUser.id, { department: e.target.value })}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Status</h3>
        <div className="flex gap-3">
          {(["online", "away", "offline"] as const).map((status) => (
            <button
              key={status}
              onClick={() => updateUser(currentUser.id, { status })}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                currentUser.status === status
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground hover:bg-secondary"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "online" ? "bg-emerald-500" : status === "away" ? "bg-amber-500" : "bg-zinc-500"
                }`}
              />
              {status === "online" ? "Online" : status === "away" ? "Ausente" : "Offline"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Preferencias de Notificacao</h3>
        <div className="space-y-4">
          {[
            { id: "messages", label: "Novas mensagens", description: "Receba alertas quando receber novas mensagens" },
            { id: "deals", label: "Atualizacoes de negocios", description: "Notificacoes sobre mudancas no pipeline" },
            { id: "tasks", label: "Tarefas", description: "Lembretes de tarefas proximas e vencidas" },
            { id: "mentions", label: "Mencoes", description: "Quando alguem mencionar voce no chat" },
            { id: "system", label: "Sistema", description: "Atualizacoes e alertas do sistema" },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <div className="peer h-6 w-11 rounded-full bg-secondary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-foreground after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Canais de Comunicacao</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { id: "whatsapp", icon: MessageCircle, label: "WhatsApp Business", connected: settings.whatsappConnected, color: "#25D366" },
            { id: "instagram", icon: Instagram, label: "Instagram Direct", connected: settings.instagramConnected, color: "#E4405F" },
            { id: "facebook", icon: Facebook, label: "Facebook Messenger", connected: settings.facebookConnected, color: "#1877F2" },
            { id: "email", icon: Mail, label: "Email (SMTP)", connected: settings.emailConnected, color: "#EA4335" },
          ].map((integration) => (
            <div
              key={integration.id}
              className="flex items-center justify-between rounded-xl border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2" style={{ backgroundColor: `${integration.color}20` }}>
                  <integration.icon className="h-5 w-5" style={{ color: integration.color }} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{integration.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {integration.connected ? "Conectado" : "Nao conectado"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const key = `${integration.id}Connected` as keyof typeof settings;
                  updateSettings({ [key]: !settings[key] });
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  integration.connected
                    ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {integration.connected ? "Desconectar" : "Conectar"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Chaves de API</h3>
        <div className="space-y-4">
          <div className="rounded-xl border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/20 p-2">
                  <Key className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">OpenAI API Key</p>
                  <p className="text-sm text-muted-foreground">Necessaria para funcionalidades de IA</p>
                </div>
              </div>
              {settings.openaiApiKey && (
                <span className="flex items-center gap-1 text-sm text-emerald-500">
                  <Check className="h-4 w-4" />
                  Configurada
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={tempSettings.openaiApiKey}
                  onChange={(e) => setTempSettings({ ...tempSettings, openaiApiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 pr-10 text-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={() => updateSettings({ openaiApiKey: tempSettings.openaiApiKey })}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Tema</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { id: "light", label: "Claro", preview: "bg-white border-zinc-200" },
            { id: "dark", label: "Escuro", preview: "bg-zinc-900 border-zinc-700" },
            { id: "system", label: "Sistema", preview: "bg-gradient-to-r from-white to-zinc-900 border-zinc-400" },
          ].map((theme) => (
            <button
              key={theme.id}
              className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 hover:border-primary"
            >
              <div className={`h-20 w-full rounded-lg border ${theme.preview}`} />
              <span className="text-sm font-medium text-foreground">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Seguranca da Conta</h3>
        <div className="space-y-4">
          <div className="rounded-xl border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Alterar Senha</p>
                <p className="text-sm text-muted-foreground">Atualize sua senha regularmente</p>
              </div>
              <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">
                Alterar
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Autenticacao em Duas Etapas</p>
                <p className="text-sm text-muted-foreground">Adicione uma camada extra de seguranca</p>
              </div>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Ativar
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Sessoes Ativas</p>
                <p className="text-sm text-muted-foreground">Gerencie seus dispositivos conectados</p>
              </div>
              <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">
                Ver Todas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Plano Atual</h3>
        <div className="rounded-xl border-2 border-primary bg-primary/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">PRO</span>
              <h4 className="mt-2 text-2xl font-bold text-foreground">R$ 197/mes</h4>
            </div>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Upgrade
            </button>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Usuarios ilimitados</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Integracoes avancadas</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Suporte prioritario</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> API completa</li>
          </ul>
        </div>
      </div>
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Metodo de Pagamento</h3>
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">**** **** **** 4242</p>
                <p className="text-sm text-muted-foreground">Expira 12/2027</p>
              </div>
            </div>
            <button className="text-sm text-primary hover:text-primary/80">Alterar</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return renderGeneralSettings();
      case "profile":
        return renderProfileSettings();
      case "notifications":
        return renderNotificationSettings();
      case "integrations":
        return renderIntegrations();
      case "api":
        return renderApiSettings();
      case "appearance":
        return renderAppearance();
      case "security":
        return renderSecurity();
      case "billing":
        return renderBilling();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-border bg-card p-4">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Configuracoes</h2>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <section.icon className="h-4 w-4" />
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl">
          {renderContent()}
          
          {/* Save Button */}
          <div className="mt-8 flex justify-end border-t border-border pt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Salvando..." : "Salvar Alteracoes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
