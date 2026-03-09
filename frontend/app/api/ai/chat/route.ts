import { NextRequest, NextResponse } from "next/server";

// Usando a chave OpenAI diretamente pois é Next.js
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, systemPrompt, model, temperature, contactInfo, sessionId } = body;

    // Pegar a chave da API do body ou usar a do ambiente
    const apiKey = body.apiKey || OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key não configurada" },
        { status: 400 }
      );
    }

    // Mapear modelos para os nomes corretos da OpenAI
    const modelMap: Record<string, string> = {
      "gpt-3.5-turbo": "gpt-3.5-turbo",
      "gpt-4": "gpt-4",
      "gpt-4-turbo": "gpt-4-turbo",
      "openai/gpt-4o-mini": "gpt-4o-mini",
      "openai/gpt-4o": "gpt-4o",
      "openai/gpt-4-turbo": "gpt-4-turbo",
    };

    const openaiModel = modelMap[model] || "gpt-3.5-turbo";

    // Construir o contexto com informações do contato se disponíveis
    let contextMessage = systemPrompt || "Você é um assistente prestativo do Primo CRM.";
    
    if (contactInfo) {
      contextMessage += `\n\nInformações do contato atual:
- Nome: ${contactInfo.name || "Não informado"}
- Email: ${contactInfo.email || "Não informado"}
- Telefone: ${contactInfo.phone || "Não informado"}
- Empresa: ${contactInfo.company || "Não informado"}
- Tags: ${contactInfo.tags?.join(", ") || "Nenhuma"}
- Notas: ${contactInfo.notes || "Nenhuma"}

Use essas informações para personalizar suas respostas quando relevante.`;
    }

    // Formatar mensagens para a API OpenAI
    const formattedMessages = [
      { role: "system", content: contextMessage },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: typeof msg.content === "string" 
          ? msg.content 
          : msg.parts?.find((p: any) => p.type === "text")?.text || msg.content,
      })),
    ];

    // Chamar a API da OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: openaiModel,
        messages: formattedMessages,
        temperature: temperature || 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      return NextResponse.json(
        { error: errorData.error?.message || "Erro na API OpenAI" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || "";

    // Retornar no formato esperado pelo AI SDK
    return NextResponse.json({
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: assistantMessage,
      parts: [{ type: "text", text: assistantMessage }],
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Stream endpoint para respostas em tempo real
export async function GET(req: NextRequest) {
  return NextResponse.json({ status: "AI Chat API ready" });
}
