import { NextResponse } from 'next/server';
import { extractResumeData } from '@/services/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resumeText = body?.resumeText as string | undefined;

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: 'Resume text is required.' }, { status: 400 });
    }

    const result = await extractResumeData(resumeText);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error in /api/analyze:', error);
    const message = error instanceof Error ? error.message : 'Failed to extract resume data.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
