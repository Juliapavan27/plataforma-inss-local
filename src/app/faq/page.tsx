import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { SUPPORT_EMAIL, SUPPORT_SLA_HOURS } from "@/lib/support";
import { Footer } from "@/components/landing/footer";
import { PRICE_PIX_CENTS, PRICE_CARD_CENTS } from "@/lib/pricing";
import { formatCurrencyBRL } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { faqSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata = {
  title: "FAQ — Dúvidas sobre recursos ao INSS",
  description:
    "Posso recorrer sozinho? Perdi o prazo, e agora? Recebo atrasados? Mais de 30 respostas sobre recursos contra decisões do INSS.",
};

/**
 * Perguntas agrupadas por tema.
 *
 * Todas ficam VISÍVEIS nesta página. Não foram criadas páginas separadas por
 * pergunta de propósito: página fina em massa é o que o sistema de conteúdo
 * útil do Google derruba, e em tema YMYL a punição é mais dura. Uma página
 * densa e completa rende mais que trezentas rasas.
 */
const FAQ: { q: string; a: string; grupo: string }[] = [
  {
    q: "A Recurso Fácil é um site oficial do INSS ou do governo?",
    a: "Não. Somos uma plataforma privada e independente, sem qualquer vínculo com o INSS ou com o Governo Federal. O nome indica apenas a finalidade do serviço — gerar recursos administrativos contra decisões do INSS.",
     grupo: "Sobre a plataforma",
  },
  {
    q: "Qual o prazo para recorrer de uma decisão do INSS?",
    a: "O prazo legal é de 30 dias corridos a contar da ciência da decisão, conforme art. 126 da Lei 8.213/91. É possível pedir restituição de prazo em casos de justificativa plausível.",
     grupo: "Sobre a plataforma",
  },
  {
    q: "O recurso gerado substitui um advogado?",
    a: "Não. A plataforma entrega uma peça técnica fundamentada, mas sempre recomendamos revisão e, idealmente, acompanhamento por profissional do direito, especialmente em casos complexos.",
     grupo: "Sobre a plataforma",
  },
  {
    q: "Posso anexar documentos ao recurso?",
    a: "Sim. Após criar o recurso, você pode anexar documentos na área do cliente (CNIS, laudos, comprovantes de vínculo, etc.). Os documentos ajudam a fortalecer a argumentação.",
     grupo: "Sobre a plataforma",
  },
  {
    q: "Em quanto tempo recebo o recurso?",
    a: "Depende da opção escolhida na hora da compra: em até 24h se você abrir mão do prazo de arrependimento de 7 dias (art. 49 do CDC), ou em até 8 dias se preferir mantê-lo. De qualquer forma, fique atento ao prazo de 30 dias corridos que você tem para recorrer da decisão do INSS.",
     grupo: "Sobre a plataforma",
  },
  {
    q: "Posso cancelar o pedido ou pedir reembolso?",
    a: "Pode. Enquanto o recurso não for entregue, você cancela e recebe o valor integral de volta. Depois de entregue, você tem a garantia de 7 dias corridos (contados do pagamento) para solicitar o reembolso integral. É tudo feito pela sua área do cliente, em 'Cancelamento e reembolso'.",
     grupo: "Sobre a plataforma",
  },
  {
    q: "Como é feito o pagamento? Por que o Pix é mais barato?",
    a: `O pagamento é único e acontece dentro do nosso site, processado pelo Mercado Pago. No Pix o recurso sai por ${formatCurrencyBRL(PRICE_PIX_CENTS)}; no cartão à vista, por ${formatCurrencyBRL(PRICE_CARD_CENTS)}, com parcelamento em até 12x disponível. O Pix é mais barato porque tem custo de processamento menor, e cobrar preço diferente por meio de pagamento é permitido pela Lei 13.455/2017. Não há mensalidade nem cobrança recorrente.`,
    grupo: "Sobre a plataforma",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Sim. Seguimos a LGPD — seus dados são criptografados em trânsito e em repouso, acessíveis apenas a você e à equipe autorizada. Você pode solicitar exclusão a qualquer momento.",
     grupo: "Sobre a plataforma",
  },
  {
    q: "O recurso pode ser usado em qualquer benefício?",
    a: "Cobrimos os principais: aposentadoria (idade, tempo de contribuição, invalidez, especial), auxílio-doença, auxílio-acidente, BPC/LOAS, pensão por morte e salário-maternidade.",
     grupo: "Sobre a plataforma",
  },
  {
    q: "Como falo com uma pessoa da equipe?",
    a: "Pelo e-mail contato@recursofacil.com. Respondemos dúvidas enviadas por e-mail em até 48 horas úteis — esse prazo é do atendimento e não se confunde com o prazo de entrega do seu recurso, que é o que você escolheu na compra (24 horas ou 8 dias).",
     grupo: "Sobre a plataforma",
  },
  {
    q: "O recurso tem garantia de êxito?",
    a: "Nenhum recurso (humano ou automatizado) pode garantir êxito — a decisão depende do INSS e do CRPS. O que garantimos é a qualidade técnica da peça, com fundamentação legal pertinente.",
     grupo: "Sobre a plataforma",
  },
  {
    q: "Meu benefício foi negado. Posso recorrer?",
    a: "Sim. Todo indeferimento do INSS comporta recurso administrativo à Junta de Recursos do CRPS, sem custo de protocolo e sem exigência de advogado. O recurso é julgado por um colegiado diferente de quem negou.",
    grupo: "Recorrer do INSS",
  },
  {
    q: "Posso recorrer sozinho, sem advogado?",
    a: "Pode. O recurso administrativo é feito pelo próprio segurado no Meu INSS. Advogado só é obrigatório na via judicial. O que costuma faltar não é a permissão, e sim a peça bem fundamentada.",
    grupo: "Recorrer do INSS",
  },
  {
    q: "Posso recorrer pela internet?",
    a: "Sim. O protocolo é feito no Meu INSS, em “Recorrer de decisão”, pelo site ou pelo aplicativo. Não é preciso ir a uma agência.",
    grupo: "Recorrer do INSS",
  },
  {
    q: "Recorrer pode fazer eu perder algum benefício que já recebo?",
    a: "Não. Apresentar recurso administrativo não cancela, reduz nem suspende nenhum benefício em manutenção, e não impede um novo requerimento.",
    grupo: "Recorrer do INSS",
  },
  {
    q: "Quantas vezes posso recorrer?",
    a: "Da decisão do INSS cabe recurso à Junta de Recursos (primeira instância). Se a Junta mantiver a negativa, cabe recurso às Câmaras de Julgamento (segunda instância). Esgotada a via administrativa, resta o caminho judicial.",
    grupo: "Recorrer do INSS",
  },
  {
    q: "Perdi o prazo de 30 dias. Ainda posso fazer algo?",
    a: "Sim. É possível apresentar novo requerimento ao INSS, e a via judicial continua aberta. Confira também a data de ciência na carta: ela costuma ser diferente da data da decisão e pode significar que o prazo ainda está aberto.",
    grupo: "Recorrer do INSS",
  },
  {
    q: "O INSS pode negar o recurso também?",
    a: "Pode. Nenhum recurso tem resultado garantido. Se a Junta mantiver a negativa, ainda cabe recurso às Câmaras de Julgamento e, depois, a via judicial.",
    grupo: "Recorrer do INSS",
  },
  {
    q: "Quanto tempo demora o julgamento do recurso?",
    a: "Não há prazo fixo, e o tempo varia conforme a Junta e o volume de processos. O acompanhamento é feito pelo próprio Meu INSS.",
    grupo: "Recorrer do INSS",
  },
  {
    q: "O recurso é gratuito?",
    a: "O protocolo no Meu INSS é gratuito, e sempre será. O que se contrata aqui é a elaboração da peça, não o protocolo.",
    grupo: "Recorrer do INSS",
  },
  {
    q: "Vou receber os valores atrasados se ganhar?",
    a: "Em regra, havendo concessão, os valores retroagem à data do requerimento. O valor efetivo depende da data de início fixada e da situação de cada caso — não é possível prometer número.",
    grupo: "Recorrer do INSS",
  },
  {
    q: "Quanto tempo leva para eu receber o recurso?",
    a: "Em até 24 horas para quem abre mão do prazo de arrependimento de 7 dias (art. 49 do CDC), ou em até 8 dias para quem prefere mantê-lo. Fique atento ao seu prazo de 30 dias ao escolher.",
    grupo: "Sobre a plataforma",
  },
  {
    q: "O recurso vem pronto para protocolar?",
    a: "Vem em PDF e Word, estruturado e fundamentado, para você revisar e protocolar no Meu INSS. O Word permite ajustar qualquer trecho antes de enviar.",
    grupo: "Sobre a plataforma",
  },
  {
    q: "Vocês protocolam o recurso por mim?",
    a: "Não. O protocolo é feito por você, no Meu INSS, e é gratuito. Entregamos a peça pronta e o passo a passo do protocolo.",
    grupo: "Sobre a plataforma",
  },
  {
    q: "Vocês garantem que eu vou ganhar?",
    a: "Não, e desconfie de quem garantir. Nenhum profissional pode assegurar resultado em processo administrativo ou judicial. O que entregamos é uma peça tecnicamente fundamentada.",
    grupo: "Sobre a plataforma",
  },
  {
    q: "Preciso criar conta para comprar?",
    a: "Não. Você pode concluir o pedido sem cadastro; a conta é criada junto e você recebe um link para definir a senha quando quiser.",
    grupo: "Sobre a plataforma",
  },
  {
    q: "Como acompanho meu pedido?",
    a: "Pelo link enviado no e-mail de confirmação, e pela área do cliente depois de definir sua senha.",
    grupo: "Sobre a plataforma",
  },
  {
    q: "Quais documentos preciso ter em mãos?",
    a: "No mínimo a carta de indeferimento e o extrato do CNIS. Dependendo do motivo da negativa entram laudos médicos, carteira de trabalho, comprovantes de renda ou documentos de atividade rural.",
    grupo: "Documentos e informações",
  },
  {
    q: "Não tenho a carta de indeferimento. E agora?",
    a: "Ela pode ser baixada no Meu INSS, na consulta do requerimento. É o documento mais importante, porque traz o motivo exato que o recurso precisa responder.",
    grupo: "Documentos e informações",
  },
  {
    q: "O que é o CNIS e por que ele importa?",
    a: "É o Cadastro Nacional de Informações Sociais, o registro de todos os seus vínculos e contribuições. É a partir dele que o INSS conta carência e qualidade de segurado — e erros nesse registro são causa frequente de negativa.",
    grupo: "Documentos e informações",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Sim. Os dados são usados apenas para elaborar seu recurso, com tratamento conforme a LGPD, e não são vendidos nem compartilhados para fins comerciais.",
    grupo: "Documentos e informações",
  },
];

export default function FAQPage() {
  // Ordem fixa, da dúvida mais urgente para a menos: quem chega aqui quer
  // saber se pode recorrer, não sobre a plataforma.
  const ORDEM = ["Recorrer do INSS", "Documentos e informações", "Sobre a plataforma"];
  const grupos = ORDEM.filter((g) => FAQ.some((f) => f.grupo === g));

  return (
    <>
      {/* As perguntas e respostas marcadas aqui são exatamente as visíveis na
          página — FAQ declarada mas escondida é penalizada pelo Google. */}
      <JsonLd
        data={[
          faqSchema(FAQ.map((f) => ({ pergunta: f.q, resposta: f.a }))),
          breadcrumbSchema([
            { nome: "Início", path: "/" },
            { nome: "Perguntas frequentes", path: "/faq" },
          ]),
        ]}
      />
      <Navbar />
      <main className="container max-w-3xl py-16">
        <div className="text-center">
          <span className="chip">Dúvidas frequentes</span>
          <h1 className="mt-4 font-display text-4xl font-bold text-ink-950">
            Perguntas frequentes
          </h1>
          <p className="mt-3 text-ink-600">
            Tudo que você precisa saber antes de gerar seu recurso.
          </p>
        </div>
        {/* Agrupado por tema: com mais de 30 perguntas, uma lista corrida vira
            parede de texto e a pessoa desiste antes de achar a dela. */}
        {grupos.map((grupo) => (
          <section key={grupo} className="mt-12">
            <h2 className="font-display text-xl font-semibold text-ink-950">{grupo}</h2>
            <div className="mt-4 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
              {FAQ.filter((f) => f.grupo === grupo).map((item, i) => (
                <details key={i} className="group px-6 py-5 open:bg-ink-50/60">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-ink-900">
                    {item.q}
                    <span className="text-brand-600 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-700">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-14 rounded-2xl border border-ink-200/70 bg-white p-6 text-center">
          <p className="font-semibold text-ink-950">Não achou sua dúvida?</p>
          <p className="mt-2 text-sm text-ink-600">
            Escreva para {SUPPORT_EMAIL} — respondemos em até {SUPPORT_SLA_HOURS}h.
          </p>
          <Link href="/posso-recorrer" className="btn-primary mt-5 px-6 py-3">
            Descobrir se posso recorrer
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
