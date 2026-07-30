import Link from "next/link";
import { Scale } from "lucide-react";

/** Moldura das telas de autenticação — logo centralizado e cartão único. */
export function AuthShell({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/40 to-white">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 flex items-center justify-center gap-2 font-display font-bold text-ink-950"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
              <Scale className="h-5 w-5" />
            </span>
            Recurso Fácil
          </Link>
          <div className="card">
            <h1 className="font-display text-2xl font-bold text-ink-950">{titulo}</h1>
            <p className="mt-1 text-sm text-ink-600">{subtitulo}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
