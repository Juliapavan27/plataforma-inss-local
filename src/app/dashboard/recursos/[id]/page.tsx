import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { benefitLabels, denialLabels } from "@/lib/validations";
import { formatDateBR, formatDateTimeBR } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { AppealDetailClient } from "@/components/dashboard/appeal-detail-client";
import type { AppealStatus, BenefitType, DenialReason } from "@/lib/types";
import { Download, FileText, RefreshCw } from "lucide-react";

export default async function AppealDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  const appeal = await db.appeal.findUnique({
    where: { id: params.id },
    include: { documents: true, payment: true },
  });
  if (!appeal) notFound();
  if (appeal.userId !== user.id && user.role !== "ADMIN") notFound();

  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/recursos" className="text-sm text-ink-500 hover:text-ink-900">
            ← Meus recursos
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink-950">
            {benefitLabels[appeal.benefitType as BenefitType]}
          </h1>
          <p className="text-ink-600">
            Criado em {formatDateTimeBR(appeal.createdAt)} ·{" "}
            <StatusBadge status={appeal.status as AppealStatus} />
          </p>
        </div>
        {appeal.status === "READY" && (
          <div className="flex gap-2">
            <a
              href={`/api/recursos/${appeal.id}/download?format=pdf`}
              className="btn-secondary"
            >
              <Download className="h-4 w-4" /> PDF
            </a>
            <a
              href={`/api/recursos/${appeal.id}/download?format=docx`}
              className="btn-primary"
            >
              <FileText className="h-4 w-4" /> Word (.docx)
            </a>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card">
            <h2 className="font-display text-lg font-semibold text-ink-950">
              Resumo do caso
            </h2>
            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <Info label="Benefício">{benefitLabels[appeal.benefitType as BenefitType]}</Info>
              <Info label="Motivo da negativa">{denialLabels[appeal.denialReason as DenialReason]}</Info>
              <Info label="Data do indeferimento">{formatDateBR(appeal.denialDate)}</Info>
              <Info label="Protocolo INSS">{appeal.inssProtocolo ?? "—"}</Info>
              <Info label="Nº do benefício">{appeal.beneficioNumero ?? "—"}</Info>
            </dl>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase text-ink-500">Relato</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink-800">
                {appeal.caseSummary}
              </p>
            </div>
          </section>

          <section className="card">
            <h2 className="font-display text-lg font-semibold text-ink-950">
              Recurso gerado
            </h2>
            <AppealDetailClient
              id={appeal.id}
              status={appeal.status as AppealStatus}
              generatedText={appeal.generatedText}
            />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card">
            <p className="font-semibold text-ink-900">Documentos anexados</p>
            {appeal.documents.length === 0 ? (
              <p className="mt-2 text-sm text-ink-500">Nenhum documento ainda.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {appeal.documents.map((d) => (
                  <li key={d.id} className="flex items-center justify-between">
                    <span className="truncate">{d.filename}</span>
                    <span className="text-xs text-ink-500">{d.kind}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-ink-500">{label}</dt>
      <dd className="text-ink-900">{children}</dd>
    </div>
  );
}
