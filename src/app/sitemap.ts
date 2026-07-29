import type { MetadataRoute } from "next";
import { guias } from "@/content/guias";

/**
 * Sitemap das páginas públicas. Áreas autenticadas (/dashboard, /admin) e a API
 * ficam de fora — já estão bloqueadas em robots.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();

  const paginas: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/novo-recurso", priority: 0.9 },
    { path: "/calculadora", priority: 0.8 },
    { path: "/guias", priority: 0.8 },
    { path: "/tutorial", priority: 0.7 },
    { path: "/faq", priority: 0.7 },
    { path: "/contato", priority: 0.6 },
    { path: "/quem-somos", priority: 0.5 },
    { path: "/termos", priority: 0.3 },
    { path: "/privacidade", priority: 0.3 },
    { path: "/lgpd", priority: 0.3 },
  ];

  return [
    ...paginas.map((p) => ({
      url: `${base}${p.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p.priority,
    })),
    ...guias.map((g) => ({
      url: `${base}/guias/${g.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
