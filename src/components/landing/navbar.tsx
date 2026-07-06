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
          ? "border-b border-ink-200/60 bg-ink-50/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="container flex h-[72px] items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl shadow-lift ring-1 ring-ink-950/10">
            <span className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-950" />
            <span className="absolute inset-0 bg-noise opacity-60" />
            <Scale className="relative h-5 w-5 text-white" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[17px] font-semibold tracking-tight text-ink-950">
              Plataforma INSS
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500">
              Recursos jurídicos · IA
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/#como-funciona" className="text-sm font-medium text-ink-700 hover:text-ink-950">
            Como funciona
          </Link>
          <Link href="/quem-somos" className="text-sm font-medium text-ink-700 hover:text-ink-950">
            Quem somos
          </Link>
          <Link href="/blog" className="text-sm font-medium text-ink-700 hover:text-ink-950">
            Blog
          </Link>
          <Link href="/faq" className="text-sm font-medium text-ink-700 hover:text-ink-950">
            FAQ
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="btn-ghost">
            Entrar
          </Link>
          <Link href="/novo-recurso" className="btn-primary">
            Gerar recurso
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-ink-200 bg-white/70 text-ink-900 backdrop-blur md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-200/60 bg-ink-50/95 backdrop-blur-xl md:hidden">
          <div className="container flex flex-col gap-1 py-4">
            <Link href="/#como-funciona" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-white">
              Como funciona
            </Link>
            <Link href="/quem-somos" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-white">
              Quem somos
            </Link>
            <Link href="/blog" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-white">
              Blog
            </Link>
            <Link href="/faq" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-white">
              FAQ
            </Link>
            <div className="mt-2 flex flex-col gap-2 border-t border-ink-200/60 pt-3">
              <Link href="/login" onClick={() => setOpen(false)} className="btn-secondary w-full">
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
