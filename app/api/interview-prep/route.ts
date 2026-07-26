import { NextResponse } from 'next/server';
import { generateInterviewQuestions } from '@/services/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resumeText = body?.resumeText as string | undefined;
    const jobDescription = body?.jobDescription as string | undefined;

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: 'Resume text is required.' }, { status: 400 });
    }

    if (!jobDescription || typeof jobDescription !== 'string') {
      return NextResponse.json({ error: 'Job description is required.' }, { status: 400 });
    }

    const result = await generateInterviewQuestions(resumeText, jobDescription);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error in /api/interview-prep:', error);
    return NextResponse.json({ error: 'Failed to generate interview questions.' }, { status: 500 });
  }
}
