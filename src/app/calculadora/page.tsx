import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { CalculatorTabs } from "@/components/calculator/calculator-tabs";

export const metadata = {
  title: "Calculadora do INSS — Simule sua aposentadoria e benefícios",
  description:
    "Simule gratuitamente o valor estimado da sua aposentadoria ou de um benefício negado pelo INSS (auxílio-doença, pensão por morte, BPC/LOAS e mais).",
};

export default function CalculadoraPage() {
  return (
    <>
      <Navbar />
      <main className="container max-w-4xl py-16">
        <div className="text-center">
          <span className="chip-brand">Calculadora gratuita</span>
          <h1 className="mt-4 font-display text-4xl font-bold text-ink-950">
            Calculadora de aposentadoria e benefícios do INSS
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-ink-600">
            Simule o valor estimado da sua aposentadoria ou de um benefício negado —
            auxílio-doença, aposentadoria por invalidez, pensão por morte, salário-maternidade
            ou BPC/LOAS.
          </p>
        </div>

        <div className="mt-10">
          <CalculatorTabs />
        </div>

        <div className="mt-16 space-y-6 text-sm text-ink-600">
          <h2 className="font-display text-xl font-semibold text-ink-950">
            Como funciona o cálculo do INSS?
          </h2>
          <p>
            Desde a reforma da Previdência (EC 103/2019), a aposentadoria pela regra geral exige
            idade mínima de 65 anos (homens) ou 62 anos (mulheres), além de tempo mínimo de
            contribuição de 20 anos (homens) ou 15 anos (mulheres). O valor do benefício
            corresponde a 60% da média de todos os salários de contribuição, mais 2% para cada
            ano que exceder esse tempo mínimo.
          </p>
          <p>
            Quem já contribuía antes de 13/11/2019 pode ter direito a regras de transição (por
            pontos, idade progressiva ou pedágio) que antecipam a aposentadoria — nossa
            calculadora simula apenas a regra geral. Para o cálculo oficial e definitivo, sempre
            confirme no aplicativo Meu INSS.
          </p>
          <p>
            Já para benefícios por incapacidade (auxílio-doença, aposentadoria por invalidez),
            pensão por morte, salário-maternidade e BPC/LOAS, cada um segue uma regra própria de
            cálculo — detalhada nos resultados da aba &ldquo;Benefício negado&rdquo; acima.
          </p>
          <p className="text-xs text-ink-400">
            As estimativas desta página têm caráter meramente informativo e não substituem a
            simulação oficial do INSS nem orientação jurídica. Se seu pedido foi negado, você
            pode <a href="/novo-recurso" className="font-semibold text-brand-700">gerar um recurso administrativo</a> com entrega em até 24h.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
