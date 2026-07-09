"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label, FieldError } from "@/components/ui/input";
import { Loader2, UploadCloud } from "lucide-react";

export function AdminFinalizeForm({ appealId }: { appealId: string }) {
  const router = useRouter();
  const [pdf, setPdf] = useState<File | null>(null);
  const [docx, setDocx] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pdf || !docx) {
      setError("Selecione o PDF e o DOCX finais.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("pdf", pdf);
      form.set("docx", docx);
      const res = await fetch(`/api/admin/recursos/${appealId}/finalizar`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Falha ao finalizar");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div>
        <Label>PDF final</Label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
          className="input"
        />
      </div>
      <div>
        <Label>DOCX final</Label>
        <input
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setDocx(e.target.files?.[0] ?? null)}
          className="input"
        />
      </div>
      <FieldError>{error}</FieldError>
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="h-4 w-4" />
        )}
        Marcar como pronto e notificar cliente
      </button>
    </form>
  );
}
