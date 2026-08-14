import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { PossoRecorrer } from "@/components/funil/posso-recorrer";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = {
  title: "Posso recorrer do INSS? Descubra em 1 minuto, de graça",
  description:
    "Responda 3 perguntas e descubra se o prazo do seu recurso está aberto, o que costuma pesar no seu motivo de negativa e quais documentos reunir. Gratuito e sem cadastro.",
  alternates: { canonical: "/posso-recorrer" },
};

export default function PossoRecorrerPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { nome: "Início", path: "/" },
          { nome: "Posso recorrer?", path: "/posso-recorrer" },
        ])}
      />
      <Navbar />
      <main className="bg-ink-950 text-white">
        <div className="container py-14 md:py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h1 className="font-display text-4xl font-black text-balance text-white md:text-5xl">
              O INSS negou seu benefício?
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-white/70 text-pretty">
              Descubra <span className="font-semibold text-white">grátis</span> se você ainda
              pode recorrer. São 3 perguntas, leva menos de um minuto e não precisa de cadastro.
            </p>
          </div>
          <PossoRecorrer />
        </div>
      </main>
      <Footer />
    </>
  );
}
