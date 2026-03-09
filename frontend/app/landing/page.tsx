"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Target,
  Zap,
  Users,
  BarChart3,
  Bot,
  ArrowRight,
  Check,
  Star,
  Play,
  ChevronRight,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  MessageSquare,
  PieChart,
  Workflow,
  Phone,
} from "lucide-react";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: MessageCircle,
      title: "WhatsApp Integrado",
      description: "Conecte seu WhatsApp e gerencie todas as conversas em um só lugar",
      color: "#25D366",
    },
    {
      icon: Bot,
      title: "IA Assistente",
      description: "Automatize respostas com inteligência artificial treinada para seu negócio",
      color: "#8B5CF6",
    },
    {
      icon: Target,
      title: "Pipeline Visual",
      description: "Acompanhe cada lead do primeiro contato até o fechamento",
      color: "#F59E0B",
    },
    {
      icon: Workflow,
      title: "Automações",
      description: "Crie fluxos automatizados que trabalham 24/7 para você",
      color: "#EC4899",
    },
  ];

  const stats = [
    { value: "10x", label: "Mais Produtividade" },
    { value: "50%", label: "Menos Tempo de Resposta" },
    { value: "3x", label: "Mais Conversões" },
    { value: "24/7", label: "Atendimento Automático" },
  ];

  const plans = [
    {
      name: "Starter",
      price: "97",
      description: "Perfeito para começar",
      features: [
        "1 usuário",
        "500 contatos",
        "WhatsApp integrado",
        "Pipeline básico",
        "Suporte por email",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: "197",
      description: "Para equipes em crescimento",
      features: [
        "5 usuários",
        "5.000 contatos",
        "WhatsApp + Instagram",
        "IA Assistente",
        "Automações ilimitadas",
        "Suporte prioritário",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "497",
      description: "Para grandes operações",
      features: [
        "Usuários ilimitados",
        "Contatos ilimitados",
        "Todos os canais",
        "IA personalizada",
        "API completa",
        "Gerente de sucesso",
      ],
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "CEO, TechVendas",
      content: "O Primo CRM transformou nossa operação. Aumentamos as conversões em 300% em apenas 3 meses.",
      avatar: "CS",
    },
    {
      name: "Ana Paula",
      role: "Diretora Comercial, InovaCorp",
      content: "A integração com WhatsApp é perfeita. Nossa equipe economiza 4 horas por dia.",
      avatar: "AP",
    },
    {
      name: "Roberto Lima",
      role: "Founder, StartupX",
      content: "A IA do Primo responde melhor que muitos atendentes. Nossos clientes adoram.",
      avatar: "RL",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex h-9 w-9 items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-20 blur-sm" />
                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 4v16" className="text-white" stroke="white" />
                    <path d="M7 4h6a4 4 0 0 1 0 8H7" className="text-white" stroke="white" fill="none" />
                    <circle cx="17" cy="8" r="2" fill="white" stroke="none" opacity="0.6" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">Primo</span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">CRM</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Recursos</a>
              <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Preços</a>
              <a href="#testimonials" className="text-sm text-zinc-400 hover:text-white transition-colors">Depoimentos</a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Entrar
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/25"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-8">
              <Sparkles className="h-4 w-4" />
              <span>Novo: IA com GPT-5.2 integrada</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                Transforme conversas
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                em vendas
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              O CRM que conecta WhatsApp, Instagram e muito mais em uma plataforma 
              inteligente. Automatize atendimentos com IA e aumente suas conversões.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/auth/signup"
                className="group flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all hover:scale-105 shadow-2xl shadow-emerald-500/25"
              >
                Começar Grátis
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center gap-2 px-8 py-4 text-lg font-semibold border border-white/20 hover:border-white/40 rounded-xl transition-all hover:bg-white/5">
                <Play className="h-5 w-5" />
                Ver Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`transition-all duration-500 delay-${index * 100} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-zinc-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tudo que você precisa para{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                vender mais
              </span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Ferramentas poderosas para gerenciar leads, automatizar atendimentos e fechar mais negócios
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`group p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 cursor-pointer ${
                    activeFeature === index ? "border-emerald-500/50 bg-emerald-500/5 scale-105" : ""
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Feature Highlights */}
          <div className="mt-24 grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Dados Seguros</h4>
                <p className="text-sm text-zinc-400">Criptografia de ponta a ponta e backup automático</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Suporte 24/7</h4>
                <p className="text-sm text-zinc-400">Nossa equipe está sempre pronta para ajudar</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Relatórios Avançados</h4>
                <p className="text-sm text-zinc-400">Métricas em tempo real para decisões inteligentes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Como funciona
            </h2>
            <p className="text-xl text-zinc-400">Em 3 passos simples</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Conecte seus canais",
                description: "Integre WhatsApp, Instagram e outros canais em minutos",
                icon: Phone,
              },
              {
                step: "02",
                title: "Configure sua IA",
                description: "Treine o assistente com informações do seu negócio",
                icon: Bot,
              },
              {
                step: "03",
                title: "Comece a vender",
                description: "Gerencie leads, automatize respostas e feche negócios",
                icon: TrendingUp,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative">
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 right-0 w-full h-px bg-gradient-to-r from-emerald-500/50 to-transparent translate-x-1/2" />
                  )}
                  <div className="relative p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="text-6xl font-bold text-emerald-500/20 absolute top-4 right-4">
                      {item.step}
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6">
                      <Icon className="h-7 w-7 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-zinc-400">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Planos para{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                cada momento
              </span>
            </h2>
            <p className="text-xl text-zinc-400">Comece grátis. Escale conforme cresce.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? "border-emerald-500 bg-emerald-500/10 shadow-2xl shadow-emerald-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 rounded-full text-sm font-medium">
                    Mais Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                  <p className="text-zinc-400 text-sm">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold">R${plan.price}</span>
                  <span className="text-zinc-400">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block w-full py-3 text-center font-medium rounded-xl transition-all ${
                    plan.popular
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  Começar Agora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              O que nossos clientes{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                dizem
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-zinc-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-semibold text-emerald-400">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-zinc-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative p-12 md:p-16 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-purple-500/10 backdrop-blur-sm text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-purple-500/5" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Pronto para transformar suas vendas?
              </h2>
              <p className="text-xl text-zinc-400 mb-8">
                Junte-se a milhares de empresas que já usam o Primo CRM
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all hover:scale-105 shadow-2xl shadow-emerald-500/25"
              >
                Começar Grátis
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-zinc-500 text-sm mt-4">Sem cartão de crédito. Cancele quando quiser.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 4v16" stroke="white" />
                  <path d="M7 4h6a4 4 0 0 1 0 8H7" stroke="white" fill="none" />
                </svg>
              </div>
              <span className="font-bold">Primo CRM</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-400">
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Contato</a>
            </div>
            <div className="text-sm text-zinc-500">
              © 2026 Primo CRM. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
