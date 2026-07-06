import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { benefitLabels } from "@/lib/validations";
import { formatDateTimeBR } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { AppealStatus, BenefitType } from "@/lib/types";
import { FilePlus2 } from "lucide-react";

export const metadata = { title: "Meus recursos" };

export default async function ListPage() {
  const user = await requireUser();
  const appeals = await db.appeal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-start justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-950">Meus recursos</h1>
        <Link href="/novo-recurso" className="btn-primary">
          <FilePlus2 className="h-4 w-4" /> Novo recurso
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-ink-100 bg-white">
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
                  <Link href={`/dashboard/recursos/${a.id}`} className="font-semibold text-brand-700">
                    Abrir →
                  </Link>
                </td>
              </tr>
            ))}
            {appeals.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink-500">
                  Nenhum recurso ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
