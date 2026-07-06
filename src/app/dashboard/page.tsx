import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { FilePlus2, FileText, CheckCircle2, Clock } from "lucide-react";
import { benefitLabels } from "@/lib/validations";
import { formatDateTimeBR } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { AppealStatus, BenefitType } from "@/lib/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardHome() {
  const user = await requireUser();
  const appeals = await db.appeal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const counts = {
    total: appeals.length,
    ready: appeals.filter((a) => a.status === "READY").length,
    inProgress: appeals.filter((a) =>
      ["AWAITING_PAYMENT", "PAID", "GENERATING"].includes(a.status),
    ).length,
  };

  return (
    <div className="p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950">Olá, {user.name.split(" ")[0]}</h1>
          <p className="text-ink-600">Aqui está o resumo dos seus recursos.</p>
        </div>
        <Link href="/novo-recurso" className="btn-primary">
          <FilePlus2 className="h-4 w-4" /> Novo recurso
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard icon={FileText} label="Total de recursos" value={counts.total} />
        <StatCard icon={CheckCircle2} label="Prontos" value={counts.ready} tint="green" />
        <StatCard icon={Clock} label="Em andamento" value={counts.inProgress} tint="blue" />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink-950">Recursos recentes</h2>
        {appeals.length === 0 ? (
          <div className="card mt-4 text-center">
            <p className="text-ink-600">Você ainda não gerou nenhum recurso.</p>
            <Link href="/novo-recurso" className="btn-primary mt-4">
              Criar meu primeiro recurso
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-ink-100 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-left text-ink-600">
                <tr>
                  <th className="px-4 py-3">Criado em</th>
                  <th className="px-4 py-3">Benefício</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {appeals.map((a) => (
                  <tr key={a.id} className="hover:bg-ink-50/60">
                    <td className="px-4 py-3">{formatDateTimeBR(a.createdAt)}</td>
                    <td className="px-4 py-3">{benefitLabels[a.benefitType as BenefitType]}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status as AppealStatus} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dashboard/recursos/${a.id}`} className="text-sm font-semibold text-brand-700">
                        Abrir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: any;
  label: string;
  value: number;
  tint?: "green" | "blue" | "red";
}) {
  const color =
    tint === "green"
      ? "bg-emerald-50 text-emerald-700"
      : tint === "blue"
      ? "bg-brand-50 text-brand-700"
      : tint === "red"
      ? "bg-red-50 text-red-700"
      : "bg-ink-100 text-ink-700";
  return (
    <div className="card flex items-center gap-4">
      <div className={`grid h-10 w-10 place-items-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-ink-500">{label}</p>
        <p className="font-display text-2xl font-bold text-ink-950">{value}</p>
      </div>
    </div>
  );
}
