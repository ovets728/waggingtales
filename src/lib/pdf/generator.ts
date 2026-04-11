import jsPDF from 'jspdf';
import type { GeneratedStory } from '@/lib/ai/story-engine';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 7;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** Word-wrap text to fit within maxWidth and return lines. */
function wrapText(
  doc: jsPDF,
  text: string,
  maxWidth: number
): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

/** Draw a simple decorative border on the current page. */
function drawBorder(doc: jsPDF) {
  doc.setDrawColor(180, 160, 120); // warm gold-ish
  doc.setLineWidth(1.5);
  doc.rect(10, 10, PAGE_WIDTH - 20, PAGE_HEIGHT - 20);
  doc.setLineWidth(0.5);
  doc.rect(13, 13, PAGE_WIDTH - 26, PAGE_HEIGHT - 26);
}

/** Add a page number at the bottom. */
function addPageNumber(doc: jsPDF, num: number) {
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(String(num), PAGE_WIDTH / 2, PAGE_HEIGHT - 12, {
    align: 'center',
  });
}

/* -------------------------------------------------------------------------- */
/*  PDF generation                                                            */
/* -------------------------------------------------------------------------- */

export async function generatePdf(story: GeneratedStory): Promise<Buffer> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  /* ---- Cover page ---- */
  drawBorder(doc);

  // Cover image (centred)
  if (story.coverImageBase64) {
    try {
      doc.addImage(
        story.coverImageBase64,
        'PNG',
        MARGIN + 15,
        40,
        CONTENT_WIDTH - 30,
        CONTENT_WIDTH - 30
      );
    } catch {
      // If the image fails, we just skip it
    }
  }

  // Title
  const titleY = story.coverImageBase64 ? 40 + CONTENT_WIDTH - 30 + 15 : 120;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(60, 60, 60);
  const titleLines = wrapText(doc, story.title, CONTENT_WIDTH - 20);
  titleLines.forEach((line: string, i: number) => {
    doc.text(line, PAGE_WIDTH / 2, titleY + i * 12, { align: 'center' });
  });

  // Subtitle / tagline
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(120, 120, 120);
  doc.text('A Waggingtails Storybook', PAGE_WIDTH / 2, titleY + titleLines.length * 12 + 8, {
    align: 'center',
  });

  /* ---- Story pages ---- */
  for (let i = 0; i < story.pages.length; i++) {
    const page = story.pages[i];
    doc.addPage();
    drawBorder(doc);

    let yPos = MARGIN + 8;

    // Page heading
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text(`Page ${page.pageNumber}`, PAGE_WIDTH / 2, yPos, {
      align: 'center',
    });
    yPos += 10;

    // Story text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    const lines = wrapText(doc, page.text, CONTENT_WIDTH);
    lines.forEach((line: string) => {
      doc.text(line, MARGIN, yPos);
      yPos += LINE_HEIGHT;
    });

    yPos += 8;

    // Page image (centred below text)
    if (page.imageBase64) {
      const imgSize = Math.min(CONTENT_WIDTH - 20, PAGE_HEIGHT - yPos - 30);
      if (imgSize > 20) {
        try {
          const imgX = (PAGE_WIDTH - imgSize) / 2;
          doc.addImage(page.imageBase64, 'PNG', imgX, yPos, imgSize, imgSize);
        } catch {
          // Skip image if it fails
        }
      }
    }

    addPageNumber(doc, i + 1);
  }

  /* ---- Back cover ---- */
  doc.addPage();
  drawBorder(doc);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(80, 80, 80);
  doc.text('Made with Waggingtails', PAGE_WIDTH / 2, PAGE_HEIGHT / 2 - 10, {
    align: 'center',
  });

  // Paw emoji as text
  doc.setFontSize(36);
  doc.text('\uD83D\uDC3E', PAGE_WIDTH / 2, PAGE_HEIGHT / 2 + 20, {
    align: 'center',
  });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(140, 140, 140);
  doc.text(
    'waggingtails.com',
    PAGE_WIDTH / 2,
    PAGE_HEIGHT / 2 + 40,
    { align: 'center' }
  );

  /* ---- Output ---- */
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
