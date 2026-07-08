import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Gera um PDF A4, com margem 2,5cm, fonte Times 12, espaçamento 1,5.
 */
export async function buildAppealPdf(opts: {
  title: string;
  body: string;
}): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(opts.title);
  pdf.setCreator("Recurso Fácil");

  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 70;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 18;
  const fontSize = 12;
  const headerTop = pageHeight - 42;
  const dividerColor = rgb(0.86, 0.89, 0.94);
  const brandColor = rgb(0.15, 0.22, 0.46);

  let page = pdf.addPage([pageWidth, pageHeight]);
  let cursorY = pageHeight - margin - 34;

  function drawHeader() {
    page.drawText("RECURSO FÁCIL", {
      x: margin,
      y: headerTop,
      font: bold,
      size: 11,
      color: brandColor,
    });
    page.drawText("Recurso administrativo previdenciario", {
      x: margin,
      y: headerTop - 14,
      font,
      size: 9,
      color: rgb(0.38, 0.43, 0.52),
    });
    page.drawLine({
      start: { x: margin, y: headerTop - 22 },
      end: { x: pageWidth - margin, y: headerTop - 22 },
      thickness: 1,
      color: dividerColor,
    });
  }

  function addPage() {
    page = pdf.addPage([pageWidth, pageHeight]);
    drawHeader();
    cursorY = pageHeight - margin - 34;
  }

  function ensureSpace(h: number) {
    if (cursorY - h < margin) addPage();
  }

  drawHeader();

  // Title
  const titleWidth = bold.widthOfTextAtSize(opts.title, 16);
  ensureSpace(30);
  page.drawText(opts.title, {
    x: (pageWidth - titleWidth) / 2,
    y: cursorY - 18,
    font: bold,
    size: 16,
    color: rgb(0, 0, 0),
  });
  cursorY -= 40;

  function drawWrapped(text: string, useFont = font, size = fontSize) {
    const paragraphs = text.split(/\n/);
    for (const para of paragraphs) {
      if (!para.trim()) {
        cursorY -= lineHeight * 0.6;
        continue;
      }
      const words = para.split(/\s+/);
      let line = "";
      for (const word of words) {
        const test = line ? line + " " + word : word;
        const w = useFont.widthOfTextAtSize(test, size);
        if (w > contentWidth) {
          ensureSpace(lineHeight);
          page.drawText(line, {
            x: margin,
            y: cursorY - size,
            font: useFont,
            size,
          });
          cursorY -= lineHeight;
          line = word;
        } else {
          line = test;
        }
      }
      if (line) {
        ensureSpace(lineHeight);
        page.drawText(line, {
          x: margin,
          y: cursorY - size,
          font: useFont,
          size,
        });
        cursorY -= lineHeight;
      }
      cursorY -= 4;
    }
  }

  for (const raw of opts.body.split(/\n/)) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      cursorY -= lineHeight * 0.6;
      continue;
    }

    if (line.startsWith("# ")) {
      ensureSpace(lineHeight + 10);
      drawWrapped(line.slice(2), bold, 14);
      continue;
    }
    if (line.startsWith("## ")) {
      ensureSpace(lineHeight + 8);
      drawWrapped(line.slice(3), bold, 13);
      continue;
    }

    const upperish =
      line.length > 3 &&
      line === line.toUpperCase() &&
      /[A-ZÁ-Ú]/.test(line) &&
      line.split(" ").length <= 12;

    if (upperish) {
      ensureSpace(lineHeight);
      drawWrapped(line, bold, 12);
      continue;
    }

    drawWrapped(line);
  }

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
