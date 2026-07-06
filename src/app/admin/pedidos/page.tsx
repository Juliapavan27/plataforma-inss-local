import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateTimeBR } from "@/lib/utils";
import { benefitLabels } from "@/lib/validations";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { AppealStatus, BenefitType } from "@/lib/types";

export const metadata = { title: "Admin · Pedidos" };

export default async function AdminOrders() {
  const appeals = await db.appeal.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
    take: 200,
  });

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold text-ink-950">Pedidos</h1>
      <div className="mt-6 overflow-hidden rounded-xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-ink-600">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Benefício</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {appeals.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">{formatDateTimeBR(a.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{a.user.name}</div>
                  <div className="text-xs text-ink-500">{a.user.email}</div>
                </td>
                <td className="px-4 py-3">{benefitLabels[a.benefitType as BenefitType]}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status as AppealStatus} /></td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/recursos/${a.id}`} className="text-brand-700 font-semibold">
                    Abrir →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
