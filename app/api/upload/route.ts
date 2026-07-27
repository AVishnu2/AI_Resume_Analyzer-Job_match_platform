import { NextResponse } from 'next/server';
import { extractTextFromPdf } from '@/services/pdf-extract';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'A PDF file is required.' }, { status: 400 });
    }

    const uploadedFile = file as File;
    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name?.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'A PDF file is required.' }, { status: 400 });
    }

    const bytes = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('[UPLOAD] PDF file received:', {
      fileName: uploadedFile.name,
      fileSize: bytes.byteLength,
      fileType: uploadedFile.type,
    });

    const result = await extractTextFromPdf(buffer);

    console.log('[UPLOAD] PDF extraction complete:', {
      textLength: result.text.length,
      pageCount: result.pageCount,
      hasImages: result.hasImages,
      textPreview: result.text.substring(0, 500),
    });

    if (!result.text || result.text.trim().length === 0) {
      return NextResponse.json({
        error: 'No extractable text found in the PDF. The resume may be a scanned image.',
        needsOcr: true,
        fileName: uploadedFile.name,
        pageCount: result.pageCount,
        text: '',
      }, { status: 422 });
    }

    return NextResponse.json({
      text: result.text,
      fileName: uploadedFile.name,
      pageCount: result.pageCount,
      hasImages: result.hasImages,
    });
  } catch (error) {
    console.error('[UPLOAD] PDF parsing error:', error);
    const message = error instanceof Error ? error.message : 'Failed to parse PDF';
    return NextResponse.json({
      error: message,
      details: 'PDF parsing failed. Ensure the file is a valid PDF document.',
    }, { status: 500 });
  }
}
