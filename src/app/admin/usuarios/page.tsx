import { db } from "@/lib/db";
import { formatDateTimeBR } from "@/lib/utils";

export const metadata = { title: "Admin · Usuários" };

export default async function AdminUsers() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { appeals: true } } },
  });

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold text-ink-950">Usuários</h1>

      <div className="mt-6 overflow-hidden rounded-xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-ink-600">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Recursos</th>
              <th className="px-4 py-3">Desde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-ink-900">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.role === "ADMIN" ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-700"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">{u._count.appeals}</td>
                <td className="px-4 py-3">{formatDateTimeBR(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
