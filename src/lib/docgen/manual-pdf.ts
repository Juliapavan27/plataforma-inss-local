/**
 * Gera o PDF de um manual a partir dos blocos tipados de src/content/manuais.ts.
 *
 * Mesma fonte de conteúdo do leitor no site — aqui vira um arquivo para baixar.
 * Requisitos da autora atendidos: o símbolo do WhatsApp com "fale com um
 * especialista" no rodapé de TODA página, e uma página de CTA no final ("receba
 * pronto: [formulário] ou [WhatsApp]").
 *
 * pdf-lib é de baixo nível (a gente posiciona cada texto), então há um pequeno
 * motor de quebra de linha e paginação aqui. Fontes StandardType1 (Helvetica/
 * Courier) usam WinAnsi, que cobre os acentos do português.
 */
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import type { BlocoManual, Manual } from "@/content/manuais";
import { WHATSAPP_DISPLAY } from "@/lib/whatsapp";

const A4 = { w: 595.28, h: 841.89 };
const M = 52; // margem
const CONTENT_W = A4.w - M * 2;
const FOOTER_TOP = 60; // altura reservada para o rodapé

const INK = rgb(0.09, 0.09, 0.11);
const INK600 = rgb(0.33, 0.33, 0.36);
const INK400 = rgb(0.6, 0.6, 0.63);
const BRAND = rgb(0.176, 0.235, 0.878);
const GREEN = rgb(0.145, 0.827, 0.4);
const GREEN_D = rgb(0.07, 0.55, 0.49);
const VIOLET = rgb(0.42, 0.28, 0.75);
const AMBER = rgb(0.7, 0.48, 0.05);
const RED = rgb(0.78, 0.2, 0.2);

// Ícone de telefone (viewBox 24x24) — SÓ com M/L/V/C/Z (sem arcos). O glyph
// oficial do WhatsApp usa arcos (`a`), e o conversor de arco do pdf-lib gera
// operadores malformados que corrompem o content stream e apagam TODO o texto
// da página. Por isso desenhamos um telefone dentro de um círculo verde.
const PHONE_PATH =
  "M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c0.3-0.3 0.7-0.4 1-0.2 1.2 0.4 2.4 0.6 3.7 0.6 0.6 0 1 0.4 1 1V20c0 0.6-0.4 1-1 1C9.6 21 3 14.4 3 6c0-0.6 0.4-1 1-1h3.5c0.6 0 1 0.4 1 1 0 1.3 0.2 2.5 0.6 3.7 0.1 0.3 0 0.7-0.2 1z";

/** Badge do WhatsApp: círculo verde + telefone branco, tudo com ops seguras. */
function waBadge(page: PDFPage, cx: number, cy: number, r: number) {
  page.drawCircle({ x: cx, y: cy, size: r, color: GREEN });
  const s = (r * 1.25) / 24;
  page.drawSvgPath(PHONE_PATH, {
    x: cx - 12 * s,
    y: cy + 12 * s,
    scale: s,
    color: rgb(1, 1, 1),
  });
}

interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  reg: PDFFont;
  bold: PDFFont;
  mono: PDFFont;
  pageNum: number;
}

function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const out: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (paragraph === "") {
      out.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        out.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

// Sanitiza para WinAnsi: troca caracteres tipográficos que a fonte padrão não
// tem (aspas curvas, travessão, reticências) para não estourar na renderização.
function ansi(text: string): string {
  return text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ");
}

function footer(ctx: Ctx) {
  const { page } = ctx;
  const yLine = FOOTER_TOP - 8;
  page.drawLine({
    start: { x: M, y: yLine + 22 },
    end: { x: A4.w - M, y: yLine + 22 },
    thickness: 0.5,
    color: rgb(0.9, 0.9, 0.92),
  });
  // símbolo do WhatsApp
  waBadge(page, M + 8, yLine + 8, 9);
  page.drawText(ansi(`Fale com um especialista  ·  WhatsApp ${WHATSAPP_DISPLAY}`), {
    x: M + 24,
    y: yLine + 4,
    size: 8.5,
    font: ctx.bold,
    color: GREEN_D,
  });
  page.drawText(String(ctx.pageNum), {
    x: A4.w - M - ctx.reg.widthOfTextAtSize(String(ctx.pageNum), 8.5),
    y: yLine + 4,
    size: 8.5,
    font: ctx.reg,
    color: INK400,
  });
}

function newPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([A4.w, A4.h]);
  ctx.pageNum += 1;
  ctx.y = A4.h - M;
  footer(ctx);
}

function ensure(ctx: Ctx, needed: number) {
  if (ctx.y - needed < FOOTER_TOP) newPage(ctx);
}

/** Escreve texto quebrado e devolve o novo y. */
function writeLines(
  ctx: Ctx,
  text: string,
  font: PDFFont,
  size: number,
  color: RGB,
  opts: { lineGap?: number; x?: number; maxW?: number } = {},
) {
  const lineGap = opts.lineGap ?? size * 0.5;
  const x = opts.x ?? M;
  const maxW = opts.maxW ?? CONTENT_W;
  for (const line of wrap(ansi(text), font, size, maxW)) {
    ensure(ctx, size + lineGap);
    if (line !== "") {
      ctx.page.drawText(line, { x, y: ctx.y - size, size, font, color });
    }
    ctx.y -= size + lineGap;
  }
}

function box(ctx: Ctx, height: number, fill: RGB, opts: { bar?: RGB } = {}) {
  ensure(ctx, height + 8);
  const top = ctx.y;
  ctx.page.drawRectangle({
    x: M,
    y: top - height,
    width: CONTENT_W,
    height,
    color: fill,
    borderColor: opts.bar ?? fill,
    borderWidth: opts.bar ? 0 : 0,
  });
  if (opts.bar) {
    ctx.page.drawRectangle({ x: M, y: top - height, width: 3, height, color: opts.bar });
  }
  return top;
}

// Mede a altura que um bloco "caixa" vai ocupar, para desenhar o fundo antes.
function measure(lines: string[], size: number, lineGap: number, padTop: number, padBottom: number) {
  return padTop + lines.length * (size + lineGap) + padBottom;
}

function drawLabeledBox(
  ctx: Ctx,
  opts: {
    label: string;
    labelColor: RGB;
    fill: RGB;
    bar?: RGB;
    title?: string;
    body: string;
    mono?: boolean;
  },
) {
  const size = opts.mono ? 9.5 : 10.5;
  const font = opts.mono ? ctx.mono : ctx.reg;
  const innerW = CONTENT_W - 28;
  const bodyLines = wrap(ansi(opts.body), font, size, innerW);
  const titleLines = opts.title ? wrap(ansi(opts.title), ctx.bold, 11, innerW) : [];
  const h =
    14 + // label
    (titleLines.length ? titleLines.length * 15 + 4 : 0) +
    bodyLines.length * (size + 4) +
    18;
  ensure(ctx, h + 6);
  const top = ctx.y;
  ctx.page.drawRectangle({ x: M, y: top - h, width: CONTENT_W, height: h, color: opts.fill });
  if (opts.bar) {
    ctx.page.drawRectangle({ x: M, y: top - h, width: 3, height: h, color: opts.bar });
  }
  let yy = top - 16;
  ctx.page.drawText(ansi(opts.label.toUpperCase()), {
    x: M + 14,
    y: yy - 2,
    size: 8,
    font: ctx.bold,
    color: opts.labelColor,
  });
  yy -= 16;
  for (const l of titleLines) {
    ctx.page.drawText(l, { x: M + 14, y: yy - 11, size: 11, font: ctx.bold, color: INK });
    yy -= 15;
  }
  if (titleLines.length) yy -= 4;
  for (const l of bodyLines) {
    if (l !== "") ctx.page.drawText(l, { x: M + 14, y: yy - size, size, font, color: INK600 });
    yy -= size + 4;
  }
  ctx.y = top - h - 12;
}

function bloco(ctx: Ctx, b: BlocoManual) {
  switch (b.tipo) {
    case "paragrafo":
      writeLines(ctx, b.texto, ctx.reg, 10.5, INK600, { lineGap: 5 });
      ctx.y -= 6;
      break;
    case "subtitulo":
      ctx.y -= 6;
      writeLines(ctx, b.texto, ctx.bold, 12.5, INK, { lineGap: 4 });
      ctx.y -= 4;
      break;
    case "lista":
      for (const it of b.itens) {
        const lines = wrap(ansi(it), ctx.reg, 10.5, CONTENT_W - 16);
        ensure(ctx, lines.length * 15 + 2);
        ctx.page.drawCircle({ x: M + 3, y: ctx.y - 7, size: 1.6, color: BRAND });
        lines.forEach((l, i) => {
          ctx.page.drawText(l, { x: M + 14, y: ctx.y - 10.5, size: 10.5, font: ctx.reg, color: INK600 });
          ctx.y -= i === lines.length - 1 ? 15 : 15;
          if (i < lines.length - 1) {
            // continuação: nada extra
          }
        });
      }
      ctx.y -= 6;
      break;
    case "destaque": {
      const map = {
        info: { fill: rgb(0.93, 0.95, 1), bar: BRAND, lc: BRAND },
        atencao: { fill: rgb(1, 0.97, 0.9), bar: AMBER, lc: AMBER },
        cuidado: { fill: rgb(1, 0.94, 0.94), bar: RED, lc: RED },
        dica: { fill: rgb(0.92, 0.98, 0.94), bar: GREEN_D, lc: GREEN_D },
      } as const;
      const s = map[b.variante];
      drawLabeledBox(ctx, {
        label: b.titulo ?? "Atenção",
        labelColor: s.lc,
        fill: s.fill,
        bar: s.bar,
        body: b.texto,
      });
      break;
    }
    case "lei":
      drawLabeledBox(ctx, {
        label: `Base legal · ${b.referencia}`,
        labelColor: INK400,
        fill: rgb(0.96, 0.96, 0.97),
        body: b.texto,
      });
      break;
    case "jurisprudencia":
      drawLabeledBox(ctx, {
        label: "Jurisprudência de apoio",
        labelColor: VIOLET,
        fill: rgb(0.96, 0.94, 0.99),
        bar: VIOLET,
        title: b.tema,
        body: b.referencia ? `${b.texto}\n(${b.referencia})` : b.texto,
      });
      break;
    case "modelo":
      drawLabeledBox(ctx, {
        label: `Modelo · ${b.titulo}`,
        labelColor: BRAND,
        fill: rgb(0.97, 0.97, 0.98),
        bar: BRAND,
        body: b.texto,
        mono: true,
      });
      break;
    case "whatsapp": {
      const h = 30;
      ensure(ctx, h + 6);
      const top = ctx.y;
      ctx.page.drawRectangle({ x: M, y: top - h, width: CONTENT_W, height: h, color: rgb(0.9, 0.98, 0.93) });
      waBadge(ctx.page, M + 18, top - h / 2, 10);
      ctx.page.drawText(ansi(b.texto ?? "Fale com um especialista"), {
        x: M + 36,
        y: top - h / 2 - 4,
        size: 10.5,
        font: ctx.bold,
        color: GREEN_D,
      });
      ctx.y = top - h - 12;
      break;
    }
    case "cta_final":
      ctaPage(ctx);
      break;
  }
}

function ctaPage(ctx: Ctx) {
  newPage(ctx);
  ctx.y = A4.h - 150;
  const center = (t: string, font: PDFFont, size: number, color: RGB, gap = size * 0.6) => {
    for (const l of wrap(ansi(t), font, size, CONTENT_W - 40)) {
      const w = font.widthOfTextAtSize(l, size);
      ctx.page.drawText(l, { x: (A4.w - w) / 2, y: ctx.y - size, size, font, color });
      ctx.y -= size + gap;
    }
  };
  center("Sabia que você pode receber tudo isso pronto?", ctx.bold, 20, INK);
  ctx.y -= 10;
  center(
    "Você acabou de ver o trabalho que um bom recurso exige. Se preferir não fazer sozinho, a nossa equipe monta o recurso completo, fundamentado e revisado para o seu caso — pronto para protocolar.",
    ctx.reg,
    11.5,
    INK600,
    6,
  );
  ctx.y -= 24;
  // botão "gerar" (retângulo azul com texto)
  const drawCta = (label: string, sub: string, fill: RGB) => {
    const h = 46;
    ctx.page.drawRectangle({ x: M + 40, y: ctx.y - h, width: CONTENT_W - 80, height: h, color: fill });
    const w1 = ctx.bold.widthOfTextAtSize(label, 12);
    ctx.page.drawText(label, { x: (A4.w - w1) / 2, y: ctx.y - 19, size: 12, font: ctx.bold, color: rgb(1, 1, 1) });
    const w2 = ctx.reg.widthOfTextAtSize(sub, 9);
    ctx.page.drawText(sub, { x: (A4.w - w2) / 2, y: ctx.y - 34, size: 9, font: ctx.reg, color: rgb(1, 1, 1) });
    ctx.y -= h + 16;
  };
  drawCta("Solicitar meu recurso pronto", ansi("recursofacil.com/novo-recurso"), BRAND);
  drawCta(ansi("Falar no WhatsApp  ·  ") + WHATSAPP_DISPLAY, "Tire suas dúvidas com um especialista", GREEN_D);
  ctx.y -= 10;
  center("recursofacil.com", ctx.bold, 11, BRAND, 4);
}

export async function buildManualPdf(manual: Manual): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.setTitle(manual.titulo);
  doc.setAuthor("Recurso Fácil");
  doc.setSubject(manual.subtitulo);

  const ctx: Ctx = {
    doc,
    page: null as unknown as PDFPage,
    y: 0,
    reg: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    mono: await doc.embedFont(StandardFonts.Courier),
    pageNum: 0,
  };
  newPage(ctx);

  // Capa/cabeçalho
  ctx.y -= 6;
  ctx.page.drawText("MANUAL EM PDF · RECURSO FÁCIL", {
    x: M,
    y: ctx.y - 9,
    size: 9,
    font: ctx.bold,
    color: BRAND,
  });
  ctx.y -= 26;
  writeLines(ctx, manual.titulo, ctx.bold, 21, INK, { lineGap: 4 });
  ctx.y -= 4;
  writeLines(ctx, manual.subtitulo, ctx.reg, 12, INK600, { lineGap: 5 });
  ctx.y -= 8;
  ctx.page.drawLine({
    start: { x: M, y: ctx.y },
    end: { x: A4.w - M, y: ctx.y },
    thickness: 0.5,
    color: rgb(0.88, 0.88, 0.9),
  });
  ctx.y -= 20;

  for (const secao of manual.secoes) {
    // Seção que é só o CTA final não leva título: a própria página de CTA já
    // tem a chamada, e o título solto ficava órfão no fim da página anterior.
    const soCta = secao.blocos.length === 1 && secao.blocos[0].tipo === "cta_final";
    if (!soCta) {
      ctx.y -= 8;
      ensure(ctx, 60);
      writeLines(ctx, secao.titulo, ctx.bold, 15, INK, { lineGap: 4 });
      ctx.y -= 6;
    }
    for (const b of secao.blocos) bloco(ctx, b);
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
