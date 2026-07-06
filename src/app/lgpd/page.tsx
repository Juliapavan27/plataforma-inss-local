import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = { title: "LGPD — Seus direitos" };

export default function LgpdPage() {
  return (
    <>
      <Navbar />
      <main className="container max-w-3xl py-16 prose prose-ink">
        <h1>LGPD — Seus direitos como titular</h1>
        <p>
          A Lei Geral de Proteção de Dados (Lei 13.709/2018) garante a você
          direitos sobre seus dados pessoais. A Plataforma INSS os respeita
          integralmente.
        </p>
        <ul>
          <li>Confirmação da existência de tratamento</li>
          <li>Acesso aos dados tratados</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados</li>
          <li>Portabilidade dos dados</li>
          <li>Eliminação dos dados tratados com consentimento</li>
          <li>Revogação do consentimento</li>
        </ul>
        <p>
          Para exercer qualquer um desses direitos, envie um e-mail para{" "}
          <strong>privacidade@plataformainss.com.br</strong> indicando o direito
          que deseja exercer. Responderemos em até 15 dias.
        </p>
      </main>
      <Footer />
    </>
  );
}
