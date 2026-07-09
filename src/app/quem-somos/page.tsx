import Link from "next/link";
import {
  ArrowRight,
  Scale,
  Heart,
  Target,
  Users,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Quote,
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Quem somos — Nossa história e propósito",
  description:
    "Conheça os fundadores da Recurso Fácil: profissionais do direito que uniram experiência prática, gestão e tecnologia para ampliar o acesso à defesa previdenciária no Brasil.",
};

export default function QuemSomosPage() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <Hero />
        <Manifesto />
        <Founders />
        <Values />
        <Numbers />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 -top-40 h-[500px] bg-radial-brand" />
        <div className="absolute -left-40 top-40 h-[420px] w-[420px] rounded-full bg-gold-200/40 blur-3xl" />
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-brand-200/50 blur-3xl" />
      </div>

      <div className="container py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="chip-brand">
            <Heart className="h-3.5 w-3.5" /> Quem somos
          </span>
          <h1 className="mt-6 font-display text-display-lg font-semibold text-balance text-ink-950">
            Somos profissionais do direito com uma{" "}
            <span className="italic text-gradient-brand">
              convicção compartilhada.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-600 text-pretty">
            Dedicamos nossas trajetórias ao direito e à gestão jurídica. Ao
            longo desses anos, chegamos à mesma conclusão: é preciso ampliar o
            acesso técnico a quem mais precisa recorrer e muitas vezes não sabe
            por onde começar.
          </p>
        </div>
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <span className="eyebrow">Nosso propósito</span>
          <h2 className="mt-5 font-display text-display-md font-semibold text-balance text-ink-950">
            Ampliar o acesso à justiça{" "}
            <span className="italic text-gradient-brand">
              para quem ainda não chega até ela.
            </span>
          </h2>

          <div className="prose mt-10 space-y-6 text-[17px] leading-relaxed text-ink-700">
            <p>
              O direito previdenciário protege, em sua essência, as pessoas
              mais vulneráveis: trabalhadores que contribuíram por décadas,
              mães de família, pessoas com deficiência, idosos do interior.
              É para elas que a rede de proteção social existe.
            </p>
            <p>
              Ao longo da nossa vivência profissional, percebemos algo em comum
              nesses casos: uma parte significativa das pessoas que têm um
              benefício negado{" "}
              <strong>
                não chega a exercer o direito de recorrer
              </strong>{" "}
              — seja por desconhecimento do prazo, por dificuldade em
              organizar a documentação, por distância geográfica ou por falta
              de recursos para buscar orientação profissional.
            </p>
            <p>
              Acreditamos que a advocacia desempenha um papel essencial e
              insubstituível. Temos profundo respeito pelo trabalho dos
              profissionais que atuam na área. Nosso propósito é{" "}
              <strong>complementar esse universo</strong>, oferecendo uma
              porta de entrada técnica e acessível para quem, por qualquer
              motivo, ainda não encontrou um caminho para se defender.
            </p>
            <p>
              A Recurso Fácil nasceu desse encontro entre experiência
              técnica, gestão jurídica e desejo de ampliar acesso. É isso:{" "}
              <strong>
                um instrumento a serviço do acesso à justiça
              </strong>
              , construído por quem vive o direito por dentro e acredita no
              poder transformador dele.
            </p>
            <p className="text-sm text-ink-500">
              Somos uma plataforma privada e independente — sem qualquer vínculo com
              o INSS ou com o Governo Federal.
            </p>
          </div>

          <div className="mt-12 rounded-2xl border-l-4 border-brand-600 bg-brand-50/50 p-6">
            <Quote className="h-6 w-6 text-brand-600" />
            <p className="mt-3 font-display text-xl leading-snug text-ink-900">
              &ldquo;A tecnologia, bem aplicada, é uma ponte. Não substitui o
              direito, nem os profissionais que o exercem: cria caminhos para
              que mais pessoas possam percorrê-lo.&rdquo;
            </p>
            <p className="mt-3 text-sm font-semibold text-ink-600">
              — Fundadores da Recurso Fácil
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Founders() {
  const founders = [
    {
      name: "Fundadora",
      role: "Co-fundadora · Gestão e estratégia",
      initials: "F",
      bio: "Atua há mais de 3 anos na gestão de escritório de advocacia e foi justamente dessa experiência que amadureceu a visão de que o acesso precisa ser ampliado. No dia a dia da operação jurídica, entendeu onde estão os gargalos de atendimento, comunicação, organização e entrega para quem mais precisa de orientação técnica.",
      highlights: [
        "Mais de 3 anos em gestão de escritório de advocacia",
        "Visão prática de operação e acesso ao cliente",
        "Foco em ampliar acesso com organização e tecnologia",
      ],
      tone: "brand",
    },
    {
      name: "Fundador",
      role: "Co-fundador · Direção técnica",
      initials: "F",
      bio: "Profissional do direito com mais de 30 anos de experiência em execuções e recursos, atuando prioritariamente com pessoas de baixa renda. Além da prática técnica, é professor universitário na disciplina de processo civil, o que reforça sua atuação na formação jurídica e no compromisso com conhecimento técnico acessível.",
      highlights: [
        "Mais de 30 anos em execuções e recursos",
        "Atuação prioritária com pessoas de baixa renda",
        "Professor universitário de processo civil",
      ],
      tone: "gold",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-ink-950 py-24 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-brand-700/30 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.04]" />

      <div className="container relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip-dark">
            <Users className="h-3.5 w-3.5 text-gold-400" /> Fundadores
          </span>
          <h2 className="mt-5 font-display text-display-md font-semibold text-balance">
            Experiência técnica e gestão jurídica,{" "}
            <span className="italic text-gradient-gold">com o mesmo propósito.</span>
          </h2>
          <p className="mt-5 text-white/70 text-pretty">
            A Recurso Fácil nasceu da união entre experiência técnica,
            vivência de gestão e uso responsável da tecnologia para ampliar o
            acesso à defesa previdenciária.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {founders.map((f) => (
            <article
              key={f.role}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-5">
                <span
                  className={`grid h-20 w-20 flex-none place-items-center rounded-full text-2xl font-bold shadow-lift ${
                    f.tone === "gold"
                      ? "bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950"
                      : "bg-gradient-to-br from-brand-400 to-brand-700 text-white"
                  }`}
                >
                  {f.initials}
                </span>
                <div>
                  <p className="font-display text-xl font-semibold">{f.name}</p>
                  <p className="mt-1 text-sm text-white/60">{f.role}</p>
                </div>
              </div>

              <p className="mt-6 text-[15px] leading-relaxed text-white/80">
                {f.bio}
              </p>

              <ul className="mt-6 space-y-2">
                {f.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-white/80">
                    <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-gold-400" />
                    {h}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-white/50">
          A Recurso Fácil é uma empresa de tecnologia jurídica. Não é
          escritório de advocacia. Nossos fundadores atuam na direção técnica
          e estratégica da plataforma, com foco em clareza, responsabilidade
          e acesso.
        </p>
      </div>
    </section>
  );
}

function Values() {
  const values = [
    {
      icon: Scale,
      title: "Acesso igualitário",
      text: "Todo brasileiro merece uma peça jurídica no mesmo padrão técnico — independente de renda, região ou escolaridade.",
    },
    {
      icon: ShieldCheck,
      title: "Transparência total",
      text: "Somos claros sobre o que fazemos com IA, sobre preço, sobre limites. Sem letra miúda, sem promessa que não podemos cumprir.",
    },
    {
      icon: Heart,
      title: "Humanidade primeiro",
      text: "Tecnologia é ferramenta, não fim. Tudo que construímos parte de uma pergunta: isso ajuda quem mais precisa?",
    },
    {
      icon: Target,
      title: "Rigor técnico",
      text: "Não trabalhamos com promessas. A proposta é oferecer uma base técnica clara, responsável e coerente com o tipo de recurso administrativo que a plataforma entrega.",
    },
    {
      icon: BookOpen,
      title: "Educação jurídica",
      text: "Acreditamos que conhecimento liberta. Nossos materiais existem pra explicar direitos em linguagem acessível.",
    },
    {
      icon: Sparkles,
      title: "Tecnologia responsável",
      text: "Usamos tecnologia pra baratear, nunca pra cortar qualidade. Todo recurso é escrito e validado tecnicamente por quem entende do assunto.",
    },
  ];

  return (
    <section className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Nossos valores</span>
        <h2 className="mt-5 font-display text-display-md font-semibold text-balance text-ink-950">
          Seis princípios que{" "}
          <span className="italic text-gradient-brand">guiam tudo que fazemos.</span>
        </h2>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((v) => (
          <div key={v.title} className="card-lift">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 ring-1 ring-brand-200/60">
              <v.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-ink-950">
              {v.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{v.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Numbers() {
  const stats = [
    { kpi: "Nova", label: "plataforma em fase inicial, com foco em operação simples e responsável" },
    { kpi: "3+ anos", label: "de experiência da cofundadora em gestão de escritório de advocacia" },
    { kpi: "30+ anos", label: "de experiência técnica do fundador com execuções e recursos" },
    { kpi: "1 objetivo", label: "ampliar o acesso ao recurso administrativo com mais clareza e menos barreira" },
  ];

  return (
    <section className="container pb-24">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl border border-ink-200/70 bg-white/80 p-6 shadow-ring"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-100/70 blur-2xl" />
            <p className="font-display text-4xl font-bold tracking-tight text-ink-950">
              {s.kpi}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="container pb-24">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-ink-950/10 bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 p-10 text-white shadow-lift md:p-16">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.06]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gold-500/30 blur-3xl" />

        <div className="relative max-w-2xl">
          <h2 className="font-display text-display-md font-semibold text-balance leading-[1.1]">
            Faça parte dessa história.{" "}
            <span className="italic text-gradient-gold">
              Reverta sua negativa com técnica.
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
            Você não precisa enfrentar o INSS sozinho, nem pagar o que não
            pode. Gere seu recurso agora.
          </p>
          <div className="mt-8">
            <Link href="/novo-recurso" className="btn-gold px-7 py-4 text-base">
              Quero gerar meu recurso agora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
