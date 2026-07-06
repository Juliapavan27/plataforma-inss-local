"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-ink-500 hover:bg-ink-50"
    >
      <LogOut className="h-3.5 w-3.5" /> Sair
    </button>
  );
}
