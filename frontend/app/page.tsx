"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PrimoLogo } from "@/components/primo-logo";

// Dynamic imports for code splitting
const Sidebar = dynamic(() => import("@/components/crm/sidebar").then((m) => m.Sidebar), {
  ssr: false,
});
const Header = dynamic(() => import("@/components/crm/header").then((m) => m.Header), {
  ssr: false,
});
const Dashboard = dynamic(() => import("@/components/crm/dashboard-connected").then((m) => m.DashboardConnected), {
  ssr: false,
});
const Inbox = dynamic(() => import("@/components/crm/inbox-connected").then((m) => m.InboxConnected), { ssr: false });
const Pipeline = dynamic(() => import("@/components/crm/pipeline-connected").then((m) => m.PipelineConnected), {
  ssr: false,
});
const TasksManager = dynamic(
  () => import("@/components/crm/tasks-manager").then((m) => m.TasksManager),
  { ssr: false }
);
const WorkflowBuilder = dynamic(
  () => import("@/components/crm/workflow-builder-v2").then((m) => m.WorkflowBuilderV2),
  { ssr: false }
);
const IntegrationsPanel = dynamic(
  () => import("@/components/crm/integrations-panel").then((m) => m.IntegrationsPanel),
  { ssr: false }
);
const AIAssistant = dynamic(
  () => import("@/components/crm/ai-assistant-new").then((m) => m.AIAssistantNew),
  { ssr: false }
);
const CashFlowManager = dynamic(
  () => import("@/components/crm/cash-flow").then((m) => m.CashFlowManager),
  { ssr: false }
);
const TeamChat = dynamic(() => import("@/components/crm/team-chat").then((m) => m.TeamChat), {
  ssr: false,
});
const SettingsPanel = dynamic(
  () => import("@/components/crm/settings").then((m) => m.SettingsPanel),
  { ssr: false }
);
const HelpCenter = dynamic(() => import("@/components/crm/help-center").then((m) => m.HelpCenter), {
  ssr: false,
});
const ProfilePanel = dynamic(
  () => import("@/components/crm/profile-panel").then((m) => m.ProfilePanel),
  { ssr: false }
);
const ContactProfile = dynamic(
  () => import("@/components/crm/contact-profile").then((m) => m.ContactProfile),
  { ssr: false }
);

export default function PrimoCRM() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <PrimoLogo size="lg" />
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (selectedContactId) {
      return (
        <ContactProfile
          contactId={selectedContactId}
          onClose={() => setSelectedContactId(null)}
        />
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigate={setActiveTab} />;
      case "inbox":
      case "communications":
        return <Inbox onOpenContact={setSelectedContactId} />;
      case "pipeline":
        return <Pipeline />;
      case "tasks":
        return <TasksManager />;
      case "chatbot":
        return <WorkflowBuilder />;
      case "ai":
        return <AIAssistant />;
      case "cashflow":
        return <CashFlowManager />;
      case "team":
        return <TeamChat />;
      case "integrations":
        return <IntegrationsPanel />;
      case "settings":
        return <SettingsPanel />;
      case "help":
        return <HelpCenter />;
      case "profile":
        return <ProfilePanel />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
