import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  Header,
  BorderStyle,
} from "docx";

/**
 * Gera DOCX a partir do texto do recurso (markdown simples).
 * Regras:
 *  - Linha "# título"            → heading 1
 *  - Linha "## título"           → heading 2
 *  - Linha em caixa alta         → heading bold
 *  - Demais linhas               → parágrafo justificado
 */
export async function buildAppealDocx(opts: {
  title: string;
  body: string;
}): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: opts.title, bold: true, size: 28 }),
      ],
      spacing: { after: 400 },
    }),
  );

  for (const rawLine of opts.body.split(/\n/)) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      children.push(new Paragraph({ text: "" }));
      continue;
    }

    if (line.startsWith("# ")) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: line.slice(2), bold: true })],
          spacing: { before: 200, after: 200 },
        }),
      );
      continue;
    }
    if (line.startsWith("## ")) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: line.slice(3), bold: true })],
          spacing: { before: 160, after: 120 },
        }),
      );
      continue;
    }

    // Linhas só-maiúsculas tratadas como título de seção
    const upperish =
      line.length > 3 &&
      line === line.toUpperCase() &&
      /[A-ZÁ-Ú]/.test(line) &&
      line.split(" ").length <= 12;

    if (upperish) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: line, bold: true })],
          spacing: { before: 200, after: 120 },
        }),
      );
      continue;
    }

    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: line, size: 24 })],
        spacing: { after: 120, line: 360 },
      }),
    );
  }

  const doc = new Document({
    creator: "Plataforma INSS",
    title: opts.title,
    sections: [
      {
        properties: {
          page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1417 } },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                border: {
                  bottom: {
                    color: "D9DFEA",
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: "PLATAFORMA INSS",
                    bold: true,
                    size: 20,
                    color: "273870",
                  }),
                  new TextRun({
                    text: "  |  Recurso administrativo previdenciario",
                    size: 18,
                    color: "6B7280",
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
