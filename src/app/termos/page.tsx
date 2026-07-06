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
        <h2>6. Propriedade intelectual</h2>
        <p>
          O código-fonte, os fluxos de geração, os modelos de prompt, a base de
          conhecimento jurídico, a marca "Plataforma INSS" e todo o conteúdo do
          site são de propriedade exclusiva da plataforma e protegidos por
          direito autoral e demais normas de propriedade intelectual aplicáveis.
          É expressamente proibido, sem autorização prévia por escrito:
        </p>
        <ul>
          <li>copiar, reproduzir, distribuir ou criar obras derivadas do site, do software ou do conteúdo gerado;</li>
          <li>realizar engenharia reversa, descompilar ou tentar extrair o código-fonte, os prompts, os modelos de IA ou a base de conhecimento;</li>
          <li>coletar dados do site de forma automatizada (scraping, crawling, bots) fora do permitido pelo arquivo <code>robots.txt</code>;</li>
          <li>utilizar o conteúdo, os fluxos ou a metodologia da plataforma para desenvolver ou treinar produto concorrente.</li>
        </ul>
        <p>
          O uso indevido sujeita o infrator às medidas cíveis e criminais cabíveis.
        </p>
      </main>
      <Footer />
    </>
  );
}
