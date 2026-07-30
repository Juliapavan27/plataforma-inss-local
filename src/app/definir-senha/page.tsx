import Link from "next/link";
import { Providers } from "@/components/auth/session-provider";
import { SetPasswordForm } from "@/components/auth/password-forms";
import { AuthShell } from "@/components/auth/auth-shell";
import { peekPasswordResetToken } from "@/lib/password-reset";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Definir senha", robots: { index: false, follow: false } };

export default async function DefinirSenhaPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? "";
  const userId = token ? await peekPasswordResetToken(token) : null;

  // Link inválido morre aqui, no servidor: o formulário nem chega a aparecer.
  if (!userId) {
    return (
      <AuthShell titulo="Link inválido" subtitulo="Este link expirou ou já foi usado.">
        <p className="text-sm text-ink-600">
          Por segurança, o link vale por 2 horas e só pode ser usado uma vez.
        </p>
        <Link href="/esqueci-senha" className="btn-primary mt-5 w-full justify-center">
          Pedir um link novo
        </Link>
      </AuthShell>
    );
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, passwordSetAt: true },
  });
  if (!user) {
    return (
      <AuthShell titulo="Link inválido" subtitulo="Não encontramos esta conta.">
        <Link href="/esqueci-senha" className="btn-primary mt-2 w-full justify-center">
          Pedir um link novo
        </Link>
      </AuthShell>
    );
  }

  const primeiraVez = user.passwordSetAt === null;

  return (
    <Providers>
      <AuthShell
        titulo={primeiraVez ? "Crie sua senha" : "Nova senha"}
        subtitulo={
          primeiraVez
            ? "Sua conta já existe — falta só a senha para você entrar."
            : "Escolha uma senha nova para a sua conta."
        }
      >
        <SetPasswordForm token={token} email={user.email} />
      </AuthShell>
    </Providers>
  );
}
