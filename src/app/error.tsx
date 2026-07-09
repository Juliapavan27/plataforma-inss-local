"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app.error]", error.digest ?? "unknown");
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-neutral-50">
      <div className="max-w-md w-full text-center">
        <p className="text-sm font-medium text-neutral-500">
          Erro {error.digest ? `#${error.digest}` : ""}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-neutral-900">
          Algo deu errado
        </h1>
        <p className="mt-3 text-neutral-600">
          Encontramos um problema ao processar sua solicitação. Nossa equipe foi
          notificada.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-md bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-md border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-white"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
