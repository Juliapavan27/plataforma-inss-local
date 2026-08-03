import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { NotaFiscalCard } from "@/components/admin/nota-fiscal-card";
import {
  blocoParaCopiar,
  montarEndereco,
  diasDesde,
  PRAZO_ALERTA_DIAS,
  DESCRICAO_SERVICO_PADRAO,
  NF_LABELS,
  type NfStatus,
} from "@/lib/nota-fiscal";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { FileText, AlertTriangle, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notas fiscais" };

/**
 * Fila de emissão de NFS-e.
 *
 * A emissão é feita à mão no portal da prefeitura de Ribeirão Preto. Esta tela
 * não emite nada — ela existe para que nenhuma venda paga fique sem nota, que
 * é o risco real de um controle manual.
 */
export default async function NotasFiscaisPage() {
  await requireAdmin();

  const pagos = await db.payment.findMany({
    where: { status: "PAID" },
    include: { user: true, appeal: true },
    orderBy: { paidAt: "asc" },
  });

  const cancelar = pagos.filter((p) => p.nfStatus === "CANCELAR");
  const pendentes = pagos.filter((p) => p.nfStatus === "PENDENTE");
  const resolvidos = pagos.filter(
    (p) => !["PENDENTE", "CANCELAR"].includes(p.nfStatus),
  );

  const atrasadas = pendentes.filter(
    (p) => p.paidAt && diasDesde(p.paidAt) > PRAZO_ALERTA_DIAS,
  ).length;

  function dadosDe(p: (typeof pagos)[number]) {
    return blocoParaCopiar({
      nome: p.user.name,
      cpf: (p.user as any).cpf ?? null,
      email: p.user.email,
      endereco: montarEndereco(p.user as any),
      cep: p.user.cep ?? null,
      valorCents: p.amountCents,
      pagoEm: p.paidAt,
      descricaoServico: DESCRICAO_SERVICO_PADRAO,
    });
  }

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950">Notas fiscais</h1>
          <p className="mt-1 text-sm text-ink-600">
            Emissão manual no portal da prefeitura. Aqui ficam as vendas pagas que ainda
            não têm nota registrada.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Kpi
          icon={FileText}
          label="A emitir"
          valor={pendentes.length}
          destaque={pendentes.length > 0}
        />
        <Kpi
          icon={AlertTriangle}
          label={`Passaram de ${PRAZO_ALERTA_DIAS} dias`}
          valor={atrasadas}
          destaque={atrasadas > 0}
          tom="amber"
        />
        <Kpi
          icon={AlertTriangle}
          label="A cancelar"
          valor={cancelar.length}
          destaque={cancelar.length > 0}
          tom="red"
        />
      </div>

      {cancelar.length > 0 && (
        <Secao titulo="Notas a cancelar na prefeitura">
          {cancelar.map((p) => (
            <NotaFiscalCard
              key={p.id}
              paymentId={p.id}
              status={p.nfStatus as NfStatus}
              numero={p.nfNumero}
              observacao={p.nfObservacao}
              bloco={dadosDe(p)}
              diasDesdePagamento={p.paidAt ? diasDesde(p.paidAt) : 0}
              atrasada={false}
            />
          ))}
        </Secao>
      )}

      <Secao titulo={`A emitir (${pendentes.length})`}>
        {pendentes.length === 0 ? (
          <p className="flex items-center gap-2 rounded-xl bg-success-50 p-5 text-sm text-success-700">
            <CheckCircle2 className="h-4 w-4" />
            Nenhuma venda pendente de nota.
          </p>
        ) : (
          pendentes.map((p) => (
            <NotaFiscalCard
              key={p.id}
              paymentId={p.id}
              status={p.nfStatus as NfStatus}
              numero={p.nfNumero}
              observacao={p.nfObservacao}
              bloco={dadosDe(p)}
              diasDesdePagamento={p.paidAt ? diasDesde(p.paidAt) : 0}
              atrasada={Boolean(p.paidAt && diasDesde(p.paidAt) > PRAZO_ALERTA_DIAS)}
            />
          ))
        )}
      </Secao>

      {resolvidos.length > 0 && (
        <Secao titulo={`Já resolvidas (${resolvidos.length})`}>
          <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Pago em</th>
                  <th className="px-4 py-3">Situação</th>
                  <th className="px-4 py-3">NF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {resolvidos.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-ink-800">{p.user.name}</td>
                    <td className="px-4 py-3">{formatCurrencyBRL(p.amountCents)}</td>
                    <td className="px-4 py-3">{formatDateBR(p.paidAt)}</td>
                    <td className="px-4 py-3">{NF_LABELS[p.nfStatus as NfStatus]}</td>
                    <td className="px-4 py-3 text-ink-600">{p.nfNumero ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Secao>
      )}
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-lg font-semibold text-ink-950">{titulo}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Kpi({
  icon: Icon,
  label,
  valor,
  destaque,
  tom = "brand",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  valor: number;
  destaque?: boolean;
  tom?: "brand" | "amber" | "red";
}) {
  const cores = {
    brand: "text-brand-600",
    amber: "text-amber-600",
    red: "text-red-600",
  }[tom];
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
        <Icon className={`h-4 w-4 ${destaque ? cores : "text-ink-300"}`} />
        {label}
      </p>
      <p
        className={`mt-2 font-display text-3xl font-bold ${destaque ? "text-ink-950" : "text-ink-300"}`}
      >
        {valor}
      </p>
    </div>
  );
}
