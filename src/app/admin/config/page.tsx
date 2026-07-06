import { db } from "@/lib/db";
import { formatDateTimeBR } from "@/lib/utils";

export const metadata = { title: "Admin · Configurações IA" };

export default async function ConfigPage() {
  const logs = await db.generationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold text-ink-950">Configurações do motor de IA</h1>

      <div className="mt-6 card">
        <h2 className="font-display text-lg font-semibold text-ink-950">Modelos em uso</h2>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <Field label="Modelo principal (drafting)" value="claude-opus-4-6" />
          <Field label="Modelo scoring" value="claude-haiku-4-5-20251001" />
          <Field label="ANTHROPIC_API_KEY" value={process.env.ANTHROPIC_API_KEY ? "✅ configurada" : "❌ não configurada"} />
          <Field label="RAG" value="Tags-based (pgvector opcional)" />
        </dl>
        <p className="mt-3 text-xs text-ink-500">
          Para editar modelo/temperatura/prompt, altere <code className="rounded bg-ink-100 px-1">src/lib/ai/prompts.ts</code>.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink-950">Logs de geração (últimos 50)</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-ink-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-ink-600">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Recurso</th>
                <th className="px-4 py-3">Fase</th>
                <th className="px-4 py-3">Modelo</th>
                <th className="px-4 py-3">Tokens</th>
                <th className="px-4 py-3">Duração</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3">{formatDateTimeBR(l.createdAt)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.appealId.slice(0, 8)}</td>
                  <td className="px-4 py-3">{l.phase}</td>
                  <td className="px-4 py-3">{l.model ?? "—"}</td>
                  <td className="px-4 py-3">
                    {l.promptTokens ? `${l.promptTokens}/${l.outputTokens}` : "—"}
                  </td>
                  <td className="px-4 py-3">{l.durationMs ? `${l.durationMs}ms` : "—"}</td>
                  <td className="px-4 py-3">
                    {l.success ? (
                      <span className="text-emerald-600">OK</span>
                    ) : (
                      <span className="text-red-600">{l.errorMessage}</span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink-500">
                    Nenhum log ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-ink-500">{label}</dt>
      <dd className="font-mono text-ink-900">{value}</dd>
    </div>
  );
}
