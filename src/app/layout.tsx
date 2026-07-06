import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Chatbot } from "@/components/chatbot";
import { Analytics, AnalyticsNoScript } from "@/components/analytics";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: {
    default:
      "Plataforma INSS — Recursos administrativos automáticos com qualidade técnica",
    template: "%s | Plataforma INSS",
  },
  description:
    "Gere recursos administrativos contra decisões do INSS em minutos. Tecnologia jurídica de ponta, sem custos abusivos.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Plataforma INSS",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${fraunces.variable} antialiased`}
    >
      <body>
        <Analytics />
        <AnalyticsNoScript />
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
