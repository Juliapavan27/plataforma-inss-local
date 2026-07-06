"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const KINDS = [
  "JURISPRUDENCIA",
  "DOUTRINA",
  "LEGISLACAO",
  "MODELO_RECURSO",
  "OUTRO",
] as const;

export function KnowledgeEntryForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("JURISPRUDENCIA");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/conhecimento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        kind,
        content,
        sourceUrl: sourceUrl || null,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Erro ao salvar");
      return;
    }
    setTitle("");
    setContent("");
    setTags("");
    setSourceUrl("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-sm">
      <div>
        <Label>Título</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label>Tipo</Label>
        <select
          className="input"
          value={kind}
          onChange={(e) => setKind(e.target.value as any)}
        >
          {KINDS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Tags (separadas por vírgula)</Label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="AUXILIO_DOENCA, AUSENCIA_INCAPACIDADE"
        />
      </div>
      <div>
        <Label>Conteúdo</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Texto da súmula, trecho doutrinário, acórdão, modelo de peça…"
          required
        />
      </div>
      <div>
        <Label>URL de origem (opcional)</Label>
        <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
      </div>
      <FieldError>{error}</FieldError>
      <Button disabled={loading} className="w-full">
        {loading ? "Salvando…" : "Salvar entrada"}
      </Button>
    </form>
  );
}
