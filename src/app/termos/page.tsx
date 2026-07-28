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
          Ao utilizar a Recurso Fácil, você concorda com os termos a seguir. Este
          documento pode ser atualizado a qualquer momento; alterações materiais
          serão comunicadas por e-mail.
        </p>
        <h2>1. Natureza do serviço</h2>
        <p>
          A Recurso Fácil é uma <strong>plataforma privada e independente</strong>,
          sem qualquer vínculo institucional, comercial ou de representação com o
          INSS, com o Governo Federal ou com qualquer órgão público. O nome
          "Recurso Fácil" é usado apenas para indicar a finalidade do serviço
          (recursos administrativos contra decisões do INSS), não uma afiliação
          oficial.
        </p>
        <p>
          A Recurso Fácil oferece geração automatizada de peças jurídicas
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
        <h2>3. Cancelamento e reembolso</h2>
        <p>
          <strong>Antes da entrega:</strong> enquanto o recurso não for entregue, o
          usuário pode cancelar o pedido a qualquer momento e receber reembolso
          integral. Se o pagamento ainda não tiver sido confirmado, o cancelamento é
          imediato e sem custo.
        </p>
        <p>
          <strong>Depois da entrega — garantia de 7 dias:</strong> o usuário pode
          solicitar reembolso integral em até 7 dias corridos contados do pagamento,
          conforme a garantia anunciada e o direito de arrependimento do art. 49 do
          Código de Defesa do Consumidor. A solicitação é feita pela área do cliente e
          respondida por e-mail.
        </p>
        <p>
          Ao optar pela entrega em até 24 horas, o usuário concorda com o início
          imediato da execução do serviço. Ainda assim, a garantia comercial de 7 dias
          descrita acima permanece válida.
        </p>
        <p>
          O estorno é processado pelo mesmo meio de pagamento usado na compra. O prazo
          até o valor aparecer na fatura ou conta depende do banco ou operadora de
          cartão.
        </p>
        <h2>4. Limitação de responsabilidade</h2>
        <p>
          A Recurso Fácil não se responsabiliza pelo resultado do recurso
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
          conhecimento jurídico, a marca "Recurso Fácil" e todo o conteúdo do
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
