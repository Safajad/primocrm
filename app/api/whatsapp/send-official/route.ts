import { NextRequest, NextResponse } from 'next/server';

/**
 * Enviar mensagem via WhatsApp Business API Official
 */
export async function POST(request: NextRequest) {
  try {
    const { to, message, type = 'text', mediaUrl } = await request.json();
    
    const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      return NextResponse.json(
        { error: 'WhatsApp API não configurada. Configure WHATSAPP_API_TOKEN e WHATSAPP_PHONE_NUMBER_ID' },
        { status: 400 }
      );
    }
    
    // Preparar payload baseado no tipo
    let messageData: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
    };
    
    if (type === 'text') {
      messageData.type = 'text';
      messageData.text = { body: message };
    } else if (type === 'image') {
      messageData.type = 'image';
      messageData.image = { link: mediaUrl, caption: message };
    } else if (type === 'video') {
      messageData.type = 'video';
      messageData.video = { link: mediaUrl, caption: message };
    } else if (type === 'audio') {
      messageData.type = 'audio';
      messageData.audio = { link: mediaUrl };
    } else if (type === 'document') {
      messageData.type = 'document';
      messageData.document = { link: mediaUrl, filename: message };
    }
    
    // Enviar para WhatsApp API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erro WhatsApp API:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Erro ao enviar mensagem' },
        { status: response.status }
      );
    }
    
    console.log('✅ Mensagem enviada via WhatsApp API:', data);
    
    return NextResponse.json({
      success: true,
      messageId: data.messages?.[0]?.id,
      data,
    });
  } catch (error: any) {
    console.error('❌ Erro ao enviar mensagem:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar mensagem' },
      { status: 500 }
    );
  }
}
