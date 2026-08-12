"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Revela o conteúdo conforme a pessoa rola a página (fade + sobe).
 *
 * Existe para o público de tráfego: mais velho, visual, que precisa de página
 * viva. A informação "surgindo" prende a atenção e dá ritmo à leitura, em vez
 * de despejar tudo de uma vez. Usa IntersectionObserver — anima uma vez e para.
 *
 * Respeita `prefers-reduced-motion`: quem pediu menos animação recebe o
 * conteúdo já visível, sem movimento.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduz =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // Sem suporte a IntersectionObserver (ou reduced-motion): mostra já. Conteúdo
    // NUNCA pode ficar preso invisível por falha de JS.
    if (reduz || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
