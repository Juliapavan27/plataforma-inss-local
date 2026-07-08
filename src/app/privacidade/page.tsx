import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = { title: "Política de privacidade" };

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="container max-w-3xl py-16 prose prose-ink">
        <h1>Política de privacidade</h1>
        <p>
          Levamos a privacidade a sério. Esta política descreve quais dados
          coletamos, para que fins e quais são os seus direitos como titular,
          nos termos da Lei 13.709/2018 (LGPD).
        </p>
        <h2>1. Dados coletados</h2>
        <ul>
          <li>Dados cadastrais: nome, CPF, e-mail, telefone.</li>
          <li>Dados do caso: informações relativas ao benefício e à negativa do INSS.</li>
          <li>Documentos anexados: CNIS, laudos, comprovantes, carta de indeferimento.</li>
          <li>Dados de uso: logs de acesso, IP, navegador.</li>
        </ul>
        <h2>2. Finalidades</h2>
        <p>
          Os dados são utilizados exclusivamente para (a) geração do recurso
          contratado, (b) cumprimento de obrigações legais e (c) suporte ao
          usuário. Não vendemos dados a terceiros.
        </p>
        <h2>3. Bases legais</h2>
        <p>
          Execução de contrato, consentimento do titular e cumprimento de
          obrigação legal, conforme arts. 7º e 11 da LGPD.
        </p>
        <h2>4. Compartilhamento</h2>
        <p>
          Podemos compartilhar dados com processadores (Stripe para pagamento,
          Anthropic para o motor de IA) unicamente no volume necessário à
          prestação do serviço, sob contratos de confidencialidade.
        </p>
        <h2>5. Direitos do titular</h2>
        <p>
          Você pode solicitar, a qualquer momento, confirmação, acesso, correção,
          portabilidade e exclusão dos seus dados, pelo canal privacidade@recursofacil.com.br.
        </p>
        <h2>6. Retenção</h2>
        <p>
          Mantemos os dados enquanto a conta estiver ativa e por até 5 anos após
          o encerramento, para fins de defesa em eventual processo administrativo ou judicial.
        </p>
      </main>
      <Footer />
    </>
  );
}
