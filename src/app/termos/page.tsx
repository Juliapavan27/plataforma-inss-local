import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = { title: "Termos de uso" };

export default function TermosPage() {
  return (
    <>
      <Navbar />
      <main className="container max-w-3xl py-16 prose prose-ink">
        <h1>Termos de uso</h1>
        <p>
          Ao utilizar a Plataforma INSS, você concorda com os termos a seguir. Este
          documento pode ser atualizado a qualquer momento; alterações materiais
          serão comunicadas por e-mail.
        </p>
        <h2>1. Natureza do serviço</h2>
        <p>
          A Plataforma INSS oferece geração automatizada de peças jurídicas
          (recursos administrativos) a partir das informações fornecidas pelo
          usuário. A ferramenta <strong>não presta consultoria jurídica
          personalizada</strong> e não substitui um advogado. O usuário é o único
          responsável pela veracidade das informações prestadas e pela decisão de
          protocolar ou não o documento gerado.
        </p>
        <h2>2. Pagamento</h2>
        <p>
          O serviço é cobrado por recurso, em pagamento único processado pelo
          Stripe. A geração é iniciada após a confirmação do pagamento.
        </p>
        <h2>3. Reembolso</h2>
        <p>
          Em caso de falha técnica não sanada em até 72 horas, o usuário pode
          solicitar reembolso integral.
        </p>
        <h2>4. Limitação de responsabilidade</h2>
        <p>
          A Plataforma INSS não se responsabiliza pelo resultado do recurso
          junto ao INSS/CRPS. A decisão final é da autoridade administrativa.
        </p>
        <h2>5. Uso adequado</h2>
        <p>
          É proibido utilizar a plataforma para fraudes, falsidades ideológicas
          ou qualquer uso ilícito.
        </p>
      </main>
      <Footer />
    </>
  );
}
