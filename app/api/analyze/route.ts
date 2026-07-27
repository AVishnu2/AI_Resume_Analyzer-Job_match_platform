import { NextResponse } from 'next/server';
import { extractResumeData } from '@/services/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resumeText = body?.resumeText as string | undefined;

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: 'Resume text is required.' }, { status: 400 });
    }

    console.log('[ANALYZE] Starting resume extraction pipeline...');
    console.log('[ANALYZE] Resume text length:', resumeText.length);
    console.log('[ANALYZE] Resume text preview:', resumeText.substring(0, 300));

    const result = await extractResumeData(resumeText);

    console.log('[ANALYZE] Extraction complete:', {
      name: result.personalInfo.name,
      educationCount: result.education.length,
      experienceCount: result.experience.length,
      projectCount: result.projects.length,
      skillCategories: {
        languages: result.skills.languages.length,
        frameworks: result.skills.frameworks.length,
        databases: result.skills.databases.length,
        tools: result.skills.tools.length,
        cloud: result.skills.cloud.length,
        softSkills: result.skills.softSkills.length,
      },
    });

    const flatSkills = [
      ...result.skills.languages,
      ...result.skills.frameworks,
      ...result.skills.libraries,
      ...result.skills.databases,
      ...result.skills.tools,
      ...result.skills.cloud,
    ];

    // Preserve structured fields; add legacy aliases without overwriting arrays/objects
    return NextResponse.json({
      ...result,
      name: result.personalInfo.name,
      email: result.personalInfo.email,
      phone: result.personalInfo.phone,
      flatSkills,
      technicalSkills: flatSkills,
      softSkillsList: result.skills.softSkills,
      experienceSummary: result.summary || (result.experience.length > 0 ? `${result.experience.length} positions extracted` : ''),
      workExperience: result.experience,
    });
  } catch (error) {
    console.error('[ANALYZE] API Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to extract resume data.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}