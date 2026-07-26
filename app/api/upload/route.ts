import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'A PDF file is required.' }, { status: 400 });
    }

    const bytes = await (file as File).arrayBuffer();
    const buffer = Buffer.from(bytes);
    const data = await pdf(buffer);

    return NextResponse.json({ text: data.text, fileName: (file as File).name });
  } catch {
    return NextResponse.json({ error: 'Unable to parse the uploaded PDF.' }, { status: 500 });
  }
}
