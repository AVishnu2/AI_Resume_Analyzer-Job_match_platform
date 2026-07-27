import pdfParse from 'pdf-parse';

export interface PdfExtractResult {
  text: string;
  pageCount: number;
  hasImages: boolean;
}

export async function extractTextFromPdf(buffer: Buffer): Promise<PdfExtractResult> {
  const data = await pdfParse(buffer);

  const text = data.text
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    text,
    pageCount: data.numpages,
    // pdf-parse doesn't detect images, default to false
    hasImages: false,
  };
}
