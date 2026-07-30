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
 * Conteúdo previdenciário é YMYL: o Google exige saber QUEM escreveu e com
 * que credencial. Página assinada por "nossa equipe" não pontua — pessoa
 * nomeada e verificável pontua.
 *
 * TODO(Julia): trocar por nome e OAB reais antes de considerar o E-E-A-T
 * resolvido. Enquanto `oab` estiver vazio, a credencial não é exibida nem
 * declarada no schema — melhor omitir do que publicar credencial vaga.
 */
export const AUTORIA = {
  autor: "Equipe Recurso Fácil",
  oab: "",
  /** Data da última revisão jurídica do acervo de guias. */
  revisadoEm: "2026-07-30",
} as const;

export const temCredencial = AUTORIA.oab.length > 0;
