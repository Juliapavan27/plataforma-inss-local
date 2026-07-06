import { db } from "@/lib/db";
import { formatDateTimeBR } from "@/lib/utils";
import { KnowledgeEntryForm } from "@/components/admin/knowledge-form";

export const metadata = { title: "Admin · Base de conhecimento" };

export default async function KnowledgePage() {
  const entries = await db.knowledgeEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold text-ink-950">Base de conhecimento</h1>
      <p className="text-ink-600">
        Doutrina, legislação, jurisprudência e modelos usados como contexto pelo motor de IA (RAG).
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <h2 className="font-display text-lg font-semibold text-ink-950">Adicionar entrada</h2>
          <div className="mt-4">
            <KnowledgeEntryForm />
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-left text-ink-600">
                <tr>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Criado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 font-medium">{e.title}</td>
                    <td className="px-4 py-3">{e.kind}</td>
                    <td className="px-4 py-3 text-xs text-ink-500">
                      {(() => {
                        try {
                          const arr = JSON.parse(e.tagsJson) as string[];
                          return Array.isArray(arr) ? arr.join(", ") : "";
                        } catch {
                          return "";
                        }
                      })()}
                    </td>
                    <td className="px-4 py-3">{formatDateTimeBR(e.createdAt)}</td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-ink-500">
                      Nenhuma entrada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
