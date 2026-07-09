"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
          backgroundColor: "#fafafa",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#737373" }}>
            Erro crítico {error.digest ? `#${error.digest}` : ""}
          </p>
          <h1 style={{ marginTop: 8, fontSize: 28, color: "#171717" }}>
            Algo deu errado
          </h1>
          <p style={{ marginTop: 12, color: "#525252" }}>
            Tente recarregar a página. Se o problema persistir, entre em contato
            com nosso suporte.
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              marginTop: 24,
              padding: "0.5rem 1rem",
              borderRadius: 6,
              backgroundColor: "#171717",
              color: "#fff",
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            Voltar ao início
          </a>
        </div>
      </body>
    </html>
  );
}
