"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, MailCheck } from "lucide-react";

/** Pede o link por e-mail. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/esqueci-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setLoading(false);
    setSent(true);
  }

  // Mesma tela com ou sem conta: a resposta do servidor é igual nos dois casos,
  // de propósito, para não revelar quem tem cadastro aqui.
  if (sent) {
    return (
      <div className="rounded-xl bg-success-50 p-6 text-center">
        <MailCheck className="mx-auto h-8 w-8 text-success-600" />
        <p className="mt-3 font-semibold text-ink-950">Confira seu e-mail</p>
        <p className="mt-2 text-sm text-ink-700">
          Se existir uma conta para <strong>{email}</strong>, o link de senha chega em
          instantes. Ele vale por 2 horas.
        </p>
        <p className="mt-4 text-xs text-ink-500">
          Não chegou? Veja a caixa de spam antes de pedir outro.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label>E-mail</Label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder="o e-mail que você usou no pedido"
        />
      </div>
      <Button className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar link"}
      </Button>
      <p className="text-center text-sm text-ink-600">
        Lembrou a senha?{" "}
        <Link href="/login" className="font-semibold text-brand-700">
          Entrar
        </Link>
      </p>
    </form>
  );
}

/** Define a senha nova e já entra na conta. */
export function SetPasswordForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("As duas senhas não são iguais.");
      return;
    }
    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/definir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível definir a senha.");
        setLoading(false);
        return;
      }

      setDone(true);
      // Já entra na conta: pedir para digitar de novo o que acabou de criar é
      // atrito à toa.
      await signIn("credentials", { email, password, redirect: false });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl bg-success-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-success-600" />
        <p className="mt-3 font-semibold text-ink-950">Senha criada</p>
        <p className="mt-2 text-sm text-ink-700">Levando você para a sua área…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="rounded-xl bg-ink-50 p-3 text-sm text-ink-700">
        Definindo a senha de <strong>{email}</strong>
      </p>
      <div>
        <Label>Nova senha</Label>
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="mt-1 text-xs text-ink-500">Pelo menos 8 caracteres.</p>
      </div>
      <div>
        <Label>Repita a senha</Label>
        <Input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          type="password"
          required
          autoComplete="new-password"
        />
      </div>
      <FieldError>{error}</FieldError>
      <Button className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar e entrar"}
      </Button>
    </form>
  );
}
