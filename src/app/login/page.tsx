import Link from "next/link";
import { Suspense } from "react";
import { Scale } from "lucide-react";
import { LoginForm } from "@/components/auth/auth-forms";
import { Providers } from "@/components/auth/session-provider";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <Providers>
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
              Plataforma INSS
            </Link>
            <div className="card">
              <h1 className="font-display text-2xl font-bold text-ink-950">Bem-vindo de volta</h1>
              <p className="mt-1 text-sm text-ink-600">Acesse sua área do cliente</p>
              <div className="mt-6">
          <Suspense fallback={null}><LoginForm /></Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Providers>
  );
}
