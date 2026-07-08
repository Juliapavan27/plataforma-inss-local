"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "recurso-facil:chat:v1";

const INITIAL_MESSAGE: Msg = {
  role: "assistant",
  content:
    "Olá! 👋 Sou a **Sofia**, assistente da Recurso Fácil. Posso tirar suas dúvidas sobre recursos, preço, prazos ou como funciona. Como posso ajudar?",
};

const QUICK_QUESTIONS = [
  "Como funciona?",
  "Quanto custa?",
  "Qual o prazo do INSS?",
  "Meu benefício foi negado, e agora?",
];

/** Render muito simples de Markdown inline: **bold** e [texto](link) */
function renderInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  // Primeiro quebra por links [texto](url)
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  const pushBold = (chunk: string, baseKey: number) => {
    const parts = chunk.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return (
          <strong key={`b-${baseKey}-${i}`} className="font-semibold text-ink-950">
            {p.slice(2, -2)}
          </strong>
        );
      }
      return <span key={`t-${baseKey}-${i}`}>{p}</span>;
    });
  };

  while ((m = linkRe.exec(text)) !== null) {
    if (m.index > lastIndex) {
      out.push(
        <span key={`pre-${key}`}>
          {pushBold(text.slice(lastIndex, m.index), key)}
        </span>,
      );
    }
    out.push(
      <a
        key={`lnk-${key}`}
        href={m[2]}
        className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
      >
        {m[1]}
      </a>,
    );
    lastIndex = m.index + m[0].length;
    key++;
  }
  if (lastIndex < text.length) {
    out.push(
      <span key={`end-${key}`}>{pushBold(text.slice(lastIndex), key)}</span>,
    );
  }
  return out;
}

function renderMarkdown(text: string) {
  // Quebra em linhas, monta listas simples com "-" no início
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={`ul-${key++}`} className="my-1.5 list-disc space-y-1 pl-5">
          {list.map((li, i) => (
            <li key={i}>{renderInline(li)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      list.push(trimmed.slice(2));
    } else if (trimmed === "") {
      flushList();
    } else {
      flushList();
      blocks.push(
        <p key={`p-${key++}`} className="my-1">
          {renderInline(trimmed)}
        </p>,
      );
    }
  }
  flushList();
  return blocks;
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hidratação do histórico
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {}
  }, []);

  // Persistência
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto-scroll ao fim
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  // Foco no input ao abrir
  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  async function send(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          // envia até as últimas 20 mensagens para manter contexto enxuto
          messages: next.slice(-20),
        }),
      });
      const data = await res.json();
      const reply =
        typeof data?.reply === "string"
          ? data.reply
          : "Desculpe, tive um problema para responder. Tente novamente em instantes.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (!open) setUnread(true);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Desculpe, não consegui responder agora. Você pode tentar novamente ou consultar nosso [FAQ](/faq).",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function resetConversation() {
    setMessages([INITIAL_MESSAGE]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        type="button"
        aria-label={open ? "Fechar chat" : "Abrir chat"}
        onClick={() => setOpen((o) => !o)}
        className={`group fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full text-white shadow-lift transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 md:bottom-6 md:right-6 ${
          open ? "scale-90 opacity-90" : "hover:-translate-y-0.5 hover:scale-[1.03]"
        }`}
        style={{
          backgroundImage:
            "linear-gradient(135deg, #3a53ea 0%, #2232bd 60%, #0b1140 100%)",
        }}
      >
        <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/20" />
        {!open && !unread && (
          <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-brand-500/40" />
        )}
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
        {unread && !open && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-gold-500 text-[10px] font-bold text-ink-950">
            1
          </span>
        )}
      </button>

      {/* Painel */}
      <div
        aria-hidden={!open}
        className={`fixed bottom-24 right-4 z-[59] w-[calc(100vw-2rem)] max-w-[400px] origin-bottom-right transition-all duration-300 md:right-6 ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-3xl border border-ink-200/70 bg-white/95 shadow-lift backdrop-blur-xl">
          {/* Header */}
          <div
            className="relative overflow-hidden px-5 py-4 text-white"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #2232bd 0%, #0b1140 100%)",
            }}
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/20 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                <Sparkles className="h-5 w-5 text-gold-300" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-950 bg-success-500" />
              </div>
              <div className="flex-1 leading-none">
                <p className="font-display text-base font-semibold tracking-tight">
                  Sofia · IA Jurídica
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">
                  Online · Responde em segundos
                </p>
              </div>
              <button
                type="button"
                onClick={resetConversation}
                className="rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Limpar conversa"
                title="Limpar conversa"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Mensagens */}
          <div
            ref={scrollRef}
            className="flex h-[420px] flex-col gap-3 overflow-y-auto bg-ink-50/60 px-4 py-4"
          >
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} />
            ))}
            {loading && (
              <div className="flex items-center gap-2 self-start rounded-2xl rounded-bl-md border border-ink-200/70 bg-white px-4 py-3 text-sm text-ink-500 shadow-ring">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400" />
                </span>
              </div>
            )}
          </div>

          {/* Quick replies (só quando a conversa está "nova") */}
          {messages.length <= 1 && !loading && (
            <div className="flex flex-wrap gap-1.5 border-t border-ink-200/70 bg-white px-4 py-3">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-end gap-2 border-t border-ink-200/70 bg-white p-3"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              maxLength={1000}
              placeholder="Escreva sua dúvida..."
              className="max-h-32 flex-1 resize-none rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Enviar"
              className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-lift transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>

          <p className="border-t border-ink-200/70 bg-white px-4 py-2 text-center text-[10px] text-ink-400">
            A Sofia é uma IA e pode cometer erros. Não substitui consultoria jurídica.
          </p>
        </div>
      </div>
    </>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-ring ${
          isUser
            ? "rounded-br-md bg-gradient-to-br from-brand-600 to-brand-800 text-white"
            : "rounded-bl-md border border-ink-200/70 bg-white text-ink-800"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="space-y-1">{renderMarkdown(msg.content)}</div>
        )}
      </div>
    </div>
  );
}
