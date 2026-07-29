import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "FAQ — Dúvidas sobre recursos ao INSS",
  description:
    "Respostas às dúvidas mais comuns sobre recursos administrativos contra decisões do INSS.",
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "A Recurso Fácil é um site oficial do INSS ou do governo?",
    a: "Não. Somos uma plataforma privada e independente, sem qualquer vínculo com o INSS ou com o Governo Federal. O nome indica apenas a finalidade do serviço — gerar recursos administrativos contra decisões do INSS.",
  },
  {
    q: "Qual o prazo para recorrer de uma decisão do INSS?",
    a: "O prazo legal é de 30 dias corridos a contar da ciência da decisão, conforme art. 126 da Lei 8.213/91. É possível pedir restituição de prazo em casos de justificativa plausível.",
  },
  {
    q: "O recurso gerado substitui um advogado?",
    a: "Não. A plataforma entrega uma peça técnica fundamentada, mas sempre recomendamos revisão e, idealmente, acompanhamento por profissional do direito, especialmente em casos complexos.",
  },
  {
    q: "Posso anexar documentos ao recurso?",
    a: "Sim. Após criar o recurso, você pode anexar documentos na área do cliente (CNIS, laudos, comprovantes de vínculo, etc.). Os documentos ajudam a fortalecer a argumentação.",
  },
  {
    q: "Em quanto tempo recebo o recurso?",
    a: "Depende da opção escolhida na hora da compra: em até 24h se você abrir mão do prazo de arrependimento de 7 dias (art. 49 do CDC), ou em até 8 dias se preferir mantê-lo. De qualquer forma, fique atento ao prazo de 30 dias corridos que você tem para recorrer da decisão do INSS.",
  },
  {
    q: "Posso cancelar o pedido ou pedir reembolso?",
    a: "Pode. Enquanto o recurso não for entregue, você cancela e recebe o valor integral de volta. Depois de entregue, você tem a garantia de 7 dias corridos (contados do pagamento) para solicitar o reembolso integral. É tudo feito pela sua área do cliente, em 'Cancelamento e reembolso'.",
  },
  {
    q: "Como é feito o pagamento?",
    a: "O pagamento é único, por cartão de crédito, processado de forma segura pelo Stripe. Não há mensalidade nem cobrança recorrente.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Sim. Seguimos a LGPD — seus dados são criptografados em trânsito e em repouso, acessíveis apenas a você e à equipe autorizada. Você pode solicitar exclusão a qualquer momento.",
  },
  {
    q: "O recurso pode ser usado em qualquer benefício?",
    a: "Cobrimos os principais: aposentadoria (idade, tempo de contribuição, invalidez, especial), auxílio-doença, auxílio-acidente, BPC/LOAS, pensão por morte e salário-maternidade.",
  },
  {
    q: "Como falo com uma pessoa da equipe?",
    a: "Pelo e-mail contato@recursofacil.com — respondemos em até 24 horas úteis. A página de Contato tem mais detalhes e o que informar para agilizar seu atendimento.",
  },
  {
    q: "O recurso tem garantia de êxito?",
    a: "Nenhum recurso (humano ou automatizado) pode garantir êxito — a decisão depende do INSS e do CRPS. O que garantimos é a qualidade técnica da peça, com fundamentação legal pertinente.",
  },
];

export default function FAQPage() {
  return (
    <>
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
        <div className="mt-10 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
          {FAQ.map((item, i) => (
            <details key={i} className="group px-6 py-5 open:bg-ink-50/60">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-ink-900">
                {item.q}
                <span className="ml-4 text-brand-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-ink-700">{item.a}</p>
            </details>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
