import "server-only";
import { PDFDocument, StandardFonts } from "pdf-lib";

export type PdfLine = {
  text: string;
  emphasized?: boolean;
};

function toPdfText(value: string) {
  return value
    .normalize("NFC")
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, "?");
}

function wrapText(value: string, maxLength: number) {
  const words = toPdfText(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    if (word.length > maxLength) {
      if (line) {
        lines.push(line);
        line = "";
      }
      for (let offset = 0; offset < word.length; offset += maxLength) {
        lines.push(word.slice(offset, offset + maxLength));
      }
      continue;
    }

    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxLength) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines.length > 0 ? lines : [""];
}

export async function generateDownloadablePdf(lines: readonly PdfLine[]) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = [];
  let page = pdf.addPage([612, 792]);
  pages.push(page);
  let y = 742;

  for (const entry of lines) {
    const emphasized = entry.emphasized ?? false;
    const selectedFont = emphasized ? bold : font;
    for (const line of wrapText(entry.text, 88)) {
      if (y < 65) {
        page = pdf.addPage([612, 792]);
        pages.push(page);
        y = 742;
      }
      page.drawText(line, { x: 48, y, size: emphasized ? 16 : 10, font: selectedFont });
      y -= emphasized ? 26 : 17;
    }
    if (!emphasized) {
      y -= 3;
    }
  }

  pages.forEach((currentPage, index) => {
    currentPage.drawText(`Pagina ${index + 1} de ${pages.length}`, {
      x: 48,
      y: 30,
      size: 8,
      font,
    });
  });

  return pdf.save();
}
