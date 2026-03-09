// WhatsApp Web.js - API não oficial (sem custos)
// Esta integração usa whatsapp-web.js para conectar via QR Code

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  isFromMe: boolean;
  contactName?: string;
  profilePicUrl?: string;
}

export interface WhatsAppContact {
  id: string;
  name: string;
  number: string;
  profilePicUrl?: string;
  isGroup: boolean;
}

export interface WhatsAppSession {
  id: string;
  status: 'disconnected' | 'connecting' | 'qr_code' | 'connected';
  qrCode?: string;
  connectedAt?: Date;
  phoneNumber?: string;
}

// API endpoints para o servidor WhatsApp (rodando em Node.js separado ou serverless)
const WHATSAPP_API_URL = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || 'http://localhost:3001';

export class WhatsAppClient {
  private sessionId: string;
  private apiUrl: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.apiUrl = WHATSAPP_API_URL;
  }

  // Iniciar sessão e obter QR Code
  async startSession(): Promise<WhatsAppSession> {
    const response = await fetch(`${this.apiUrl}/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: this.sessionId }),
    });
    return response.json();
  }

  // Verificar status da sessão
  async getStatus(): Promise<WhatsAppSession> {
    const response = await fetch(`${this.apiUrl}/session/${this.sessionId}/status`);
    return response.json();
  }

  // Obter QR Code para conexão
  async getQRCode(): Promise<{ qrCode: string } | null> {
    const response = await fetch(`${this.apiUrl}/session/${this.sessionId}/qr`);
    if (!response.ok) return null;
    return response.json();
  }

  // Enviar mensagem de texto
  async sendMessage(to: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    const response = await fetch(`${this.apiUrl}/message/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        to: this.formatPhoneNumber(to),
        message,
      }),
    });
    return response.json();
  }

  // Enviar mensagem com mídia
  async sendMedia(to: string, mediaUrl: string, caption?: string): Promise<{ success: boolean; messageId?: string }> {
    const response = await fetch(`${this.apiUrl}/message/send-media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        to: this.formatPhoneNumber(to),
        mediaUrl,
        caption,
      }),
    });
    return response.json();
  }

  // Obter mensagens de um chat
  async getMessages(chatId: string, limit = 50): Promise<WhatsAppMessage[]> {
    const response = await fetch(
      `${this.apiUrl}/chat/${this.sessionId}/${chatId}/messages?limit=${limit}`
    );
    return response.json();
  }

  // Obter lista de contatos
  async getContacts(): Promise<WhatsAppContact[]> {
    const response = await fetch(`${this.apiUrl}/contacts/${this.sessionId}`);
    return response.json();
  }

  // Obter chats recentes
  async getChats(): Promise<Array<{ id: string; name: string; lastMessage: string; timestamp: Date; unreadCount: number }>> {
    const response = await fetch(`${this.apiUrl}/chats/${this.sessionId}`);
    return response.json();
  }

  // Desconectar sessão
  async disconnect(): Promise<void> {
    await fetch(`${this.apiUrl}/session/${this.sessionId}/disconnect`, {
      method: 'POST',
    });
  }

  // Formatar número de telefone para o formato do WhatsApp
  private formatPhoneNumber(phone: string): string {
    // Remove caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Se começar com 0, remove
    const withoutZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
    
    // Se não tiver código do país, adiciona 55 (Brasil)
    if (withoutZero.length <= 11) {
      return `55${withoutZero}@c.us`;
    }
    
    return `${withoutZero}@c.us`;
  }
}

// Singleton para gerenciar múltiplas sessões
class WhatsAppManager {
  private sessions: Map<string, WhatsAppClient> = new Map();

  getClient(sessionId: string): WhatsAppClient {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new WhatsAppClient(sessionId));
    }
    return this.sessions.get(sessionId)!;
  }

  removeClient(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}

export const whatsappManager = new WhatsAppManager();
