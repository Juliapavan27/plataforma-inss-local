import { db } from "@/lib/db";
import { formatCurrencyBRL } from "@/lib/utils";
import { Users, FileText, DollarSign, Clock3 } from "lucide-react";

export const metadata = { title: "Admin · Visão geral" };

export default async function AdminHome() {
  const [users, appeals, readyAppeals, pendingAppeals, payments] = await Promise.all([
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
  ]);

  const total = payments._sum.amountCents ?? 0;

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
