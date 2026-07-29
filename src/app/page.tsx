import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Gauge,
  Clock,
  Scale,
  BookOpen,
  Lock,
  Award,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { formatCurrencyBRL } from "@/lib/utils";

const PRICE = Number(process.env.PRICE_RECURSO_CENTS ?? 29900);

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <Hero />
        <TrustBar />
        <Stats />
        <HowItWorks />
        <Mission />
        <SamplePreview />
        <Benefits />
        <Comparison />
        <Differentials />
        <Pricing />
        <TrustAndCompliance />
        <FAQTeaser />
        <FinalCTA />
      </main>
      <Footer />
      <StickyMobileCTA />
      <WhatsAppFloat />
    </>
  );
}

/* ======================================================================
   HERO — dois blocos: narrativa à esquerda, prova visual à direita
   ====================================================================== */
function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-10">
      {/* background mesh */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 -top-40 h-[600px] bg-radial-brand" />
        <div className="absolute -left-40 top-40 h-[420px] w-[420px] rounded-full bg-gold-200/40 blur-3xl" />
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-brand-200/50 blur-3xl" />
        <div className="absolute inset-0 bg-grid mask-fade-b opacity-60" />
      </div>

      <div className="container grid gap-14 py-20 md:grid-cols-12 md:gap-10 md:py-28 lg:py-32">
        <div className="md:col-span-7">
          <span className="chip-brand animate-fade-up bg-red-50 text-red-700 ring-red-200">
            <Clock className="h-3.5 w-3.5" /> Prazo de 30 dias para recorrer
          </span>

          <h1 className="mt-6 font-display text-display-lg font-semibold text-balance text-ink-950 animate-fade-up [animation-delay:80ms]">
            O INSS{" "}
            <span className="italic text-gradient-brand">negou seu benefício?</span>
          </h1>

          <p className="mt-6 max-w-xl text-xl leading-relaxed text-ink-700 text-pretty animate-fade-up [animation-delay:160ms]">
            Descreva o que aconteceu, anexe seus documentos e receba um recurso administrativo estruturado para revisar e protocolar no Meu INSS.
          </p>

          <div className="mt-9 animate-fade-up [animation-delay:240ms]">
            <Link href="/novo-recurso" className="btn-primary px-8 py-4 text-base">
              Quero gerar meu recurso agora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-600 animate-fade-up [animation-delay:320ms]">
            <span className="flex items-center gap-2 font-medium text-success-600">
              <ShieldCheck className="h-4 w-4" />
              Garantia de 7 dias
            </span>
            <span className="hidden h-4 w-px bg-ink-200 sm:block" />
            <span className="font-medium text-ink-700">Pagamento único</span>
            <span className="hidden h-4 w-px bg-ink-200 sm:block" />
            <span className="font-medium text-ink-700">PDF + Word para revisar antes de enviar</span>
          </div>
        </div>

        <div className="relative md:col-span-5">
          <HeroMock />
        </div>
      </div>
    </section>
  );
}

function HeroMock() {
  return (
    <div className="relative">
      {/* halo */}
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-brand-500/30 via-brand-200/0 to-gold-300/30 blur-2xl" />

      {/* Card principal — clean e focado */}
      <div className="relative rounded-3xl border border-ink-200/70 bg-white/95 p-8 shadow-lift backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 ring-1 ring-brand-200/60">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500">
                Diagnóstico do caso
              </p>
              <p className="text-sm font-semibold text-ink-950">
                Auxílio-doença
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-[11px] font-semibold text-success-600">
            <span className="h-1.5 w-1.5 rounded-full bg-success-600" />
            Pronto
          </span>
        </div>

        <div className="mt-8 space-y-3">
          {[
            "Motivo da negativa organizado em linguagem simples",
            "Estrutura pronta para protocolar no Meu INSS",
            "Arquivos em PDF e Word para revisar antes de enviar",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-2xl bg-ink-50 px-4 py-3 text-sm text-ink-700"
            >
              <CheckCircle2 className="h-4 w-4 flex-none text-success-600" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 border-t border-ink-200/60 pt-6 text-xs text-ink-500">
          <Zap className="h-3.5 w-3.5 text-gold-500" />
          <span className="font-medium">Entrega em até 24h</span>
        </div>
      </div>

      {/* Preço flutuante */}
      <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-ink-950/10 bg-ink-950 px-5 py-4 text-white shadow-lift md:block animate-float">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-300">
          A partir de
        </p>
        <p className="mt-1 font-display text-2xl font-bold">
          {formatCurrencyBRL(PRICE)}
        </p>
        <p className="text-[11px] text-ink-400">pagamento único</p>
      </div>
    </div>
  );
}

/* ======================================================================
   TRUST BAR — faixa discreta de credibilidade
   ====================================================================== */
function TrustBar() {
  const items = [
    "Baseado na Lei 8.213/91",
    "Decreto 3.048/99",
    "Súmulas do CRPS",
    "Jurisprudência TNU / STJ",
    "Modelos validados por especialistas",
  ];
  return (
    <section className="border-y border-ink-200/60 bg-white/60 backdrop-blur">
      <div className="container flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">
        {items.map((i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-gold-500" />
            {i}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ======================================================================
   STATS — quatro indicadores em cards premium
   ====================================================================== */
function Stats() {
  const items = [
    { kpi: "3 min", label: "para fazer sua solicitação pelo formulário guiado" },
    { kpi: "PDF + Word", label: "para revisar, editar e protocolar do seu jeito" },
    { kpi: "1 pagamento", label: "sem mensalidade e sem cobrança recorrente" },
    { kpi: "Fluxo guiado", label: "para quem não quer começar do zero nem se perder no processo" },
  ];
  return (
    <section className="container py-20">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <div
            key={i.label}
            className="group relative overflow-hidden rounded-2xl border border-ink-200/70 bg-white/80 p-6 shadow-ring transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-100/70 blur-2xl transition-opacity group-hover:opacity-80" />
            <p className="font-display text-4xl font-bold tracking-tight text-ink-950">
              {i.kpi}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{i.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ======================================================================
   HOW IT WORKS — três passos com numeração e conectores
   ====================================================================== */
function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "Conte o que aconteceu",
      text: "Você responde perguntas simples sobre o benefício negado e anexa os documentos que tiver. Leva menos de 5 minutos — tudo em linguagem fácil.",
    },
    {
      icon: CreditCard,
      title: "Pague uma vez só",
      text: "Pagamento único no cartão ou Pix. Sem mensalidade, sem taxa escondida e sem cobrança recorrente. Você paga e pronto.",
    },
    {
      icon: Sparkles,
      title: "Receba e protocole",
      text: "Em até 24h (ou 8 dias, se preferir manter seu prazo de arrependimento) seu recurso chega pronto em PDF e Word. É só imprimir ou enviar pelo Meu INSS.",
    },
  ];
  return (
    <section id="como-funciona" className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Simples e rápido</span>
        <h2 className="mt-5 font-display text-display-md font-semibold text-balance text-ink-950">
          Três passos. <span className="italic text-gradient-brand">Nenhuma burocracia.</span>
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-ink-600 text-pretty">
          Você não precisa saber de direito. O fluxo ajuda a entender a negativa, organiza suas informações e monta uma peça recursal clara para você revisar antes do protocolo.
        </p>
      </div>

      <div className="relative mt-16 grid gap-6 md:grid-cols-3">
        {/* linha conectora */}
        <div className="pointer-events-none absolute left-[12%] right-[12%] top-[4.25rem] hidden h-px bg-gradient-to-r from-transparent via-ink-300 to-transparent md:block" />

        {steps.map((s, i) => (
          <div key={i} className="card-lift">
            <div className="flex items-center justify-between">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 ring-1 ring-brand-200/60">
                <s.icon className="h-6 w-6" />
              </div>
              <span className="font-display text-5xl font-bold text-ink-100">
                0{i + 1}
              </span>
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-ink-950">
              {s.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-600">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ======================================================================
   SAMPLE PREVIEW — mostra amostra de uma peça já gerada (social proof visual)
   ====================================================================== */
function SamplePreview() {
  return (
    <section className="container py-24">
      <div className="grid items-center gap-14 md:grid-cols-2">
        <div>
          <span className="eyebrow">Como é a peça final</span>
          <h2 className="mt-5 font-display text-display-md font-semibold text-balance text-ink-950">
            Estrutura profissional, <span className="italic text-gradient-gold">linguagem técnica</span>, pronta para protocolo.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-600 text-pretty">
            A entrega final já vem organizada com os blocos que normalmente compõem
            um recurso administrativo: identificação do caso, tempestividade,
            fundamentação, argumentos e pedidos.
          </p>
          <ul className="mt-8 space-y-3 text-[15px] text-ink-700">
            {[
              "Endereçamento formal e tempestividade",
              "Síntese fática contextualizada",
              "Fundamentação alinhada ao tipo de negativa informado",
              "Pedidos estruturados para revisão antes do protocolo",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-1 grid h-5 w-5 flex-none place-items-center rounded-full bg-success-50 text-success-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-tr from-gold-200/40 via-transparent to-brand-300/30 blur-2xl" />
          <div className="card-glass relative p-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-200/70 bg-white/60 px-5 py-3 text-xs text-ink-500">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <span className="font-mono">recurso-auxilio-doenca.pdf</span>
              <span />
            </div>
            <div className="space-y-3 p-7 font-serif text-[13px] leading-relaxed text-ink-800">
              <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-ink-600">
                EXMO. SR. PRESIDENTE DA JUNTA DE RECURSOS DO CRPS
              </p>
              <p className="text-center">— — —</p>
              <p>
                <strong>DOS FATOS.</strong> A recorrente, segurada obrigatória do RGPS desde
                2011, afastou-se de suas atividades habituais em razão de diagnóstico
                de hérnia de disco lombar (CID M51.1), conforme laudo médico do Dr.
                Fulano (CRM 12345) de fl. 04...
              </p>
              <p>
                <strong>DO DIREITO.</strong> O art. 59 da Lei 8.213/91 assegura o auxílio por
                incapacidade temporária ao segurado que ficar incapacitado para o seu
                trabalho por mais de 15 dias consecutivos. O laudo privado, corroborado
                pelos exames de RM da coluna...
              </p>
              <p>
                <strong>DOS PEDIDOS.</strong> Ante o exposto, requer-se: (i) o provimento do
                recurso; (ii) a concessão do benefício desde a DER (02/2024); (iii) o
                pagamento das parcelas retroativas, com correção monetária pelo IPCA-E...
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================================
   BENEFITS — seção escura com gradiente dourado sutil
   ====================================================================== */
function Benefits() {
  const items = [
    "Fundamentação legal (Lei 8.213/91, Decreto 3.048/99)",
    "Súmulas do CRPS e jurisprudência pertinente",
    "Estrutura profissional de peça recursal",
    "Saída em PDF e Word (.docx) editáveis",
    "Checklist com pontos e documentos que merecem atenção",
    "Histórico completo na área do cliente",
    "Fluxo guiado para quem não quer começar do zero",
    "Garantia de 7 dias para testar com mais tranquilidade",
  ];
  return (
    <section className="relative overflow-hidden bg-ink-950 py-24 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-brand-700/30 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.04]" />

      <div className="container relative grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <span className="chip-dark">
            <Award className="h-3.5 w-3.5 text-gold-400" /> Benefícios
          </span>
          <h2 className="mt-5 font-display text-display-md font-semibold text-balance">
            O que você recebe,{" "}
            <span className="italic text-gradient-gold">sem complicação.</span>
          </h2>
          <p className="mt-5 max-w-md text-white/70 text-pretty">
            A proposta aqui é objetiva: tirar a pessoa da paralisia depois da negativa
            e entregar um caminho claro, com recurso estruturado e arquivos editáveis.
          </p>
        </div>

        <ul className="grid gap-3 self-center md:col-span-7 sm:grid-cols-2">
          {items.map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm backdrop-blur transition hover:bg-white/[0.08]"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-gold-400" />
              <span className="text-white/90">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ======================================================================
   COMPARISON — tabela refinada
   ====================================================================== */
function Comparison() {
  const rows = [
    { feat: "Tempo para montar o recurso", adv: "Horas ou dias pesquisando", us: "Em até 24h" },
    { feat: "Entender o motivo da negativa", adv: "Você interpreta sozinho a carta", us: "Fluxo guiado com linguagem simples" },
    { feat: "Base legal e jurisprudência", adv: "Pesquisa manual e dispersa", us: "Organizada automaticamente" },
    { feat: "Documento final", adv: "Modelo genérico ou rascunho", us: "Personalizado ao seu caso" },
    { feat: "Checklist do que anexar", adv: "Você decide por conta própria", us: "Sugestões práticas" },
    { feat: "Acesso ao material", adv: "Arquivos soltos", us: "Área do cliente + PDF e Word" },
  ];
  return (
    <section id="comparativo" className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Comparativo</span>
        <h2 className="mt-5 font-display text-display-md font-semibold text-balance text-ink-950">
          Fazer sozinho <span className="text-ink-400">vs.</span>{" "}
          <span className="italic text-gradient-brand">Recurso Fácil</span>
        </h2>
      </div>
      <div className="mt-12 overflow-hidden rounded-3xl border border-ink-200/70 bg-white/80 shadow-ring backdrop-blur">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-ink-50 to-white">
              <th className="px-6 py-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                Critério
              </th>
              <th className="px-6 py-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                Fazer sozinho
              </th>
              <th className="relative px-6 py-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
                <span className="inline-flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-brand-600 text-white">
                    <Scale className="h-3 w-3" />
                  </span>
                  Recurso Fácil
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/70">
            {rows.map((r) => (
              <tr key={r.feat} className="transition hover:bg-ink-50/50">
                <td className="px-6 py-5 font-medium text-ink-900">{r.feat}</td>
                <td className="px-6 py-5 text-ink-600">{r.adv}</td>
                <td className="px-6 py-5 font-semibold text-brand-800">{r.us}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ======================================================================
   DIFFERENTIALS — bento style
   ====================================================================== */
function Differentials() {
  const items = [
    {
      icon: Gauge,
      title: "Transforma negativa em estratégia",
      text: "O fluxo organiza o motivo da negativa e transforma informações soltas em uma base recursal mais clara.",
    },
    {
      icon: Sparkles,
      title: "Checklist do que reforçar",
      text: "Além da peça, a plataforma indica pontos e documentos que merecem revisão antes do protocolo.",
    },
    {
      icon: BookOpen,
      title: "Peça pronta e explicada",
      text: "Você recebe uma estrutura pronta e consegue revisar o texto com mais clareza antes de enviar.",
    },
    {
      icon: Clock,
      title: "Feita para quem é leigo",
      text: "Feita para quem quer agir rápido, sem começar do zero e sem depender de atendimento demorado.",
    },
  ];
  return (
    <section className="relative py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Diferenciais</span>
          <h2 className="mt-5 font-display text-display-md font-semibold text-balance text-ink-950">
            O que torna a plataforma{" "}
            <span className="italic text-gradient-brand">realmente diferente.</span>
          </h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((d) => (
            <div key={d.title} className="card-lift">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 text-gold-800 ring-1 ring-gold-300/50">
                <d.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-ink-950">
                {d.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{d.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================================================================
   PRICING — cartão único premium
   ====================================================================== */
function Pricing() {
  const features = [
    "Recurso completo pronto pra protocolar (PDF + Word)",
    "Fundamentação com base em legislação aplicável ao caso",
    "Checklist prático para revisar antes do protocolo",
    "Acesso ao seu recurso na área do cliente",
    "Suporte por email para dúvidas operacionais",
    "Garantia de 7 dias ou dinheiro de volta",
  ];
  return (
    <section className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Preço transparente</span>
        <h2 className="mt-5 font-display text-display-md font-semibold text-balance text-ink-950">
          Um preço. <span className="italic text-gradient-gold">Sem letras miúdas.</span>
        </h2>
        <p className="mt-5 text-lg text-ink-600">
          Pagamento único por recurso. Sem mensalidade, sem plano, sem pegadinha.
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-lg">
        <div className="relative overflow-hidden rounded-3xl border border-ink-950/10 bg-gradient-to-b from-ink-950 to-[#0a1030] p-10 text-white shadow-lift">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gold-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-brand-500/30 blur-3xl" />

          <div className="relative">
            <span className="chip-dark">
              <Award className="h-3.5 w-3.5 text-gold-400" /> Recurso completo
            </span>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              Ideal para quem quer agir rápido depois da negativa, sem precisar montar tudo sozinho.
            </p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-display text-6xl font-bold tracking-tight">
                {formatCurrencyBRL(PRICE)}
              </span>
              <span className="text-sm text-white/60">/ único</span>
            </div>
            <p className="mt-3 text-sm text-white/60">
              Valor único de <strong className="text-gold-300">{formatCurrencyBRL(PRICE)}</strong> por recurso
            </p>

            <ul className="mt-8 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-gold-400" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/novo-recurso"
              className="btn-gold mt-10 w-full py-4 text-base"
            >
              Gerar meu recurso agora
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-center text-[11px] uppercase tracking-[0.16em] text-white/40">
              Pagamento seguro · Cartão de crédito
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================================
   TRUST & COMPLIANCE — confiança regulatória e transparência
   ====================================================================== */
function TrustAndCompliance() {
  const items = [
    {
      icon: Scale,
      title: "Baseado em regra aplicável",
      text: "A peça é estruturada com referência à legislação previdenciária, decretos, súmulas e precedentes usados em recurso administrativo.",
    },
    {
      icon: Lock,
      title: "Dados tratados com cuidado",
      text: "Os documentos enviados pelo cliente são usados para gerar o recurso e ficam vinculados a uma área autenticada, com política específica de privacidade e LGPD.",
    },
    {
      icon: ShieldCheck,
      title: "Sem promessa de resultado",
      text: "A plataforma entrega uma peça técnica e um diagnóstico inicial. A decisão final continua sendo do INSS e depende do caso concreto e das provas.",
    },
    {
      icon: BookOpen,
      title: "Transparência sobre IA",
      text: "Quando usamos IA em texto, atendimento ou vídeos, deixamos isso explícito. A tecnologia entra para ganhar velocidade, não para esconder risco.",
    },
  ];

  return (
    <section className="container py-24">
      <div className="grid items-start gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <span className="eyebrow">Confiança regulatória</span>
          <h2 className="mt-5 font-display text-display-md font-semibold text-balance text-ink-950">
            Clareza jurídica, <span className="italic text-gradient-brand">segurança de dados</span> e transparência.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-600">
            Em um produto jurídico, confiança não vem só do design. Ela vem de mostrar base técnica, limites da plataforma e como os dados do cliente são tratados.
          </p>
        </div>

        <div className="grid gap-4 md:col-span-8 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.title} className="card-lift">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 ring-1 ring-brand-200/60">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-ink-950">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================================================================
   FAQ teaser
   ====================================================================== */
function FAQTeaser() {
  const items = [
    {
      q: "A plataforma substitui um advogado?",
      a: "Não. A plataforma entrega um recurso administrativo estruturado para casos em que a pessoa quer agir com rapidez e menor custo. Ela não substitui consultoria jurídica personalizada nem promete resultado.",
    },
    {
      q: "Preciso revisar antes de protocolar?",
      a: "Sim. Você pode revisar no PDF ou editar no Word antes de enviar pelo Meu INSS. Essa etapa aumenta sua segurança sobre o que está sendo protocolado em seu nome.",
    },
    {
      q: "Quais documentos ajudam mais no recurso?",
      a: "Isso varia conforme o benefício e o motivo da negativa, mas normalmente carta de indeferimento, laudos, exames, receitas, comprovantes e documentos de contribuição fortalecem bastante o caso. A plataforma sugere o que pode faltar.",
    },
    {
      q: "Como funciona a garantia de 7 dias?",
      a: "É o seu direito de arrependimento (art. 49 do CDC), válido em qualquer compra online. Na hora da compra você escolhe: manter esse prazo de 7 dias e receber o recurso em até 8 dias, ou abrir mão dele para receber em até 24h.",
    },
    {
      q: "Meus dados e documentos ficam protegidos?",
      a: "Sim. O envio acontece em ambiente autenticado, com páginas de privacidade e LGPD dedicadas. Os documentos são tratados para gerar o recurso e manter seu histórico na área do cliente.",
    },
    {
      q: "E se eu não souber o motivo exato da negativa?",
      a: "O formulário guiado ajuda você a identificar o motivo a partir da carta do INSS e organiza o recurso com base nesse contexto. Quando falta documento ou informação, a plataforma sinaliza isso com clareza.",
    },
  ];
  return (
    <section className="container py-24">
      <div className="grid gap-14 md:grid-cols-2">
        <div>
          <span className="eyebrow">FAQ essencial</span>
          <h2 className="mt-5 font-display text-display-md font-semibold text-balance text-ink-950">
            Dúvidas que <span className="italic text-gradient-brand">afetam a decisão de compra.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-600">
            Respondemos aqui as dúvidas que mais impactam conversão, segurança e confiança. O restante continua na página completa de FAQ.
          </p>
          <Link href="/faq" className="link-underline mt-8 inline-flex items-center gap-2 text-sm">
            Ver todas as perguntas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {items.map((it) => (
            <details
              key={it.q}
              className="group rounded-2xl border border-ink-200/70 bg-white/80 p-5 shadow-ring transition open:shadow-lift"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink-900">
                {it.q}
                <span className="grid h-7 w-7 place-items-center rounded-full border border-ink-200 text-ink-500 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================================================================
   MISSION — fundadores + propósito com vínculo à página /quem-somos
   ====================================================================== */
function Mission() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand-100/60 blur-3xl" />
      </div>

      <div className="container">
        <div className="grid items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <span className="chip-brand">
              <Scale className="h-3.5 w-3.5" /> Quem somos
            </span>
            <h2 className="mt-5 font-display text-display-md font-semibold text-balance text-ink-950">
              Criada por profissionais do direito{" "}
              <span className="italic text-gradient-brand">
                comprometidos com ampliar o acesso.
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-600 text-pretty">
              Nosso fundador atua há mais de 30 anos com execuções e recursos,
              prioritariamente ao lado de pessoas de baixa renda. Além da
              prática profissional, também é professor universitário de
              processo civil, levando conhecimento técnico para seus alunos.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-ink-600 text-pretty">
              A cofundadora atua há mais de 3 anos na gestão de escritório de
              advocacia e foi justamente dessa vivência que surgiu a convicção
              de que era preciso criar um caminho mais acessível para quem
              precisa recorrer. A Recurso Fácil nasceu para{" "}
              <strong className="text-ink-900">
                tornar o recurso jurídico acessível a todos os brasileiros
              </strong>
              , com respeito ao trabalho essencial dos advogados e foco em
              ampliar o acesso.
            </p>

            <div className="mt-8">
              <Link
                href="/quem-somos"
                className="link-underline inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
              >
                Conheça nossa história e nossos fundadores
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="grid gap-3">
              {[
                { icon: Scale, title: "Acesso igualitário", text: "Mesmo padrão técnico, independente de renda ou região." },
                { icon: ShieldCheck, title: "Preço justo", text: "Pagamento único, sem mensalidade e sem cobrança recorrente." },
                { icon: Sparkles, title: "Tecnologia a serviço", text: "Tecnologia pra baratear, nunca pra cortar qualidade." },
              ].map((v) => (
                <div key={v.title} className="flex items-start gap-4 rounded-2xl border border-ink-200/70 bg-white/80 p-5 shadow-ring">
                  <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 ring-1 ring-brand-200/60">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-ink-950">
                      {v.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600">
                      {v.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================================
   STICKY MOBILE CTA — barra fixa de conversão (mobile-first)
   ====================================================================== */
function StickyMobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200/70 bg-white/95 p-3 shadow-lift backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">
            Prazo: 30 dias
          </p>
          <p className="text-sm font-bold text-ink-950">
            {formatCurrencyBRL(PRICE)} <span className="text-xs font-normal text-ink-500">pagamento único</span>
          </p>
        </div>
        <Link href="/novo-recurso" className="btn-primary px-5 py-3 text-sm">
          Gerar recurso
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/* ======================================================================
   FINAL CTA — bloco dramático
   ====================================================================== */
function FinalCTA() {
  return (
    <section className="container pb-24">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-ink-950/10 bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 p-10 text-white shadow-lift md:p-16">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.06]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gold-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-brand-400/30 blur-3xl" />

        <div className="relative max-w-3xl">
          <span className="chip-dark">
            <Clock className="h-3.5 w-3.5 text-gold-400" /> Prazo de 30 dias para recorrer
          </span>
          <h2 className="mt-6 font-display text-display-lg font-semibold text-balance leading-[1.05]">
            Seu prazo para recorrer{" "}
            <span className="italic text-gradient-gold">já começou.</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80 text-pretty">
            Quanto antes você protocola, mais cedo o INSS reanalisa seu pedido.
            Você sai com um recurso estruturado e editável, com entrega em até 24h
            ou, se preferir manter sua garantia de 7 dias, em até 8 dias.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/novo-recurso"
              className="btn-gold px-7 py-4 text-base"
            >
              Gerar meu recurso agora <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/faq"
              className="btn px-7 py-4 text-base text-white ring-1 ring-white/20 hover:bg-white/10"
            >
              Ainda tenho dúvidas
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
