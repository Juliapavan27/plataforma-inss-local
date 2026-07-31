"use client";

/**
 * Analisador de carta de indeferimento.
 *
 * O PDF é lido AQUI, no navegador — o arquivo nunca é enviado para o nosso
 * servidor. Só o texto extraído sobe, e depois de passar por uma limpeza que
 * troca CPF, número de benefício, e-mail e telefone por marcadores.
 *
 * O texto limpo fica visível num campo editável antes do envio, de propósito:
 * a pessoa vê exatamente o que vai sair do computador dela e pode apagar
 * qualquer coisa. É a diferença entre pedir confiança e mostrar.
 */
import { useRef, useState } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  Loader2,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { limparTextoCarta } from "@/lib/carta-inss";
import { preAnalisar } from "@/lib/pre-analise";
import { formatDateBR } from "@/lib/utils";

interface Analise {
  beneficioSlug: string | null;
  beneficioNome: string | null;
  motivo: any;
  motivoLabel: string;
  resumoDaNegativa: string;
  dataDecisao: string | null;
  pontosDeDiscussao: string[];
  documentosSugeridos: string[];
  observacoes: string | null;
}

export function AnalisadorForm() {
  const [texto, setTexto] = useState("");
  const [lendoPdf, setLendoPdf] = useState(false);
  const [consentimento, setConsentimento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [analise, setAnalise] = useState<Analise | null>(null);
  const inputArquivo = useRef<HTMLInputElement>(null);

  async function lerPdf(file: File) {
    setErro(null);
    setLendoPdf(true);
    try {
      // Import dinâmico: o pdf.js é pesado e só faz sentido carregar quando a
      // pessoa realmente escolhe um arquivo.
      const pdfjs = await import("pdfjs-dist");
      // Worker servido de /public em vez de `new URL(..., import.meta.url)`:
      // aquele padrão faz o webpack empacotar o worker inteiro no bundle da
      // página e o build estoura. Copiado por `npm run copy-pdf-worker`.
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      let extraido = "";
      for (let i = 1; i <= Math.min(doc.numPages, 10); i++) {
        const pagina = await doc.getPage(i);
        const conteudo = await pagina.getTextContent();
        extraido +=
          conteudo.items.map((it: any) => ("str" in it ? it.str : "")).join(" ") + "\n";
      }

      const limpo = limparTextoCarta(extraido);
      if (limpo.length < 80) {
        setErro(
          "Não consegui ler texto neste PDF. Ele provavelmente é uma imagem escaneada — nesse caso, copie o texto da carta e cole no campo abaixo.",
        );
      } else {
        setTexto(limpo);
      }
    } catch {
      setErro(
        "Não consegui abrir este arquivo. Confira se é um PDF, ou cole o texto da carta abaixo.",
      );
    } finally {
      setLendoPdf(false);
    }
  }

  async function analisar() {
    setErro(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/analisar-indeferimento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Limpa de novo aqui: se a pessoa colar texto cru no campo, ele não
        // sai do navegador com CPF.
        body: JSON.stringify({ texto: limparTextoCarta(texto), consentimento: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível analisar a carta.");
        return;
      }
      setAnalise(data.analise);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  function recomecar() {
    setTexto("");
    setAnalise(null);
    setErro(null);
    setConsentimento(false);
    if (inputArquivo.current) inputArquivo.current.value = "";
  }

  if (analise) {
    return <Resultado analise={analise} onRecomecar={recomecar} />;
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
        <Label>1. Envie a carta ou cole o texto</Label>

        <button
          type="button"
          onClick={() => inputArquivo.current?.click()}
          disabled={lendoPdf}
          className="mt-3 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-ink-300 bg-ink-50/60 px-4 py-8 text-sm font-medium text-ink-700 transition hover:border-brand-400 hover:bg-brand-50/50 disabled:opacity-60"
        >
          {lendoPdf ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-brand-600" /> Lendo o PDF…
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 text-brand-600" /> Escolher o PDF da carta
            </>
          )}
        </button>
        <input
          ref={inputArquivo}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) lerPdf(f);
          }}
        />

        {/* O texto vai dentro de um span: solto, cada <strong> virava um item
            do flex e a frase quebrava em colunas. */}
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-500">
          <Lock className="mt-0.5 h-3.5 w-3.5 flex-none text-success-600" />
          <span>
            O arquivo é lido aqui no seu navegador e <strong>não é enviado</strong> para
            nossos servidores. Baixe a carta no Meu INSS, em “Consultar pedidos”.
          </span>
        </p>
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
        <Label>2. Confira o que será enviado para análise</Label>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
          Nome, CPF, número do benefício, e-mail e telefone já foram trocados por marcadores.
          Você pode editar ou apagar qualquer trecho antes de continuar.
        </p>
        <textarea
          className="input mt-3 min-h-[180px] font-mono text-[13px] leading-relaxed"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Cole aqui o texto da carta de indeferimento, ou envie o PDF acima."
        />
        <p className="mt-2 text-xs text-ink-400">{texto.length} caracteres</p>
      </div>

      <label className="flex items-start gap-3 rounded-2xl bg-ink-50 p-5 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
          checked={consentimento}
          onChange={(e) => setConsentimento(e.target.checked)}
        />
        <span className="text-ink-700">
          Concordo que este texto seja enviado para análise automática. Entendo que ele
          pode conter informações de saúde, que <strong>nada é armazenado</strong> — nem o
          texto nem o resultado — e que esta análise é informativa e não substitui
          orientação jurídica sobre o meu caso.
        </span>
      </label>

      {erro && (
        <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-amber-600" />
          {erro}
        </p>
      )}

      <Button
        className="w-full py-3.5"
        type="button"
        onClick={analisar}
        disabled={enviando || texto.trim().length < 80 || !consentimento}
      >
        {enviando ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Analisando…
          </>
        ) : (
          <>
            Analisar minha carta <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ saída */

function Resultado({
  analise,
  onRecomecar,
}: {
  analise: Analise;
  onRecomecar: () => void;
}) {
  // Reaproveita a mesma regra de prazo da pré-análise — uma fonte só evita
  // duas telas dizendo coisas diferentes sobre o mesmo prazo.
  const prazo = preAnalisar({
    beneficioSlug: analise.beneficioSlug ?? "",
    motivo: analise.motivo,
    dataNegativa: analise.dataDecisao ?? "",
  });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-ink-950">O que a carta diz</h2>
        {analise.beneficioNome && (
          <p className="mt-2 text-sm text-ink-600">
            {analise.beneficioNome} · {analise.motivoLabel}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-6">
        <h3 className="font-display text-lg font-semibold text-ink-950">
          Motivo da negativa
        </h3>
        <p className="mt-2 leading-relaxed text-ink-700">{analise.resumoDaNegativa}</p>
        {analise.dataDecisao && (
          <p className="mt-3 text-sm text-ink-500">
            Data da decisão identificada: {formatDateBR(new Date(analise.dataDecisao))}
          </p>
        )}
      </div>

      <div
        className={`rounded-2xl border p-6 ${
          prazo.situacao === "vencido"
            ? "border-red-200 bg-red-50"
            : prazo.situacao === "apertado"
              ? "border-amber-200 bg-amber-50"
              : prazo.situacao === "dentro"
                ? "border-success-200 bg-success-50"
                : "border-ink-200 bg-ink-50"
        }`}
      >
        <p className="font-display text-lg font-semibold text-ink-950">
          {prazo.tituloPrazo}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">{prazo.textoPrazo}</p>
      </div>

      {analise.pontosDeDiscussao.length > 0 && (
        <div className="rounded-2xl border border-ink-200 bg-white p-6">
          <h3 className="font-display text-lg font-semibold text-ink-950">
            O que costuma ser discutido nesse tipo de negativa
          </h3>
          <ul className="mt-3 space-y-2">
            {analise.pontosDeDiscussao.map((p) => (
              <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-ink-700">
                <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-gold-500" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analise.documentosSugeridos.length > 0 && (
        <div className="rounded-2xl border border-ink-200 bg-white p-6">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-950">
            <FileText className="h-4 w-4 text-brand-600" />
            Documentos que costumam ser relevantes
          </h3>
          <ul className="mt-3 space-y-2">
            {analise.documentosSugeridos.map((d) => (
              <li key={d} className="flex gap-2.5 text-sm text-ink-700">
                <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-brand-500" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analise.observacoes && (
        <p className="rounded-xl bg-ink-50 p-4 text-sm leading-relaxed text-ink-600">
          <strong className="text-ink-800">Observação:</strong> {analise.observacoes}
        </p>
      )}

      <div className="rounded-3xl bg-ink-950 p-8 text-white">
        <h3 className="font-display text-xl font-semibold text-balance">
          {prazo.situacao === "vencido"
            ? "Confira a data antes de decidir"
            : "Quer o recurso pronto para protocolar?"}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          {prazo.situacao === "vencido"
            ? "Como o prazo aparenta ter passado, confira a data de ciência na carta antes de comprar — ela pode ser diferente da data da decisão."
            : "Descreva o caso, anexe os documentos e receba o recurso em PDF e Word para revisar antes de enviar ao INSS."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/novo-recurso" className="btn-gold px-6 py-3">
            Gerar meu recurso <ArrowRight className="h-4 w-4" />
          </Link>
          {analise.beneficioSlug && (
            <Link
              href={`/beneficio-negado/${analise.beneficioSlug}`}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white/80 ring-1 ring-white/20 transition hover:bg-white/10"
            >
              Ler sobre {analise.beneficioNome}
            </Link>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="ghost" type="button" onClick={onRecomecar}>
          <RotateCcw className="h-4 w-4" /> Analisar outra carta
        </Button>
      </div>

      <p className="flex items-start gap-2 text-center text-xs leading-relaxed text-ink-400">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-none text-success-600" />
        <span>
          Leitura automática, informativa, feita só a partir do texto enviado. Não é
          parecer jurídico, não avalia o seu processo e não prevê resultado. Nada foi
          armazenado — sair desta página apaga a análise.
        </span>
      </p>
    </div>
  );
}
