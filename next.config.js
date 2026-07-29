/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const isProd = process.env.NODE_ENV === "production";

// CSP: liberal o suficiente para Next.js + Stripe + GTM/GA4/Meta Pixel
// (analytics em layout.tsx). Em dev permite 'unsafe-eval' para hot reload.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com https://*.stripe.com https://checkout.infinitepay.io",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  // *.ingest.sentry.io / *.ingest.us.sentry.io cobrem os hosts de ingestão mais comuns do
  // Sentry — se o DSN do projeto usar outra região, ajuste aqui.
  "connect-src 'self' https://api.stripe.com https://api.checkout.infinitepay.io https://viacep.com.br https://www.google-analytics.com https://*.facebook.com https://*.facebook.net https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://checkout.infinitepay.io",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
    // Necessário no Next 14.2 para o instrumentation.ts (Sentry) ser carregado —
    // vira padrão (sem flag) a partir do Next 15.
    instrumentationHook: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

// withSentryConfig é no-op sensato mesmo sem SENTRY_AUTH_TOKEN: só pula o
// upload de source maps (build/app continuam funcionando normalmente).
module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  disableLogger: true,
});
