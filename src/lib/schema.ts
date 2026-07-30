/**
 * Dados estruturados (JSON-LD) para o Google.
 *
 * Conteúdo previdenciário é YMYL ("Your Money or Your Life"): o Google aplica
 * um critério de confiabilidade mais duro porque uma informação errada aqui
 * custa dinheiro ou saúde a quem lê. Marcar autor, revisor, data de
 * atualização e fontes não é enfeite — é o sinal que ele procura.
 *
 * Regra de ouro do schema: só declarar o que a página realmente mostra. Marcar
 * uma FAQ que não está visível, ou um autor que não aparece, é motivo de
 * penalização — não de ganho.
 */
import { ORG } from "./org";

const url = (path = "") => `${ORG.siteUrl}${path}`;

/** Quem somos, para o Google. Vai no layout, em toda página. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": url("/#organization"),
    name: ORG.name,
    url: url(),
    email: ORG.supportEmail,
    description: ORG.description,
    areaServed: { "@type": "Country", name: "Brasil" },
    knowsAbout: [
      "Direito previdenciário",
      "Recurso administrativo INSS",
      "Benefício negado pelo INSS",
      "BPC/LOAS",
      "Auxílio-doença",
      "Aposentadoria por incapacidade",
    ],
    // Deixa explícito que não somos órgão público. A mesma ressalva está no
    // rodapé do site; aqui ela vira dado legível por máquina.
    disambiguatingDescription:
      "Empresa privada e independente, sem vínculo com o INSS ou com o governo federal.",
  };
}

/** Habilita a caixa de busca do site nos resultados do Google. */
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": url("/#website"),
    url: url(),
    name: ORG.name,
    inLanguage: "pt-BR",
    publisher: { "@id": url("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: url("/guias?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Caminho de navegação — vira a trilha exibida no resultado da busca. */
export function breadcrumbSchema(trilha: { nome: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trilha.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.nome,
      item: url(item.path),
    })),
  };
}

/**
 * Artigo dos guias.
 *
 * Usa `Article` e não `NewsArticle`/`BlogPosting`: é conteúdo de referência
 * atualizado ao longo do tempo, não notícia datada.
 */
export function articleSchema(opts: {
  title: string;
  description: string;
  path: string;
  updatedAt: string;
  authorName: string;
  reviewerName?: string;
  sources?: { titulo: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url(`${opts.path}#article`),
    headline: opts.title,
    description: opts.description,
    inLanguage: "pt-BR",
    mainEntityOfPage: { "@type": "WebPage", "@id": url(opts.path) },
    datePublished: opts.updatedAt,
    dateModified: opts.updatedAt,
    author: { "@type": "Person", name: opts.authorName },
    publisher: { "@id": url("/#organization") },
    ...(opts.reviewerName
      ? { reviewedBy: { "@type": "Person", name: opts.reviewerName } }
      : {}),
    ...(opts.sources?.length
      ? {
          citation: opts.sources.map((f) => ({
            "@type": "CreativeWork",
            name: f.titulo,
            url: f.url,
          })),
        }
      : {}),
  };
}

/**
 * Perguntas e respostas.
 *
 * Só usar em página onde as perguntas estão visíveis ao leitor, com a resposta
 * inteira. FAQ marcada mas escondida é considerada engano pelo Google.
 */
export function faqSchema(perguntas: { pergunta: string; resposta: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: perguntas.map((p) => ({
      "@type": "Question",
      name: p.pergunta,
      acceptedAnswer: { "@type": "Answer", text: p.resposta },
    })),
  };
}

/** Serviço oferecido, com o preço real — o mesmo que o site anuncia. */
export function serviceSchema(opts: { pricePixCents: number; priceCardCents: number }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Recurso administrativo contra decisão do INSS",
    description:
      "Elaboração de recurso administrativo fundamentado contra o indeferimento de benefício pelo INSS, entregue em PDF e Word.",
    provider: { "@id": url("/#organization") },
    areaServed: { "@type": "Country", name: "Brasil" },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      // O menor preço é o do Pix; o cartão aparece como faixa até o teto.
      price: (opts.pricePixCents / 100).toFixed(2),
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: (opts.pricePixCents / 100).toFixed(2),
        maxPrice: (opts.priceCardCents / 100).toFixed(2),
        priceCurrency: "BRL",
      },
      availability: "https://schema.org/InStock",
      url: url("/novo-recurso"),
    },
  };
}
