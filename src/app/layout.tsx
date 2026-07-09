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
      "Recurso Fácil — Recursos administrativos com qualidade técnica",
    template: "%s | Recurso Fácil",
  },
  description:
    "Gere seu recurso administrativo contra decisões do INSS com entrega em até 24h. Fundamentação jurídica técnica, sem custos abusivos.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Recurso Fácil",
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
