import { db } from "@/lib/db";
import { formatCurrencyBRL } from "@/lib/utils";
import Link from "next/link";
import { Users, FileText, DollarSign, Clock3, Receipt, AlertTriangle } from "lucide-react";
import { diasDesde, PRAZO_ALERTA_DIAS } from "@/lib/nota-fiscal";

export const metadata = { title: "Admin · Visão geral" };

export default async function AdminHome() {
  const [users, appeals, readyAppeals, pendingAppeals, payments, notasAbertas] = await Promise.all([
    db.user.count(),
    db.appeal.count(),
    db.appeal.count({ where: { status: "READY" } }),
    db.appeal.count({
      where: { status: { in: ["AWAITING_PAYMENT", "PAID", "GENERATING"] } },
    }),
    db.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amountCents: true },
    }),
    db.payment.findMany({
      where: { nfStatus: { in: ["PENDENTE", "CANCELAR"] }, status: { in: ["PAID", "REFUNDED"] } },
      select: { nfStatus: true, paidAt: true },
    }),
  ]);

  const total = payments._sum.amountCents ?? 0;
  const nfPendentes = notasAbertas.filter((n) => n.nfStatus === "PENDENTE").length;
  const nfCancelar = notasAbertas.filter((n) => n.nfStatus === "CANCELAR").length;
  const nfAtrasadas = notasAbertas.filter(
    (n) => n.nfStatus === "PENDENTE" && n.paidAt && diasDesde(n.paidAt) > PRAZO_ALERTA_DIAS,
  ).length;

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold text-ink-950">Visão geral</h1>
      <p className="text-ink-600">Métricas operacionais da plataforma.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Kpi icon={Users} label="Usuários" value={users} />
        <Kpi icon={FileText} label="Recursos gerados" value={readyAppeals} sub={`${appeals} no total`} />
        <Kpi icon={DollarSign} label="Receita acumulada" value={formatCurrencyBRL(total)} />
        <Kpi icon={Clock3} label="Em andamento" value={pendingAppeals} />
      </div>

      {/* Aviso, e não KPI: nota atrasada é coisa a fazer, não número a olhar. */}
      {(nfPendentes > 0 || nfCancelar > 0) && (
        <Link
          href="/admin/notas-fiscais"
          className={`mt-6 flex items-start gap-3 rounded-xl border p-5 transition hover:shadow-soft ${
            nfCancelar > 0 || nfAtrasadas > 0
              ? "border-amber-200 bg-amber-50"
              : "border-ink-200 bg-white"
          }`}
        >
          {nfCancelar > 0 || nfAtrasadas > 0 ? (
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
          ) : (
            <Receipt className="mt-0.5 h-5 w-5 flex-none text-brand-600" />
          )}
          <span>
            <span className="block font-semibold text-ink-950">
              {nfCancelar > 0
                ? `${nfCancelar} nota${nfCancelar > 1 ? "s" : ""} para cancelar na prefeitura`
                : `${nfPendentes} nota${nfPendentes > 1 ? "s" : ""} fiscal${nfPendentes > 1 ? "is" : ""} a emitir`}
            </span>
            <span className="mt-0.5 block text-sm text-ink-600">
              {/* Quando o título é sobre cancelar, as pendentes viram informação
                  separada — juntar as duas contagens numa frase só confunde. */}
              {nfCancelar > 0 && nfPendentes > 0 && (
                <>
                  Também há {nfPendentes} a emitir
                  {nfAtrasadas > 0 &&
                    `, ${nfAtrasadas === 1 ? "sendo 1 que passou" : `sendo ${nfAtrasadas} que passaram`} de ${PRAZO_ALERTA_DIAS} dias`}
                  .{" "}
                </>
              )}
              {nfCancelar === 0 && nfAtrasadas > 0 && (
                <>
                  {nfAtrasadas === 1
                    ? `1 passou de ${PRAZO_ALERTA_DIAS} dias desde o pagamento`
                    : `${nfAtrasadas} passaram de ${PRAZO_ALERTA_DIAS} dias desde o pagamento`}
                  .{" "}
                </>
              )}
              Abrir a fila de emissão →
            </span>
          </span>
        </Link>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub }: { icon: any; label: string; value: number | string; sub?: string }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-sm text-ink-500">{label}</p>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-ink-950">{value}</p>
      {sub && <p className="text-xs text-ink-500">{sub}</p>}
    </div>
  );
}
