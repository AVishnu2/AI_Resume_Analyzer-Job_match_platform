import { NextResponse } from 'next/server';
import { callGemini } from '@/services/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body?.message as string | undefined;
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

    const reply = await callGemini(prompt, false);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('API Error in /api/chat:', error);
    // Provide a smart fallback if API key is not set or network fails
    return NextResponse.json({ 
      reply: "I'm here to help with your career! You can ask me about ATS keyword optimization, resume formatting, STAR interview responses, or salary negotiations." 
    });
  }
}
