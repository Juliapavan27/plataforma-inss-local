"use client";

/**
 * Funil de pré-análise: três perguntas e um resultado útil.
 *
 * Existe porque mandar quem acabou de tomar uma negativa direto para um
 * formulário de compra é pedir decisão antes de a pessoa entender a própria
 * situação. Aqui ela responde três coisas que já sabe, recebe algo de valor
 * real (principalmente o prazo) e só então vê a oferta.
 *
 * Tudo roda no navegador: nenhuma resposta é enviada ou guardada. São dados de
 * saúde e de renda, e a pré-análise não precisa deles no servidor para
 * funcionar — então não os coleta.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CalendarClock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { beneficiosNegados } from "@/content/beneficios";
import { getManualPorBeneficio } from "@/content/manuais";
import { MOTIVOS, preAnalisar, type MotivoKey } from "@/lib/pre-analise";
import { trackEvent } from "@/lib/tracking";
import { whatsappHref } from "@/lib/whatsapp";
import { formatCurrencyBRL } from "@/lib/utils";

type Etapa = 1 | 2 | 3 | 4;

const estiloPrazo = {
  dentro: { wrap: "border-success-500/30 bg-success-500/10", icon: "text-success-400", Icon: CheckCircle2 },
  apertado: { wrap: "border-amber-500/30 bg-amber-500/10", icon: "text-amber-400", Icon: AlertTriangle },
  vencido: { wrap: "border-red-500/30 bg-red-500/10", icon: "text-red-400", Icon: AlertTriangle },
  sem_data: { wrap: "border-white/15 bg-white/5", icon: "text-white/50", Icon: CalendarClock },
} as const;

export function PossoRecorrer() {
  const [etapa, setEtapa] = useState<Etapa>(1);
  const [beneficio, setBeneficio] = useState("");
  const [motivo, setMotivo] = useState<MotivoKey | "">("");
  const [dataNegativa, setDataNegativa] = useState("");

  const resultado = useMemo(
    () =>
      etapa === 4 && motivo
        ? preAnalisar({ beneficioSlug: beneficio, motivo, dataNegativa })
        : null,
    [etapa, beneficio, motivo, dataNegativa],
  );

  // Manual que atende o benefício escolhido — a opção mais barata da esteira.
  const manualOferta = getManualPorBeneficio(beneficio);

  function reiniciar() {
    setBeneficio("");
    setMotivo("");
    setDataNegativa("");
    setEtapa(1);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {etapa < 4 && <Progresso etapa={etapa} />}

      {etapa === 1 && (
        <Pergunta titulo="Qual benefício o INSS negou?">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {beneficiosNegados.map((b) => (
              <Opcao
                key={b.slug}
                ativo={beneficio === b.slug}
                onClick={() => {
                  setBeneficio(b.slug);
                  setEtapa(2);
                }}
              >
                {b.nome}
              </Opcao>
            ))}
          </div>
        </Pergunta>
      )}

      {etapa === 2 && (
        <Pergunta titulo="O que a carta diz sobre o motivo?">
          <p className="mb-4 text-sm text-white/60">
            Se não souber ao certo, escolha a última opção — a pré-análise funciona mesmo
            assim.
          </p>
          <div className="grid gap-2.5">
            {MOTIVOS.map((m) => (
              <Opcao
                key={m.key}
                ativo={motivo === m.key}
                onClick={() => {
                  setMotivo(m.key);
                  setEtapa(3);
                }}
              >
                {m.label}
              </Opcao>
            ))}
          </div>
          <Voltar onClick={() => setEtapa(1)} />
        </Pergunta>
      )}

      {etapa === 3 && (
        <Pergunta titulo="Quando você soube da negativa?">
          <p className="mb-4 text-sm text-white/60">
            É a data em que você tomou conhecimento da decisão — normalmente a data da
            carta ou do aviso no Meu INSS. É o que define o seu prazo.
          </p>
          <label className="text-sm font-semibold text-white/80">Data da ciência</label>
          <input
            type="date"
            className="input mt-1.5"
            value={dataNegativa}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDataNegativa(e.target.value)}
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={() => setEtapa(4)}>
              Ver minha pré-análise <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" type="button" className="text-white/70 hover:bg-white/10 hover:text-white" onClick={() => setEtapa(4)}>
              Não sei a data
            </Button>
          </div>
          <Voltar onClick={() => setEtapa(2)} />
        </Pergunta>
      )}

      {etapa === 4 && resultado && (
        <div className="space-y-5">
          {/* Veredito afirmativo — o "sim" que aquece o lead, sem prometer
              resultado: recorrer é um direito; o que varia é o argumento. */}
          {(() => {
            const positivo = resultado.situacao !== "vencido";
            const titulo = {
              dentro: "Sim — você está no prazo e pode recorrer",
              apertado: "Sim, você pode recorrer — mas o prazo está apertado",
              sem_data: "Sim, você pode recorrer — confirme a data para saber o prazo",
              vencido: "Atenção: o prazo aparenta ter passado",
            }[resultado.situacao];
            return (
              <div className="text-center">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${
                    positivo
                      ? "bg-success-500/15 text-success-300 ring-success-500/30"
                      : "bg-amber-500/15 text-amber-300 ring-amber-500/30"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Pré-análise concluída
                </span>
                <h2 className="mt-4 font-display text-2xl font-black text-balance text-white md:text-3xl">
                  {titulo}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60">
                  Toda negativa do INSS pode ser questionada por recurso administrativo — o
                  que muda é o argumento. Veja abaixo o que costuma pesar no seu caso (
                  {resultado.beneficio?.nome ?? "benefício"} ·{" "}
                  {MOTIVOS.find((m) => m.key === motivo)?.label}).
                </p>
              </div>
            );
          })()}

          {/* Prazo primeiro: é a informação mais acionável da tela. */}
          {(() => {
            const e = estiloPrazo[resultado.situacao];
            return (
              <div className={`rounded-2xl border p-6 ${e.wrap}`}>
                <p className="flex items-start gap-2.5 font-display text-lg font-bold text-white">
                  <e.Icon className={`mt-0.5 h-5 w-5 flex-none ${e.icon}`} />
                  {resultado.tituloPrazo}
                </p>
                <p className="mt-2 pl-[30px] text-sm leading-relaxed text-white/70">
                  {resultado.textoPrazo}
                </p>
              </div>
            );
          })()}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-display text-lg font-bold text-white">
              O que costuma pesar num caso assim
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{resultado.oQuePesa}</p>
            <Link
              href={`/guias/${resultado.guiaMotivo}`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:underline"
            >
              Ler o guia sobre isso <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <FileText className="h-4 w-4 text-gold-300" />
              Documentos que costumam ser relevantes
            </h3>
            <ul className="mt-3 space-y-2">
              {resultado.documentos.map((d) => (
                <li key={d} className="flex gap-2.5 text-sm text-white/70">
                  <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-gold-500" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* A oferta só aparece depois de a pessoa ter recebido algo de valor. */}
          <div className="rounded-3xl bg-ink-950 p-8 text-white">
            <h3 className="font-display text-xl font-semibold text-balance">
              {resultado.situacao === "vencido"
                ? "Ainda dá para agir — fale com a gente antes de decidir"
                : "Converse com um especialista sobre o seu caso"}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {resultado.situacao === "vencido"
                ? "Como o prazo aparenta ter passado, confira a data de ciência na carta. Se ela for outra, o recurso ainda cabe — a gente te ajuda a confirmar, sem compromisso."
                : "Tire suas dúvidas com quem entende, sem compromisso. E, se fizer sentido para você, a gente monta o recurso pronto para protocolar."}
            </p>

            {/* WhatsApp-first: é o canal que converte esta intenção (informacional). */}
            <a
              href={whatsappHref(
                `Olá! Fiz a pré-análise no site da Recurso Fácil. Benefício: ${
                  resultado.beneficio?.nome ?? "-"
                }. Motivo da negativa: ${
                  MOTIVOS.find((m) => m.key === motivo)?.label ?? "-"
                }. Gostaria de saber se posso recorrer.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("Lead", { content_name: "WhatsApp - posso-recorrer" })}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold text-white shadow-lift transition hover:-translate-y-0.5"
              style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
            >
              <WhatsAppGlyph className="h-5 w-5" /> Falar com um especialista no WhatsApp
            </a>

            {/* Compra direta — secundária, para quem já se decidiu. */}
            <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
              Ou resolva por conta própria
            </p>
            <div className="mt-3 flex flex-col gap-3">
              {manualOferta && resultado.situacao !== "vencido" && (
                <Link
                  href={`/manuais/${manualOferta.slug}`}
                  onClick={() => trackEvent("Lead", { content_name: "Manual - posso-recorrer" })}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                      <FileText className="h-4 w-4 text-brand-300" /> Fazer você mesmo com o manual
                    </span>
                    <span className="mt-0.5 block text-xs text-white/60">
                      Passo a passo completo em PDF — {formatCurrencyBRL(manualOferta.precoCents)}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 flex-none text-white/70" />
                </Link>
              )}
              <Link
                href="/novo-recurso"
                onClick={() => trackEvent("Lead", { content_name: "Gerar - posso-recorrer" })}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <span>
                  <span className="text-sm font-semibold text-white">Receber o recurso pronto</span>
                  <span className="mt-0.5 block text-xs text-white/60">
                    A gente monta e entrega em PDF e Word para protocolar
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 flex-none text-white/70" />
              </Link>
            </div>
            {resultado.guiaBeneficio && (
              <p className="mt-4">
                <Link
                  href={`/guias/${resultado.guiaBeneficio}`}
                  className="text-sm font-medium text-white/60 underline-offset-2 transition hover:text-white/90 hover:underline"
                >
                  Prefiro ler antes sobre o meu caso
                </Link>
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" type="button" className="text-white/70 hover:bg-white/10 hover:text-white" onClick={reiniciar}>
              <RotateCcw className="h-4 w-4" /> Refazer a pré-análise
            </Button>
          </div>

          <p className="text-center text-xs leading-relaxed text-white/40">
            Esta pré-análise é orientação informativa baseada apenas nas respostas acima.
            Não é parecer jurídico, não avalia o seu processo e não prevê resultado. Suas
            respostas não foram enviadas nem armazenadas.
          </p>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- auxiliares */

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a12.062 12.062 0 005.71 1.447h.005c6.585 0 11.946-5.335 11.949-11.893a11.821 11.821 0 00-3.479-8.413z" />
    </svg>
  );
}

function Progresso({ etapa }: { etapa: Etapa }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-1.5 flex-1 rounded-full transition ${
              n <= etapa ? "bg-brand-500" : "bg-white/15"
            }`}
          />
        ))}
      </div>
      <p className="mt-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
        Passo {etapa} de 3
      </p>
    </div>
  );
}

function Pergunta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
      <h2 className="mb-5 font-display text-2xl font-bold text-balance text-white">
        {titulo}
      </h2>
      {children}
    </div>
  );
}

function Opcao({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition ${
        ativo
          ? "border-brand-400 bg-brand-500/20 text-white ring-2 ring-brand-400/40"
          : "border-white/15 bg-white/5 text-white hover:border-brand-400 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function Voltar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white/50 transition hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" /> Voltar
    </button>
  );
}
