"use client";

import Link from "next/link";
import { Scale, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-ink-950/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="container flex h-[72px] items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl shadow-lift ring-1 ring-white/15">
            <span className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800" />
            <span className="absolute inset-0 bg-noise opacity-60" />
            <Scale className="relative h-5 w-5 text-white" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[17px] font-semibold tracking-tight text-white">
              Recurso Fácil
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/50">
              Recursos jurídicos previdenciários
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/beneficio-negado" className="text-sm font-medium text-white/70 hover:text-white">
            Benefício negado
          </Link>
          <Link href="/#como-funciona" className="text-sm font-medium text-white/70 hover:text-white">
            Como funciona
          </Link>
          <Link href="/quem-somos" className="text-sm font-medium text-white/70 hover:text-white">
            Quem somos
          </Link>
          <Link href="/calculadora" className="text-sm font-medium text-white/70 hover:text-white">
            Calculadora
          </Link>
          <Link href="/guias" className="text-sm font-medium text-white/70 hover:text-white">
            Guias
          </Link>
          <Link href="/tutorial" className="text-sm font-medium text-white/70 hover:text-white">
            Tutorial
          </Link>
          <Link href="/faq" className="text-sm font-medium text-white/70 hover:text-white">
            FAQ
          </Link>
          <Link href="/contato" className="text-sm font-medium text-white/70 hover:text-white">
            Contato
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm font-medium text-white/70 transition hover:text-white">
            Entrar
          </Link>
          <Link href="/novo-recurso" className="btn-primary">
            Gerar recurso
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-white backdrop-blur md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-ink-950/95 backdrop-blur-xl md:hidden">
          <div className="container flex flex-col gap-1 py-4">
            <Link href="/beneficio-negado" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10">
              Benefício negado
            </Link>
            <Link href="/#como-funciona" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10">
              Como funciona
            </Link>
            <Link href="/quem-somos" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10">
              Quem somos
            </Link>
            <Link href="/calculadora" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10">
              Calculadora
            </Link>
            <Link href="/guias" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10">
              Guias
            </Link>
            <Link href="/tutorial" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10">
              Tutorial
            </Link>
            <Link href="/faq" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10">
              FAQ
            </Link>
            <Link href="/contato" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10">
              Contato
            </Link>
            <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
              <Link href="/login" onClick={() => setOpen(false)} className="w-full rounded-full border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white/90 hover:bg-white/10">
                Entrar
              </Link>
              <Link href="/novo-recurso" onClick={() => setOpen(false)} className="btn-primary w-full">
                Gerar recurso
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
