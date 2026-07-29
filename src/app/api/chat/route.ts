import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { SUPPORT_EMAIL } from "@/lib/support";

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

const SYSTEM_PROMPT = `Você é a "Sofia", assistente virtual da **Recurso Fácil** — um SaaS brasileiro que produz recursos administrativos contra decisões do INSS com fundamentação jurídica técnica e validada (Lei 8.213/91, Decreto 3.048/99, súmulas do CRPS, jurisprudência do TNU/STJ).

# Sua missão
Tirar dúvidas de visitantes e clientes sobre o produto, guiar para a conversão (gerar recurso em /novo-recurso), e responder perguntas gerais sobre recursos do INSS — sem substituir consultoria jurídica personalizada.

# Informações essenciais do produto
- **O que entregamos:** recurso administrativo completo em PDF e Word (.docx), pronto para protocolo, com fundamentação legal e organização técnica do caso.
- **Preço:** ${PRICE_BRL} — pagamento único por recurso, sem mensalidade.
- **Tempo de entrega:** em até 24h para quem abre mão do prazo de arrependimento de 7 dias (art. 49 do CDC), ou em até 8 dias para quem prefere mantê-lo.
- **Como funciona:** (1) cliente responde formulário guiado em /novo-recurso, (2) paga online por cartão, (3) recebe o recurso pronto no dashboard e por email dentro do prazo escolhido.
- **Prazo legal para recorrer do INSS:** 30 dias corridos da ciência da decisão (art. 126 da Lei 8.213/91) — sempre reforce esse prazo, especialmente para quem escolher a entrega em 8 dias.
- **Tipos de negativa que atendemos:** falta de qualidade de segurado, não cumprimento de carência, ausência de incapacidade (perícia), renda familiar superior (BPC/LOAS), tempo de contribuição insuficiente, entre outros.
- **Benefícios cobertos:** auxílio-doença (incapacidade temporária), aposentadoria por invalidez, aposentadoria por idade/tempo de contribuição, BPC/LOAS, pensão por morte, salário-maternidade, auxílio-acidente.
- **Segurança:** tratamento de dados com base na LGPD, pagamento seguro e acesso protegido à área do cliente.
- **Cancelamento e reembolso:** garantia de 7 dias. Antes da entrega, cancelamento com reembolso integral; depois de entregue, reembolso em até 7 dias corridos do pagamento. Tudo pela área do cliente.
- **Suporte humano:** ${SUPPORT_EMAIL}, com resposta a dúvidas em até 48 horas úteis. ATENÇÃO: esse prazo é do atendimento por e-mail e NÃO se confunde com o prazo de entrega do recurso (24h ou 8 dias, conforme a escolha do cliente) — deixe a diferença clara se o assunto surgir. Sempre ofereça esse canal quando você não souber responder.
- **Páginas úteis:** /novo-recurso (gerar), /login, /cadastro, /dashboard (área do cliente), /calculadora, /guias, /tutorial, /contato, /faq, /termos, /privacidade, /lgpd.

# Guias disponíveis (use os links quando forem úteis à dúvida)
- /guias/inss-negou-meu-beneficio-o-que-fazer — visão geral de o que fazer após a negativa
- /guias/prazo-de-30-dias-para-recorrer — como contar o prazo e o que fazer se perdeu
- /guias/pericia-do-inss-negou-incapacidade — contestar conclusão da perícia
- /guias/como-se-preparar-para-a-pericia — o que levar e como relatar
- /guias/auxilio-doenca-negado — os 3 motivos mais comuns
- /guias/aposentadoria-por-invalidez-negada — incapacidade total e permanente
- /guias/auxilio-acidente-negado — sequela que reduz capacidade
- /guias/pensao-por-morte-negada — qualidade de segurado e dependência
- /guias/salario-maternidade-negado — regras por categoria de segurada
- /guias/aposentadoria-por-idade-negada — requisitos e regras de transição
- /guias/bpc-loas-negado-por-renda — cálculo da renda per capita
- /guias/qualidade-de-segurado-e-periodo-de-graca — proteção após parar de contribuir
- /guias/carencia-do-inss-o-que-e — número mínimo de contribuições e dispensas
- /guias/cnis-como-ler-e-corrigir — corrigir períodos faltantes
- /guias/documentos-que-fortalecem-seu-recurso — checklist por tipo de negativa
- /guias/como-protocolar-recurso-no-meu-inss — passo a passo do envio
- /guias/crps-junta-de-recursos-como-funciona — quem julga o recurso
- /guias/trabalhador-rural-como-comprovar — prova de atividade rural
- /guias/recurso-negado-e-agora — segunda instância e via judicial

# Estilo de resposta
- Português brasileiro, tom acolhedor, profissional e direto.
- Respostas curtas (2–5 frases) por padrão. Use listas quando fizer sentido.
- Markdown leve: **negrito** para destaques, listas com "-". Nada de títulos grandes.
- Quando fizer sentido, termine com um convite suave à ação e um link: [Gerar meu recurso](/novo-recurso), [Ver FAQ](/faq), [Entrar](/login).
- **Nunca invente jurisprudência, números de processo ou dados que você não saiba.** Se não souber, admita e ofereça o e-mail de suporte (${SUPPORT_EMAIL}) ou um guia relacionado. É melhor dizer "não sei" do que arriscar informação errada sobre direitos de alguém.
- **Nunca dê garantia de resultado.** Use expressões como "aumenta as chances", "pode favorecer".
- Lembre sempre que o serviço **não substitui consultoria jurídica personalizada**.

# Limites
- Se pedirem análise jurídica aprofundada de um caso específico → explique que você não faz análise individual e recomende gerar o recurso ou buscar advogado.
- Se pedirem algo fora do escopo (ex: receita de bolo, política) → redirecione com humor leve para o tema INSS.
- Se perguntarem sobre preço, prazo, como funciona → responda com clareza e confiança.
- Não peça dados pessoais sensíveis (CPF, senha, dados bancários).`;

/**
 * Fallback quando não há API key configurada (ou quando a chamada à IA falha).
 *
 * Cobre as dúvidas mais frequentes por palavra-chave. Quando não souber, admite
 * que não sabe e encaminha para os guias ou para o e-mail de suporte —
 * nunca inventa resposta jurídica.
 */
function fallbackReply(userMessage: string): string {
  // Remove acentos antes de comparar — muita gente escreve "pericia", "carencia",
  // "ate quando". Por isso os padrões abaixo são escritos sem acento.
  const q = userMessage
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  if (/(preco|valor|quanto custa|quanto e|caro)/.test(q)) {
    return `O recurso custa **${PRICE_BRL}** em pagamento único, sem mensalidade nem cobrança recorrente. [Gerar meu recurso](/novo-recurso)`;
  }
  if (/(recurso.*(negad|indeferid)|neg(ou|aram).*recurso|segunda inst|outro recurso|recorrer de novo|nova negativa)/.test(q)) {
    return `Sim, na maioria dos casos cabe novo recurso. Se a negativa veio da **Junta de Recursos** (primeira instância), ainda é possível recorrer às **Câmaras de Julgamento** (segunda instância), respeitando o prazo contado da ciência da decisão.\n\nEsgotada a via administrativa, resta o caminho judicial — que exige advogado, mas inclui perícia feita por profissional nomeado pelo juiz, independente do INSS.\n\nExpliquei isso em detalhe aqui: [Meu recurso também foi negado. E agora?](/guias/recurso-negado-e-agora)`;
  }
  if (/(pericia|perito|incapacidade|laudo)/.test(q)) {
    return `A perícia avalia se a doença impede você de exercer **sua atividade** — não basta comprovar o diagnóstico. Laudos que descrevem limitações concretas pesam muito mais que laudos genéricos.\n\nVeja: [A perícia disse que você está apto. E se não estiver?](/guias/pericia-do-inss-negou-incapacidade) e [Como se preparar para a perícia](/guias/como-se-preparar-para-a-pericia)`;
  }
  if (/(bpc|loas|renda|per capita|assistencial)/.test(q)) {
    return `O BPC é assistencial: não depende de contribuição, mas exige critério de renda familiar. A maioria das negativas vem do cálculo da renda per capita — e há erros frequentes na composição do grupo familiar.\n\nVeja: [BPC/LOAS negado por renda](/guias/bpc-loas-negado-por-renda)`;
  }
  if (/(qualidade de segurad|periodo de graca|parei de contribuir|desempregad)/.test(q)) {
    return `Parar de contribuir **não** faz você perder a proteção na hora — existe o *período de graça*, que pode ser bem maior que os 12 meses básicos se você tem longo histórico de contribuições ou comprova desemprego.\n\nVeja: [Perdi a qualidade de segurado?](/guias/qualidade-de-segurado-e-periodo-de-graca)`;
  }
  if (/(carencia|contribuicoes minimas|quantas contribui)/.test(q)) {
    return `Carência é o número mínimo de contribuições exigido — e varia conforme o benefício. Existem casos em que ela é **dispensada**, como acidentes e algumas doenças graves previstas em lei.\n\nVeja: [Carência do INSS: o que é e quando é dispensada](/guias/carencia-do-inss-o-que-e)`;
  }
  if (/(cnis|extrato|contribuicoes nao aparec|tempo nao conta|periodo faltando)/.test(q)) {
    return `O CNIS é a base de quase toda decisão do INSS — e é comum haver vínculos antigos faltando nele. Se um período seu não aparece, a negativa pode ser só um erro de registro, corrigível com documentos.\n\nVeja: [CNIS: como ler e corrigir períodos que faltam](/guias/cnis-como-ler-e-corrigir)`;
  }
  if (/(documento|anexar|comprovar|prova)/.test(q)) {
    return `Os documentos mudam conforme o motivo da negativa. Montei um checklist por situação aqui: [Quais documentos fortalecem seu recurso](/guias/documentos-que-fortalecem-seu-recurso)`;
  }
  // Precisa vir antes da regra de prazo de entrega: "quanto tempo tenho para recorrer"
  // é sobre o prazo legal do INSS, não sobre quando o recurso fica pronto.
  if (/(prazo|30 dias|perdi o prazo|atrasad|tempo.*(recorrer|entrar com)|recorrer.*tempo|ate quando|quando posso recorrer)/.test(q)) {
    return `São **30 dias corridos** a partir da ciência da decisão do INSS (art. 126 da Lei 8.213/91) — contam fins de semana e feriados.\n\nSe o prazo já passou, ainda há caminhos. Explico aqui: [Os 30 dias para recorrer](/guias/prazo-de-30-dias-para-recorrer)`;
  }
  if (/(como funciona|passo|passos|como gerar|como faco|como solicito)/.test(q)) {
    return `São 3 passos:\n- Preencher o formulário guiado em [/novo-recurso](/novo-recurso) — leva cerca de 3 minutos\n- Pagar online (cartão ou Pix)\n- Receber o recurso em PDF e Word\n\nPasso a passo completo: [/tutorial](/tutorial)`;
  }
  if (/(tempo|entrega|quando recebo|demora)/.test(q)) {
    return `Em até **24h** se você abrir mão do prazo de arrependimento de 7 dias, ou em até **8 dias** se preferir mantê-lo — você escolhe na hora da compra. Fique atento ao prazo de 30 dias que você tem para recorrer do INSS.`;
  }
  if (/(cancelar|reembolso|devolv|arrepend|garantia)/.test(q)) {
    return `Você tem **garantia de 7 dias**. Antes da entrega, pode cancelar e receber o valor integral. Depois de entregue, pode pedir reembolso em até 7 dias corridos do pagamento — tudo pela sua área do cliente, em "Cancelamento e reembolso".`;
  }
  if (/(advogado|substitui|preciso de um advogad)/.test(q)) {
    return `Você **não precisa** de advogado para o recurso administrativo — a lei permite que o próprio segurado apresente. Nosso serviço entrega a peça técnica pronta, mas **não substitui** consultoria jurídica personalizada, e recomendamos revisão antes do protocolo.`;
  }
  if (/(seguro|lgpd|dados|privacidade)/.test(q)) {
    return `Seguimos a **LGPD**. Seus dados são usados apenas para gerar e disponibilizar seu recurso, em ambiente autenticado. Veja a [Política de Privacidade](/privacidade).`;
  }
  if (/(oficial|governo|vinculo|inss de verdade|e do inss)/.test(q)) {
    return `Não somos o INSS nem temos vínculo com o Governo Federal — somos uma **plataforma privada e independente**. O nome indica apenas a finalidade do serviço.`;
  }
  if (/(contato|fal(ar|o|amos|e)\s+com|atendimento|suporte|humano|voces|equipe|telefone|e-?mail de voc)/.test(q)) {
    return `Claro! Você pode falar com a nossa equipe pelo e-mail **${SUPPORT_EMAIL}** — respondemos dúvidas em até 48 horas úteis (esse prazo é do atendimento, não da entrega do seu recurso). Veja também a página de [Contato](/contato).`;
  }

  return `Não consegui entender bem sua dúvida — e prefiro não arriscar uma resposta errada sobre um assunto que afeta seus direitos.\n\nAlgumas opções:\n- Consultar nossos [guias sobre o INSS](/guias), que cobrem as dúvidas mais comuns\n- Ver as [perguntas frequentes](/faq)\n- Falar com nossa equipe: **${SUPPORT_EMAIL}** (respondemos dúvidas em até 48 horas úteis)\n\nSe preferir, reformule a pergunta que eu tento de novo.`;
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
    // Se a IA falhar (cota, indisponibilidade, chave inválida), ainda respondemos
    // algo útil em vez de mostrar erro ao cliente.
    const { logger } = await import("@/lib/logger");
    logger.error("chat.POST falhou", err);
    try {
      const body = BodySchema.parse(await req.clone().json());
      const last = body.messages[body.messages.length - 1];
      if (last.role === "user") {
        return NextResponse.json({ reply: fallbackReply(last.content), mode: "fallback" });
      }
    } catch {
      // corpo inválido — cai na resposta genérica abaixo
    }
    return NextResponse.json(
      {
        reply: `Tive um problema técnico agora. Você pode consultar nossos [guias](/guias) ou falar com a equipe: **${SUPPORT_EMAIL}**.`,
        mode: "fallback",
      },
    );
  }
}
