import Link from "next/link";
import { redirect } from "next/navigation";
import { Scale, Home, FilePlus2, LogOut, FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { Providers } from "@/components/auth/session-provider";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  const isAdmin = session.user.role === "ADMIN";

  return (
    <Providers>
      <div className="flex min-h-screen bg-ink-50">
        <aside className="flex w-64 flex-col border-r border-ink-100 bg-white">
          <Link
            href="/"
            className="flex items-center gap-2 border-b border-ink-100 px-6 py-4 font-display font-bold text-ink-950"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
              <Scale className="h-4 w-4" />
            </span>
            Plataforma INSS
          </Link>
          <nav className="flex-1 space-y-1 p-3 text-sm">
            <NavLink href="/dashboard" icon={Home}>Início</NavLink>
            <NavLink href="/dashboard/recursos" icon={FileText}>Meus recursos</NavLink>
            <NavLink href="/novo-recurso" icon={FilePlus2}>Novo recurso</NavLink>
            {isAdmin && (
              <>
                <div className="my-3 border-t border-ink-100" />
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                  Administração
                </p>
                <NavLink href="/admin" icon={Home}>Painel admin</NavLink>
              </>
            )}
          </nav>
          <div className="border-t border-ink-100 p-4">
            <p className="text-xs text-ink-500">Logado como</p>
            <p className="truncate text-sm font-semibold text-ink-900">
              {session.user.name}
            </p>
            <SignOutButton />
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </Providers>
  );
}

function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-ink-700 transition hover:bg-brand-50 hover:text-brand-800"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
