import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    const trimmed = fullText.trim();
    if (!trimmed) {
      throw new Error('PDF_PARSE_FAILED');
    }
    return trimmed;
  } catch (err) {
    if (err.message === 'PDF_PARSE_FAILED') throw err;
    throw new Error('PDF_PARSE_FAILED');
  }
}
