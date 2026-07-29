import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

/**
 * CSRF: para métodos mutativos em /api/*, exige que `Origin` (ou `Referer`)
 * combine com o host da requisição. Webhooks externos são isentos — Stripe
 * valida por assinatura HMAC própria; InfinitePay não tem assinatura, então
 * o handler reconfirma cada pagamento via payment_check antes de confiar.
 */
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const CSRF_EXEMPT_PREFIXES = [
  "/api/webhooks/",
  "/api/cron/", // protegido por CRON_SECRET próprio
];

/**
 * Hosts aceitos como origem de requisições mutativas.
 *
 * Não dá para comparar apenas com o header `Host`: em produção o site é servido
 * por um Worker do Cloudflare que troca o Host para o endereço interno da Railway
 * (necessário porque a Railway nunca validou o domínio customizado). Sem esta
 * lista, toda submissão de formulário no domínio público seria barrada por CSRF.
 */
function allowedHosts(req: NextRequest): Set<string> {
  const hosts = new Set<string>();

  // O host da própria requisição (acesso direto pelo endereço da Railway, e dev local).
  const host = req.headers.get("host");
  if (host) hosts.add(host);

  // O domínio público configurado, com e sem "www".
  const appUrl = process.env.APP_URL;
  if (appUrl) {
    try {
      const h = new URL(appUrl).host;
      hosts.add(h);
      hosts.add(h.startsWith("www.") ? h.slice(4) : `www.${h}`);
    } catch {
      // APP_URL malformada — ignora e segue com os demais hosts.
    }
  }

  return hosts;
}

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const permitidos = allowedHosts(req);
  if (permitidos.size === 0) return false;
  try {
    if (origin) return permitidos.has(new URL(origin).host);
    if (referer) return permitidos.has(new URL(referer).host);
  } catch {
    return false;
  }
  return false;
}

const authMiddleware = withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ token, req }) {
      if (req.nextUrl.pathname.startsWith("/admin")) {
        return token?.role === "ADMIN";
      }
      return !!token;
    },
  },
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CSRF apenas para /api mutativos não-isentos.
  if (
    pathname.startsWith("/api/") &&
    MUTATING.has(req.method) &&
    !CSRF_EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    if (!isSameOrigin(req)) {
      return new NextResponse(
        JSON.stringify({ error: "Requisição bloqueada (CSRF)." }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
    return NextResponse.next();
  }

  // Páginas protegidas → delega para NextAuth.
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    // @ts-expect-error – withAuth aceita NextRequest em runtime.
    return authMiddleware(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/admin/:path*"],
};
