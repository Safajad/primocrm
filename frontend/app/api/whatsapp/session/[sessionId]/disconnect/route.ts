import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    
    // Fazer requisição para o servidor WhatsApp local
    const response = await fetch(`http://localhost:3001/session/${sessionId}/disconnect`, {
      method: 'POST',
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao desconectar:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao desconectar' },
      { status: 500 }
    );
  }
}
