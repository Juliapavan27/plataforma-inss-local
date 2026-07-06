import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(30),
});

const PRICE_CENTS = Number(process.env.PRICE_RECURSO_CENTS ?? 29900);
const PRICE_BRL = (PRICE_CENTS / 100).toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const SYSTEM_PROMPT = `Você é a "Sofia", assistente virtual da **Plataforma INSS** — um SaaS brasileiro que gera recursos administrativos contra decisões do INSS usando inteligência artificial e base jurídica validada (Lei 8.213/91, Decreto 3.048/99, súmulas do CRPS, jurisprudência do TNU/STJ).

# Sua missão
Tirar dúvidas de visitantes e clientes sobre o produto, guiar para a conversão (gerar recurso em /novo-recurso), e responder perguntas gerais sobre recursos do INSS — sem substituir consultoria jurídica personalizada.

# Informações essenciais do produto
- **O que entregamos:** recurso administrativo completo em PDF e Word (.docx), pronto para protocolo, com fundamentação legal e organização técnica do caso.
- **Preço:** ${PRICE_BRL} — pagamento único por recurso, sem mensalidade.
- **Tempo de entrega:** cerca de 3 minutos após a geração começar.
- **Como funciona:** (1) cliente responde formulário guiado em /novo-recurso, (2) paga online por cartão, (3) recebe o recurso pronto no dashboard e por email.
- **Prazo legal para recorrer do INSS:** 30 dias corridos da ciência da decisão (art. 126 da Lei 8.213/91).
- **Tipos de negativa que atendemos:** falta de qualidade de segurado, não cumprimento de carência, ausência de incapacidade (perícia), renda familiar superior (BPC/LOAS), tempo de contribuição insuficiente, entre outros.
- **Benefícios cobertos:** auxílio-doença (incapacidade temporária), aposentadoria por invalidez, aposentadoria por idade/tempo de contribuição, BPC/LOAS, pensão por morte, salário-maternidade, auxílio-acidente.
- **Segurança:** tratamento de dados com base na LGPD, pagamento seguro via Stripe e acesso protegido à área do cliente.
- **Páginas úteis:** /novo-recurso (gerar), /login, /cadastro, /dashboard (área do cliente), /blog, /faq, /termos, /privacidade, /lgpd.

# Estilo de resposta
- Português brasileiro, tom acolhedor, profissional e direto.
- Respostas curtas (2–5 frases) por padrão. Use listas quando fizer sentido.
- Markdown leve: **negrito** para destaques, listas com "-". Nada de títulos grandes.
- Quando fizer sentido, termine com um convite suave à ação e um link: [Gerar meu recurso](/novo-recurso), [Ver FAQ](/faq), [Entrar](/login).
- **Nunca invente jurisprudência, números de processo ou dados que você não saiba.** Se não souber, diga que não sabe e oriente a consultar um advogado ou a página de FAQ.
- **Nunca dê garantia de resultado.** Use expressões como "aumenta as chances", "pode favorecer".
- Lembre sempre que o serviço **não substitui consultoria jurídica personalizada**.

# Limites
- Se pedirem análise jurídica aprofundada de um caso específico → explique que você não faz análise individual e recomende gerar o recurso ou buscar advogado.
- Se pedirem algo fora do escopo (ex: receita de bolo, política) → redirecione com humor leve para o tema INSS.
- Se perguntarem sobre preço, prazo, como funciona → responda com clareza e confiança.
- Não peça dados pessoais sensíveis (CPF, senha, dados bancários).`;

/** Fallback quando não há API key configurada. */
function fallbackReply(userMessage: string): string {
  const q = userMessage.toLowerCase();
  if (/(preço|preco|valor|quanto|custa)/.test(q)) {
    return `O recurso custa **${PRICE_BRL}** em pagamento único, sem mensalidade. [Gerar meu recurso](/novo-recurso)`;
  }
  if (/(prazo|quanto tempo|30 dias)/.test(q)) {
    return `Você tem **30 dias corridos** a partir da ciência da decisão do INSS para recorrer (art. 126 da Lei 8.213/91). Depois disso, a decisão se torna definitiva.`;
  }
  if (/(como funciona|passo|passos|como gerar)/.test(q)) {
    return `São 3 passos:\n- Preencha o formulário guiado em [/novo-recurso](/novo-recurso)\n- Pague online (cartão)\n- Receba o recurso em PDF e Word em ~3 minutos`;
  }
  if (/(tempo|entrega|quando)/.test(q)) {
    return `A peça fica pronta em cerca de **3 minutos** após a geração começar. Você recebe no dashboard e por email.`;
  }
  if (/(advogado|substitui)/.test(q)) {
    return `Nosso serviço **não substitui** consultoria jurídica personalizada — ele entrega uma peça técnica pronta, mas recomendamos revisão antes do protocolo.`;
  }
  if (/(seguro|lgpd|dados)/.test(q)) {
    return `Seguimos práticas de proteção de dados alinhadas à **LGPD**. Seus dados são usados apenas para gerar e disponibilizar seu recurso. Veja nossa [Política de Privacidade](/privacidade).`;
  }
  return `Olá! 👋 Sou a Sofia, assistente da Plataforma INSS.\n\nPosso te ajudar com dúvidas sobre:\n- Como funciona a geração de recursos\n- Preço e prazo de entrega\n- Tipos de negativa que atendemos\n\nOu vá direto para [gerar seu recurso](/novo-recurso).`;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`chat:${ip}`, { max: 20, windowMs: 5 * 60_000, blockMs: 15 * 60_000 });
    if (!rl.ok) return tooManyRequests(rl);

    const body = BodySchema.parse(await req.json());
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Fallback quando não há API key — responde baseado na última mensagem
    if (!apiKey) {
      const last = body.messages[body.messages.length - 1];
      const reply =
        last.role === "user"
          ? fallbackReply(last.content)
          : "Sobre o que você gostaria de conversar?";
      return NextResponse.json({ reply, mode: "fallback" });
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      temperature: 0.5,
      system: SYSTEM_PROMPT,
      messages: body.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const reply = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("")
      .trim();

    return NextResponse.json({ reply, mode: "ai" });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Erro ao processar mensagem",
      },
      { status: 400 },
    );
  }
}
