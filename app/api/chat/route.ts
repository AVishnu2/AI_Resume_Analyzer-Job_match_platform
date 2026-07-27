import { NextResponse } from 'next/server';
import { callGemini } from '@/services/gemini';

function localFallbackReply(question: string = '') {
  const text = question.toLowerCase();

  if (/salary|pay|compensation|raise|negotiation/.test(text)) {
    return 'Salary negotiation advice: Focus on your unique contributions, market value, and recent achievements. Frame requests around business impact and be ready to cite specific examples, then ask for a range rather than a single number.';
  }

  if (/resume|cv|format|experience|education|skills|projects/.test(text)) {
    return 'Resume advice: emphasize measurable achievements, keep section headings clear, and match your language to the job description. Prioritize relevant skills and use bullet points with action verbs to improve ATS readability.';
  }

  if (/ats|keyword|application tracking|applicant tracking/.test(text)) {
    return 'ATS optimization tips: mirror the job description keywords naturally, include a skills section with exact technical terms, and avoid images or unusual formatting. Use standard section headers like Experience, Education, and Skills.';
  }

  if (/interview|prep|behavioral|star|questions|answers/.test(text)) {
    return 'Interview prep help: prepare STAR stories for key accomplishments, practice concise answers, and highlight the challenge, action, and result clearly. Focus on what you learned and the impact you delivered.';
  }

  if (/job match|job matcher|job description|match score|role/.test(text)) {
    return 'Job matching advice: compare your resume keywords and technical skills directly with the target description. Note any gaps in tools, languages, or certifications, and adjust your application to reflect the strongest matches.';
  }

  return 'I’m here to help with your career. Ask me about resume tips, ATS keyword optimization, interview questions, salary negotiation, or how to better match your experience to a job posting.';
}

export async function POST(request: Request) {
  let userMessage = '';

  try {
    const body = await request.json();
    const message = body?.message as string | undefined;
    userMessage = message ?? '';
    const history = body?.history as { role: 'user' | 'assistant'; content: string }[] | undefined;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const conversationContext = (history || [])
      .slice(-6)
      .map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
      .join('\n');

    const prompt = `You are "ResumeAI Assistant", an AI career advisor built into the ResumeAI platform.
Help the user with resumes, ATS optimization, job matching, interview preparation, salary advice, or career growth strategies.

Recent Conversation History:
${conversationContext || 'No previous messages.'}

User Question:
${message}

Provide a clear, practical, encouraging answer. Keep responses concise (under 200 words) using clean markdown formatting.`;

    const reply = await callGemini(prompt, false, 0.9);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('API Error in /api/chat:', error);

    const fallback = localFallbackReply(userMessage);
    return NextResponse.json({ reply: fallback });
  }
}
