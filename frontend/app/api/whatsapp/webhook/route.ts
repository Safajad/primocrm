import { NextRequest, NextResponse } from 'next/server';

/**
 * WhatsApp Business API Official
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

// Rota para webhook verification (GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  // Verificar token (configure no .env)
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'primocrm_webhook_verify_2026';
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified!');
    return new Response(challenge, { status: 200 });
  }
  
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// Rota para receber mensagens (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📩 Webhook recebido:', JSON.stringify(body, null, 2));
    
    // Processar mensagens recebidas
    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from; // Número do remetente
      const messageBody = message.text?.body || '';
      const messageType = message.type; // text, image, audio, etc
      
      console.log(`💬 Mensagem de ${from}: ${messageBody}`);
      
      // TODO: Salvar mensagem no banco de dados
      // TODO: Processar com workflow/chatbot
      // TODO: Responder automaticamente se configurado
      
      // Aqui você pode:
      // 1. Salvar no Supabase
      // 2. Processar com IA
      // 3. Executar workflow
      // 4. Notificar usuário
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Erro no webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
