import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/password-forms";

export const metadata = { title: "Recuperar acesso" };

export default function EsqueciSenhaPage() {
  return (
    <AuthShell
      titulo="Recuperar acesso"
      subtitulo="Enviamos um link para você definir uma senha nova."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
