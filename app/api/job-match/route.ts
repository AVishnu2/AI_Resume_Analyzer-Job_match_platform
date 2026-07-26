import { NextResponse } from 'next/server';
import { matchJobDescription } from '@/services/gemini';

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

    const result = await matchJobDescription(resumeText, jobDescription);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error in /api/job-match:', error);
    return NextResponse.json({ error: 'Failed to compute job match analysis.' }, { status: 500 });
  }
}
