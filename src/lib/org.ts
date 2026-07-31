/**
 * Identidade da empresa em um lugar só.
 *
 * Estava espalhada entre o layout, o rodapé e os textos das páginas. Como
 * agora também alimenta os dados estruturados do Google, divergência entre
 * eles vira sinal contraditório — daí a fonte única.
 */
import { SUPPORT_EMAIL } from "./support";

export const ORG = {
  name: "Recurso Fácil",
  siteUrl: (process.env.APP_URL ?? "https://www.recursofacil.com").replace(/\/$/, ""),
  supportEmail: SUPPORT_EMAIL,
  description:
    "Plataforma privada que elabora recursos administrativos para quem teve benefício negado pelo INSS. Entrega em até 24h, em PDF e Word, pronto para protocolar.",
} as const;

/**
 * Autoria dos guias.
 *
 * Conteúdo previdenciário é YMYL: o Google quer saber QUEM escreveu. Página
 * assinada por "nossa equipe" não pontua; pessoa nomeada pontua.
 */
export const AUTORIA = {
  autor: "Julia Laudi Matos",
  /**
   * Vazio por decisão da autora (30/07/2026) — não é pendência. Com o campo
   * vazio nenhuma credencial é exibida nem declarada no schema, que é o certo:
   * afirmar credencial sem o número que a torna verificável seria pior do que
   * não afirmar nada.
   */
  oab: "",
  /** Único lugar onde a experiência da autora é descrita. Muda em todas as páginas de uma vez. */
  descricaoAutor: "com formação em Direito e atuação em direito previdenciário",
  /** Data da última revisão jurídica do acervo de guias. */
  revisadoEm: "2026-07-30",
} as const;

export const temCredencial = AUTORIA.oab.length > 0;

/**
 * Data de revisão como data local.
 *
 * `new Date("2026-07-30")` é interpretado como meia-noite UTC; no horário de
 * Brasília isso cai no dia 29 e a página exibia a data errada. Montar a partir
 * das partes mantém o dia que está escrito.
 */
export function revisadoEmData(): Date {
  const [ano, mes, dia] = AUTORIA.revisadoEm.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}
