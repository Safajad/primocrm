import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    
    // Fazer requisição para o servidor WhatsApp local
    const response = await fetch(`http://localhost:3001/session/${sessionId}/status`);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}
