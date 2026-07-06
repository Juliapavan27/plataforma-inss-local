import Link from "next/link";
import { redirect } from "next/navigation";
import { Scale, Users, FileText, DollarSign, BookOpen, Settings, LogOut, Home } from "lucide-react";
import { auth } from "@/lib/auth";
import { Providers } from "@/components/auth/session-provider";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <Providers>
      <div className="flex min-h-screen bg-ink-50">
        <aside className="flex w-64 flex-col border-r border-ink-100 bg-white">
          <Link href="/admin" className="flex items-center gap-2 border-b border-ink-100 px-6 py-4 font-display font-bold text-ink-950">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-900 text-white">
              <Scale className="h-4 w-4" />
            </span>
            Admin · INSS
          </Link>
          <nav className="flex-1 space-y-1 p-3 text-sm">
            <NavItem href="/admin" icon={Home}>Visão geral</NavItem>
            <NavItem href="/admin/usuarios" icon={Users}>Usuários</NavItem>
            <NavItem href="/admin/pedidos" icon={FileText}>Pedidos</NavItem>
            <NavItem href="/admin/financeiro" icon={DollarSign}>Financeiro</NavItem>
            <NavItem href="/admin/conhecimento" icon={BookOpen}>Base de conhecimento</NavItem>
            <NavItem href="/admin/config" icon={Settings}>Configurações IA</NavItem>
            <div className="my-3 border-t border-ink-100" />
            <NavItem href="/dashboard" icon={Home}>← Área do cliente</NavItem>
          </nav>
          <div className="border-t border-ink-100 p-4">
            <p className="text-xs text-ink-500">{session.user.name}</p>
            <SignOutButton />
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </Providers>
  );
}

function NavItem({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-ink-700 hover:bg-ink-50 hover:text-ink-950">
      <Icon className="h-4 w-4" /> {children}
    </Link>
  );
}
