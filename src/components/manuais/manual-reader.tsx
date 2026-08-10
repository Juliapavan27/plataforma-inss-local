import Link from "next/link";
import {
  Info,
  AlertTriangle,
  ShieldAlert,
  Lightbulb,
  Scale,
  Gavel,
  FileText,
  ArrowRight,
} from "lucide-react";
import type { BlocoManual, Manual } from "@/content/manuais";
import { WHATSAPP_HREF } from "@/lib/whatsapp";

/**
 * Leitor de manual — renderiza os blocos tipados de src/content/manuais.ts.
 *
 * É a mesma fonte que alimenta o PDF: o que se lê aqui é o que a pessoa baixa.
 * Blocos de WhatsApp e o CTA final aparecem em toda a extensão do manual, como
 * a autora pediu — o material inteiro empurra, sem ruído, para "receba pronto".
 */

const WhatsAppGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a12.062 12.062 0 005.71 1.447h.005c6.585 0 11.946-5.335 11.949-11.893a11.821 11.821 0 00-3.479-8.413z" />
  </svg>
);

const DESTAQUE = {
  info: { icon: Info, cls: "border-brand-200 bg-brand-50", ic: "text-brand-600", tt: "text-ink-900" },
  atencao: { icon: AlertTriangle, cls: "border-amber-200 bg-amber-50", ic: "text-amber-600", tt: "text-amber-900" },
  cuidado: { icon: ShieldAlert, cls: "border-red-200 bg-red-50", ic: "text-red-600", tt: "text-red-800" },
  dica: { icon: Lightbulb, cls: "border-success-200 bg-success-50", ic: "text-success-600", tt: "text-success-800" },
} as const;

function WhatsAppFaixa({ texto }: { texto?: string }) {
  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      className="my-6 flex items-center gap-3 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/10 px-5 py-4 transition hover:bg-[#25D366]/15"
    >
      <span
        className="grid h-10 w-10 flex-none place-items-center rounded-full text-white"
        style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
      >
        <WhatsAppGlyph className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-ink-800">
        {texto ?? "Fale com um especialista"}
        <span className="block text-xs font-normal text-ink-500">
          Tire sua dúvida no WhatsApp — resposta humana
        </span>
      </span>
      <ArrowRight className="ml-auto h-4 w-4 flex-none text-[#128C7E]" />
    </a>
  );
}

function CtaFinal() {
  return (
    <div className="my-6 rounded-3xl border border-brand-200 bg-gradient-to-b from-brand-50 to-white p-7 text-center">
      <p className="font-display text-2xl font-bold text-ink-950">
        Sabia que você pode receber tudo isso pronto?
      </p>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-700">
        Você acabou de ver o trabalho que um bom recurso exige. Se preferir não
        fazer sozinho, a nossa equipe monta o recurso completo, fundamentado e
        revisado para o seu caso — pronto para protocolar.
      </p>
      <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <Link href="/novo-recurso" className="btn-primary justify-center px-6 py-3">
          Solicitar meu recurso pronto <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#25D366] px-6 py-3 font-semibold text-[#128C7E] transition hover:bg-[#25D366]/10"
        >
          <WhatsAppGlyph className="h-5 w-5" /> Falar no WhatsApp
        </a>
      </div>
    </div>
  );
}

function Bloco({ b }: { b: BlocoManual }) {
  switch (b.tipo) {
    case "paragrafo":
      return <p className="mt-4 text-[15px] leading-relaxed text-ink-700">{b.texto}</p>;
    case "subtitulo":
      return (
        <h3 className="mt-8 font-display text-lg font-semibold text-ink-950">{b.texto}</h3>
      );
    case "lista":
      return (
        <ul className="mt-4 space-y-2">
          {b.itens.map((it, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-700">
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
              {it}
            </li>
          ))}
        </ul>
      );
    case "destaque": {
      const d = DESTAQUE[b.variante];
      const Icon = d.icon;
      return (
        <div className={`mt-5 rounded-2xl border ${d.cls} p-5`}>
          <p className={`flex items-center gap-2 text-sm font-semibold ${d.tt}`}>
            <Icon className={`h-4 w-4 flex-none ${d.ic}`} />
            {b.titulo ?? "Atenção"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-700">{b.texto}</p>
        </div>
      );
    }
    case "lei":
      return (
        <div className="mt-5 rounded-2xl border border-ink-200 bg-ink-50/70 p-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-500">
            <Scale className="h-4 w-4 text-ink-400" /> Base legal · {b.referencia}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-800">{b.texto}</p>
        </div>
      );
    case "jurisprudencia":
      return (
        <div
          className={`mt-5 rounded-2xl border bg-violet-50/60 p-5 ${
            b.revisar ? "border-dashed border-violet-300" : "border-violet-200"
          }`}
        >
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-violet-600">
            <Gavel className="h-4 w-4" /> Jurisprudência de apoio
            {b.revisar && (
              <span className="rounded-full bg-violet-200 px-2 py-0.5 text-[10px] text-violet-800">
                a validar
              </span>
            )}
          </p>
          <p className="mt-2 text-sm font-medium text-ink-900">{b.tema}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{b.texto}</p>
          {b.referencia && (
            <p className="mt-2 text-xs italic text-ink-500">{b.referencia}</p>
          )}
        </div>
      );
    case "modelo":
      return (
        <div className="mt-5 overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <p className="flex items-center gap-2 border-b border-ink-200 bg-ink-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-ink-600">
            <FileText className="h-4 w-4 text-brand-600" /> Modelo · {b.titulo}
          </p>
          <pre className="whitespace-pre-wrap px-4 py-4 font-mono text-[13px] leading-relaxed text-ink-800">
            {b.texto}
          </pre>
        </div>
      );
    case "whatsapp":
      return <WhatsAppFaixa texto={b.texto} />;
    case "cta_final":
      return <CtaFinal />;
  }
}

export function ManualReader({ manual }: { manual: Manual }) {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="border-b border-ink-200 pb-8">
        <span className="chip-brand bg-brand-50 text-brand-700 ring-brand-200">Manual em PDF</span>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink-950 md:text-4xl">
          {manual.titulo}
        </h1>
        <p className="mt-3 text-lg text-ink-600">{manual.subtitulo}</p>
      </header>

      {manual.secoes.map((secao) => (
        <section key={secao.titulo} className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-ink-950">{secao.titulo}</h2>
          {secao.blocos.map((b, i) => (
            <Bloco key={i} b={b} />
          ))}
        </section>
      ))}
    </article>
  );
}
