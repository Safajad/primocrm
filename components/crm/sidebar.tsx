"use client";

import {
  Home,
  MessageSquare,
  Target,
  CheckSquare,
  Bot,
  Brain,
  Wallet,
  Users,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  MessageCircle,
} from "lucide-react";
import { PrimoLogo } from "@/components/primo-logo";
import { useCRMStore } from "@/lib/store";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }: SidebarProps) {
  const { conversations, tasks, notifications } = useCRMStore();

  const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const menuItems = [
    {
      section: "Principal",
      items: [
        { id: "dashboard", icon: Home, label: "Dashboard", badge: null },
        { id: "inbox", icon: MessageSquare, label: "Comunicações", badge: unreadMessages || null },
        { id: "pipeline", icon: Target, label: "Funil de Vendas", badge: null },
        { id: "tasks", icon: CheckSquare, label: "Tarefas", badge: pendingTasks || null },
      ],
    },
    {
      section: "Automação",
      items: [
        { id: "chatbot", icon: Bot, label: "Chatbot Builder", badge: null },
        { id: "ai", icon: Brain, label: "Assistente IA", badge: null },
      ],
    },
    {
      section: "Financeiro",
      items: [{ id: "cashflow", icon: Wallet, label: "Fluxo de Caixa", badge: null }],
    },
    {
      section: "Equipe",
      items: [{ id: "team", icon: Users, label: "Chat da Equipe", badge: null }],
    },
    {
      section: "Integrações",
      items: [
        { id: "integrations", icon: Zap, label: "Integrações", badge: null },
      ],
    },
  ];

  const bottomItems = [
    { id: "settings", icon: Settings, label: "Configurações" },
    { id: "help", icon: HelpCircle, label: "Ajuda" },
  ];

  return (
    <aside
      className={`flex flex-col border-r border-border bg-sidebar transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && <PrimoLogo />}
        {collapsed && (
          <div className="mx-auto">
            <PrimoLogo iconOnly />
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-3">
        {menuItems.map((section) => (
          <div key={section.section} className="mb-4">
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
                {section.section}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="min-w-[20px] rounded-full bg-destructive px-1.5 py-0.5 text-center text-xs font-semibold text-destructive-foreground">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute -right-1 -top-1 min-w-[16px] rounded-full bg-destructive px-1 text-center text-xs font-semibold text-destructive-foreground">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Menu */}
      <div className="border-t border-border p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="mx-auto h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Recolher</span>
            </>
          )}
        </button>
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              activeTab === item.id
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            } ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>
    </aside>
  );
}
