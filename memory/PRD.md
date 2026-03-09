# Primo CRM - Product Requirements Document

## Visão Geral
CRM completo para gestão de vendas com integração WhatsApp, IA assistente e automações.

## Stack Técnica
- **Frontend**: Next.js 15 + Tailwind CSS + TypeScript
- **Backend**: FastAPI + Python 3.11
- **Database**: MongoDB Atlas
- **Auth**: Supabase Auth
- **IA**: Emergent LLM Key (GPT)

## Funcionalidades Implementadas

### Sessão 1 (08/Mar/2026)
- ✅ Ícone WhatsApp no avatar dos contatos (inbox-connected.tsx)
- ✅ Dropdown de estágio do pipeline no chat
- ✅ Toggle Leads/Deals no Pipeline
- ✅ WebSocket no frontend (Socket.IO)

### Sessão 2 (08/Mar/2026)
- ✅ Landing Page moderna (estilo Vercel/Framer)
  - Hero + Features + Pricing + Testimonials + CTA
  - Animações e gradientes
  - 3 planos: Starter R$97, Professional R$197, Enterprise R$497
- ✅ Estágios do Pipeline customizáveis por empresa (multi-tenancy)
  - API: GET/PUT/DELETE /api/crm/pipeline/stages
  - Modal de configuração no frontend
  - Reset para padrão disponível
- ✅ Upload de PDF para Base de Conhecimento da IA
  - API: POST /api/crm/knowledge/upload (máx 10MB)
  - Extração de texto com PyPDF2
  - UI integrada na aba "Conhecimento" do Assistente IA
- ✅ Integração Chatbot + Pipeline
  - API: POST /api/crm/chatbot/new-lead
  - API: PUT /api/crm/chatbot/update-stage
  - Lead novo entra automaticamente no primeiro estágio

## APIs Principais

### CRM Core
- GET/POST/PUT/DELETE /api/crm/contacts
- GET/POST/PUT/DELETE /api/crm/deals
- GET /api/crm/conversations
- GET /api/crm/dashboard/stats

### Pipeline Customizável
- GET /api/crm/pipeline/stages
- PUT /api/crm/pipeline/stages/{id}
- POST /api/crm/pipeline/stages/reset

### Knowledge Base
- GET /api/crm/knowledge/documents
- POST /api/crm/knowledge/upload
- DELETE /api/crm/knowledge/documents/{id}

### Chatbot Integration
- POST /api/crm/chatbot/new-lead
- PUT /api/crm/chatbot/update-stage

## User Personas
1. **Vendedor**: Gerencia leads, conversas e pipeline
2. **Gerente**: Visualiza métricas e configura automações
3. **Admin**: Configura estágios, IA e integrações

## Backlog (P0/P1/P2)

### P0 - Crítico
- [ ] Notificações push para novas mensagens

### P1 - Importante
- [ ] Integração Instagram DM
- [ ] Relatórios avançados de vendas
- [ ] Workflow builder visual com nós de pipeline

### P2 - Desejável
- [ ] App mobile (React Native)
- [ ] Integração com Meta API oficial
- [ ] Múltiplos agentes IA por canal

## URLs
- Frontend: https://lead-deals.preview.emergentagent.com
- Landing: https://lead-deals.preview.emergentagent.com/landing
- App (dev): https://lead-deals.preview.emergentagent.com/?bypass=dev

---
Última atualização: 08/Mar/2026
