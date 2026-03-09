"use client";

import { useState } from "react";
import {
  Search,
  Book,
  MessageCircle,
  Video,
  FileText,
  ChevronRight,
  ExternalLink,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  HelpCircle,
  Zap,
  Users,
  Target,
  Wallet,
  Bot,
  Settings,
} from "lucide-react";

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const categories = [
    { id: "getting-started", icon: Zap, label: "Primeiros Passos", articles: 12 },
    { id: "inbox", icon: MessageCircle, label: "Comunicacoes", articles: 8 },
    { id: "pipeline", icon: Target, label: "Funil de Vendas", articles: 15 },
    { id: "tasks", icon: CheckCircle, label: "Tarefas", articles: 6 },
    { id: "automation", icon: Bot, label: "Automacoes", articles: 20 },
    { id: "team", icon: Users, label: "Equipe", articles: 10 },
    { id: "financial", icon: Wallet, label: "Financeiro", articles: 8 },
    { id: "settings", icon: Settings, label: "Configuracoes", articles: 14 },
  ];

  const popularArticles = [
    { id: 1, title: "Como configurar o WhatsApp Business", category: "Integracoes", views: 2450 },
    { id: 2, title: "Criando seu primeiro fluxo de automacao", category: "Automacoes", views: 1820 },
    { id: 3, title: "Gerenciando seu funil de vendas", category: "Pipeline", views: 1560 },
    { id: 4, title: "Configurando notificacoes", category: "Configuracoes", views: 1230 },
    { id: 5, title: "Integrando IA no atendimento", category: "IA", views: 980 },
  ];

  const faqs = [
    {
      question: "Como conectar meu WhatsApp Business?",
      answer: "Va ate Configuracoes > Integracoes > WhatsApp Business e clique em 'Conectar'. Siga as instrucoes para escanear o QR Code com seu celular."
    },
    {
      question: "Posso ter multiplos usuarios?",
      answer: "Sim! No plano Pro voce pode adicionar usuarios ilimitados. Va ate Configuracoes > Equipe para gerenciar membros."
    },
    {
      question: "Como funciona o fluxo de caixa?",
      answer: "O fluxo de caixa e automaticamente atualizado quando voce registra uma venda como 'Ganha' no pipeline. Voce tambem pode adicionar transacoes manualmente."
    },
    {
      question: "A IA responde automaticamente?",
      answer: "Sim, quando configurada. Va ate Chatbot Builder para criar fluxos automatizados com IA ou configure agentes de IA no Assistente IA."
    },
    {
      question: "Como atribuir um responsavel a um lead?",
      answer: "Clique no contato ou negocio e selecione o responsavel no menu dropdown. Voce tambem pode configurar atribuicao automatica nas automacoes."
    },
  ];

  const handleSubmitTicket = () => {
    // Simulate ticket submission
    setTicketSubmitted(true);
    setTimeout(() => {
      setShowTicketForm(false);
      setTicketSubmitted(false);
      setTicketSubject("");
      setTicketMessage("");
    }, 2000);
  };

  const filteredArticles = searchQuery
    ? popularArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : popularArticles;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-foreground">Como podemos ajudar?</h1>
          <p className="mb-6 text-muted-foreground">
            Encontre respostas, tutoriais e entre em contato com nosso suporte
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar artigos, tutoriais..."
              className="w-full rounded-xl border border-border bg-card py-4 pl-12 pr-4 text-foreground shadow-lg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">
          {/* Quick Actions */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <button
              onClick={() => setShowTicketForm(true)}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-lg"
            >
              <div className="rounded-lg bg-primary/20 p-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Abrir Ticket</h3>
                <p className="text-sm text-muted-foreground">Envie uma solicitacao</p>
              </div>
            </button>
            <a
              href="#"
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-lg"
            >
              <div className="rounded-lg bg-emerald-500/20 p-3">
                <MessageCircle className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Chat ao Vivo</h3>
                <p className="text-sm text-muted-foreground">Fale com um agente</p>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-lg"
            >
              <div className="rounded-lg bg-blue-500/20 p-3">
                <Video className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Video Tutoriais</h3>
                <p className="text-sm text-muted-foreground">Aprenda com videos</p>
              </div>
            </a>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Categorias</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                    activeCategory === category.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="rounded-lg bg-secondary p-2">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{category.label}</p>
                    <p className="text-sm text-muted-foreground">{category.articles} artigos</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Popular Articles */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">Artigos Populares</h2>
              <div className="rounded-xl border border-border bg-card">
                {filteredArticles.map((article, index) => (
                  <a
                    key={article.id}
                    href="#"
                    className={`flex items-center justify-between p-4 transition-colors hover:bg-secondary ${
                      index !== filteredArticles.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{article.title}</p>
                        <p className="text-sm text-muted-foreground">{article.category}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">Perguntas Frequentes</h2>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-foreground">
                      <span className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-primary" />
                        {faq.question}
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="border-t border-border px-4 py-3 text-muted-foreground">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Outras Formas de Contato</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-secondary p-2">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">suporte@primocrm.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-secondary p-2">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium text-foreground">(71) 99999-0000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-secondary p-2">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horario</p>
                  <p className="font-medium text-foreground">Seg-Sex, 8h-18h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      {showTicketForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-card p-6">
            {ticketSubmitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">Ticket Enviado!</h3>
                <p className="text-muted-foreground">
                  Recebemos sua solicitacao e responderemos em breve.
                </p>
              </div>
            ) : (
              <>
                <h3 className="mb-4 text-xl font-semibold text-foreground">Abrir Ticket de Suporte</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Assunto</label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="Resumo do problema"
                      className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Categoria</label>
                    <select className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none">
                      <option>Selecione uma categoria</option>
                      <option>Problema tecnico</option>
                      <option>Duvida sobre funcionalidade</option>
                      <option>Faturamento</option>
                      <option>Sugestao</option>
                      <option>Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Mensagem</label>
                    <textarea
                      rows={5}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Descreva seu problema ou duvida em detalhes..."
                      className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowTicketForm(false)}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmitTicket}
                      disabled={!ticketSubject || !ticketMessage}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      Enviar Ticket
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
