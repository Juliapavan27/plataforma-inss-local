import { MessageCircle } from "lucide-react";

const DEFAULT_PHONE = "5511999999999";
const DEFAULT_MESSAGE =
  "Olá! Vi o site e tenho uma dúvida sobre o recurso do INSS.";

export function WhatsAppFloat() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? DEFAULT_PHONE;
  const message = encodeURIComponent(
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ?? DEFAULT_MESSAGE,
  );
  const href = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-24 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lift transition hover:scale-105 md:bottom-6"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40" />
      <MessageCircle className="relative h-6 w-6" />
    </a>
  );
}
