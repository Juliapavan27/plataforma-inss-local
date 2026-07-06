import { db } from "@/lib/db";
import { formatCurrencyBRL, formatDateTimeBR } from "@/lib/utils";

export const metadata = { title: "Admin · Financeiro" };

export default async function AdminFinance() {
  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
    take: 200,
  });

  const byStatus = payments.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + p.amountCents;
    return acc;
  }, {});

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold text-ink-950">Financeiro</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {(["PAID", "PENDING", "FAILED", "REFUNDED"] as const).map((s) => (
          <div key={s} className="card">
            <p className="text-xs text-ink-500">{s}</p>
            <p className="mt-2 font-display text-2xl font-bold text-ink-950">
              {formatCurrencyBRL(byStatus[s] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-ink-600">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Stripe Session</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">{formatDateTimeBR(p.createdAt)}</td>
                <td className="px-4 py-3">{p.user.email}</td>
                <td className="px-4 py-3">{formatCurrencyBRL(p.amountCents)}</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3 text-xs text-ink-500">{p.stripeSessionId ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
