import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, webSiteSchema } from "@/lib/schema";
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
    // Quem busca não pesquisa "recurso administrativo" — pesquisa "benefício
    // negado", "auxílio-doença negado", "INSS indeferiu". O título precisa
    // falar a língua da busca, não a do produto.
    default:
      "Benefício negado pelo INSS? Recorra em até 24h — Recurso Fácil",
    template: "%s | Recurso Fácil",
  },
  description:
    "Teve auxílio-doença, BPC/LOAS, aposentadoria ou pensão negados pelo INSS? Monte seu recurso administrativo em PDF e Word, pronto para protocolar. Você tem 30 dias para recorrer.",
  keywords: [
    "benefício negado INSS",
    "auxílio-doença negado",
    "BPC LOAS negado",
    "aposentadoria negada",
    "como recorrer do INSS",
    "recurso administrativo INSS",
    "INSS indeferiu meu pedido",
    "carta de indeferimento INSS",
  ],
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
        {/* Organization + WebSite valem para o site inteiro, então ficam aqui. */}
        <JsonLd data={[organizationSchema(), webSiteSchema()]} />
        <Analytics />
        <AnalyticsNoScript />
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
