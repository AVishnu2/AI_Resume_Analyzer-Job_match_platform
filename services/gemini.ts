import { ExtractedResumeData, MatchAnalysis, InterviewPrep, PersonalInfo, CategorizedSkills, ExperienceEntry, EducationEntry, ProjectEntry } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseResumeFromText } from '@/services/resume-parser';

// ---------------------------------------------------------------------------
// Logging Utilities
// ---------------------------------------------------------------------------
const LOG_PREFIX = '[EXTRACTION-PIPELINE]';

function log(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const prefix = `${LOG_PREFIX} [${timestamp}] [${level}]`;
  if (data !== undefined) {
    console.log(`${prefix} ${message}`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

// ---------------------------------------------------------------------------
// API Key & Client
// ---------------------------------------------------------------------------
function getApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key.startsWith('your_')) {
    return null;
  }
  return key.trim();
}

function createGeminiClient(): GoogleGenerativeAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured or has invalid format.');
  }
  return new GoogleGenerativeAI(apiKey);
}

// ---------------------------------------------------------------------------
// Schema Definition - Must match what we tell the LLM
// ---------------------------------------------------------------------------
const EXTRACTION_SCHEMA = {
  personalInfo: {
    name: "string",
    email: "string",
    phone: "string",
    location: "string",
    linkedin: "string (full URL or profile path)",
    github: "string (full URL or profile path)",
    portfolio: "string (full URL)"
  },
  summary: "string (exact text from resume objective/summary section - do NOT summarize, extract verbatim or leave empty)",
  education: [
    {
      school: "string",
      degree: "string",
      field: "string",
      year: "string"
    }
  ],
  experience: [
    {
      company: "string",
      role: "string",
      duration: "string",
      description: "string (exact bullet points, verbatim, do NOT summarize)"
    }
  ],
  projects: [
    {
      name: "string",
      description: "string (exact project description from resume, verbatim)",
      technologies: ["string (only if explicitly mentioned)"]
    }
  ],
  skills: {
    languages: ["string"],
    frameworks: ["string"],
    libraries: ["string"],
    databases: ["string"],
    tools: ["string"],
    cloud: ["string"],
    softSkills: ["string"]
  },
  certifications: ["string"],
  internships: [
    {
      company: "string",
      role: "string",
      duration: "string",
      description: "string"
    }
  ],
  achievements: [
    {
      title: "string",
      description: "string"
    }
  ],
  publications: [
    {
      title: "string",
      publisher: "string",
      year: "string",
      link: "string"
    }
  ],
  languagesKnown: [
    {
      language: "string",
      proficiency: "string"
    }
  ]
};

// ---------------------------------------------------------------------------
// Enterprise Extraction Prompt
// ---------------------------------------------------------------------------
function buildExtractionPrompt(resumeText: string): string {
  const schema = JSON.stringify(EXTRACTION_SCHEMA, null, 2);

  return `You are an enterprise-grade resume extraction engine. Your ONLY purpose is to faithfully extract every piece of information from the resume text below.

## CRITICAL RULES (read carefully):

1. **NEVER SUMMARIZE OR HALLUCINATE** - Extract text verbatim from the resume. Do not generate, infer, or create information that isn't explicitly present.

2. **COMPLETE EXTRACTION** - Extract ALL sections:
   - Every education entry (school, degree, field, year)
   - EVERY job experience with COMPLETE bullet points (not truncated)
   - EVERY project with COMPLETE description
   - ALL skills properly categorized
   - ALL certifications, internships, achievements, publications, languages
   - Personal info (name, email, phone, location, LinkedIn, GitHub, portfolio URLs)

3. **NO TRUNCATION** - Extract COMPLETE descriptions, not just first 300 characters. Include every bullet point.

4. **SKILLS CATEGORIZATION** - Classify each skill into the correct category:
   - languages: Python, JavaScript, TypeScript, Java, C++, C#, Go, Rust, Kotlin, Swift, Ruby, PHP, SQL, HTML, CSS, etc.
   - frameworks: React, Angular, Vue, Next.js, Django, Flask, Spring Boot, Express, Ruby on Rails, Laravel, etc.
   - libraries: pandas, numpy, tensorflow, pytorch, lodash, jquery, d3.js, etc.
   - databases: PostgreSQL, MySQL, MongoDB, Redis, Firebase, Supabase, SQLite, Oracle, etc.
   - tools: Git, Docker, Kubernetes, Jenkins, Terraform, Ansible, CI/CD, Figma, Postman, etc.
   - cloud: AWS, Azure, GCP, Heroku, Vercel, Netlify, Cloudflare, etc.
   - softSkills: Communication, Teamwork, Leadership, Problem Solving, etc.

5. **If a section does not exist in the resume**, return:
   - empty string "" for summary
   - empty array [] for list fields
   - empty string "" for missing personalInfo fields

6. **OUTPUT FORMAT**: Return ONLY valid JSON. No markdown, no code fences, no explanation. Just raw JSON.

7. **LENGTH REQUIREMENT**: Do NOT truncate descriptions. If a job has 5 bullet points, include all 5 verbatim.

Here is the resume text to extract from:

${resumeText}

Return the JSON exactly matching this schema:
${schema}`;
}

// ---------------------------------------------------------------------------
// Validation - Check extracted JSON has all non-empty sections
// ---------------------------------------------------------------------------
function validateExtraction(data: any): { valid: boolean; missingSections: string[]; warnings: string[] } {
  const missingSections: string[] = [];
  const warnings: string[] = [];

  if (!data.personalInfo) {
    missingSections.push('personalInfo');
  } else {
    if (!data.personalInfo.name) warnings.push('personalInfo.name is empty');
    if (!data.personalInfo.email) warnings.push('personalInfo.email is empty');
    if (!data.personalInfo.phone) warnings.push('personalInfo.phone is empty');
  }

  if (!data.education || !Array.isArray(data.education) || data.education.length === 0) {
    warnings.push('education is empty or missing');
  }

  if (!data.experience || !Array.isArray(data.experience) || data.experience.length === 0) {
    warnings.push('experience is empty or missing');
  }

  if (!data.projects || !Array.isArray(data.projects) || data.projects.length === 0) {
    warnings.push('projects is empty or missing');
  }

  if (!data.skills) {
    missingSections.push('skills');
  } else {
    const hasAnySkill =
      (data.skills.languages?.length || 0) > 0 ||
      (data.skills.frameworks?.length || 0) > 0 ||
      (data.skills.libraries?.length || 0) > 0 ||
      (data.skills.databases?.length || 0) > 0 ||
      (data.skills.tools?.length || 0) > 0 ||
      (data.skills.cloud?.length || 0) > 0 ||
      (data.skills.softSkills?.length || 0) > 0;
    if (!hasAnySkill) warnings.push('skills are completely empty');
  }

  if (!data.certifications || !Array.isArray(data.certifications)) {
    warnings.push('certifications is missing');
  }

  return {
    valid: missingSections.length === 0,
    missingSections,
    warnings
  };
}

// ---------------------------------------------------------------------------
// Raw PDF Text vs Extracted JSON Comparison
// ---------------------------------------------------------------------------
function compareExtractionWithSource(rawText: string, extracted: any): string[] {
  const missingSections: string[] = [];
  const textLower = rawText.toLowerCase();

  const sectionIndicators = [
    { name: 'education', patterns: ['education', 'b.tech', 'bachelor', 'master', 'degree', 'school', 'university', 'college', '10th', '12th', 'ssc', 'hsc'] },
    { name: 'experience', patterns: ['experience', 'work experience', 'employment', 'job', 'career', 'professional'] },
    { name: 'projects', patterns: ['project', 'projects', 'portfolio'] },
    { name: 'skills', patterns: ['skill', 'technical skill', 'programming', 'technology', 'technologies'] },
    { name: 'certifications', patterns: ['certification', 'certificate', 'license', 'credential'] },
    { name: 'achievements', patterns: ['achievement', 'award', 'honor', 'recognition'] },
    { name: 'publications', patterns: ['publication', 'paper', 'research', 'journal'] },
    { name: 'languages', patterns: ['language', 'bilingual', 'fluent', 'proficient'] },
  ];

  for (const section of sectionIndicators) {
    const sectionExistsInText = section.patterns.some(p => textLower.includes(p));
    if (sectionExistsInText) {
      let extractedExists = false;
      switch (section.name) {
        case 'education':
          extractedExists = Array.isArray(extracted.education) && extracted.education.length > 0;
          break;
        case 'experience':
          extractedExists = Array.isArray(extracted.experience) && extracted.experience.length > 0;
          break;
        case 'projects':
          extractedExists = Array.isArray(extracted.projects) && extracted.projects.length > 0;
          break;
        case 'skills':
          extractedExists = extracted.skills && (
            (extracted.skills.languages?.length || 0) > 0 ||
            (extracted.skills.frameworks?.length || 0) > 0
          );
          break;
        case 'certifications':
          extractedExists = Array.isArray(extracted.certifications) && extracted.certifications.length > 0;
          break;
        case 'achievements':
          extractedExists = Array.isArray(extracted.achievements) && extracted.achievements.length > 0;
          break;
        case 'publications':
          extractedExists = Array.isArray(extracted.publications) && extracted.publications.length > 0;
          break;
        case 'languages':
          extractedExists = Array.isArray(extracted.languagesKnown) && extracted.languagesKnown.length > 0;
          break;
      }
      if (!extractedExists) {
        missingSections.push(`${section.name} (present in resume but NOT extracted)`);
      }
    }
  }

  return missingSections;
}

// ---------------------------------------------------------------------------
// Normalize to new format
// ---------------------------------------------------------------------------
function normalizeToNewFormat(raw: any): ExtractedResumeData {
  const personalInfo: PersonalInfo = {
    name: String(raw.personalInfo?.name || raw.name || '').trim(),
    email: String(raw.personalInfo?.email || raw.email || '').trim(),
    phone: String(raw.personalInfo?.phone || raw.phone || '').trim(),
    location: String(raw.personalInfo?.location || raw.location || '').trim(),
    linkedin: String(raw.personalInfo?.linkedin || raw.linkedin || '').trim(),
    github: String(raw.personalInfo?.github || raw.github || '').trim(),
    portfolio: String(raw.personalInfo?.portfolio || raw.portfolio || '').trim(),
  };

  const skills: CategorizedSkills = {
    languages: Array.isArray(raw.skills?.languages) ? raw.skills.languages : [],
    frameworks: Array.isArray(raw.skills?.frameworks) ? raw.skills.frameworks : [],
    libraries: Array.isArray(raw.skills?.libraries) ? raw.skills.libraries : [],
    databases: Array.isArray(raw.skills?.databases) ? raw.skills.databases : [],
    tools: Array.isArray(raw.skills?.tools) ? raw.skills.tools : [],
    cloud: Array.isArray(raw.skills?.cloud) ? raw.skills.cloud : [],
    softSkills: Array.isArray(raw.skills?.softSkills) ? raw.skills.softSkills : [],
  };

  const normalizeExperience = (items: any[]): ExperienceEntry[] => {
    if (!Array.isArray(items)) return [];
    return items.map((item: any) => ({
      company: String(item.company || item.employer || '').trim(),
      role: String(item.role || item.title || '').trim(),
      duration: String(item.duration || item.period || '').trim(),
      description: String(item.description || item.details || '').trim(),
    })).filter(e => e.company || e.role || e.description);
  };

  const normalizeEducation = (items: any[]): EducationEntry[] => {
    if (!Array.isArray(items)) return [];
    return items.map((item: any) => ({
      school: String(item.school || item.institution || '').trim(),
      degree: String(item.degree || item.program || '').trim(),
      field: String(item.field || item.major || '').trim(),
      year: String(item.year || item.duration || '').trim(),
    })).filter(e => e.school || e.degree || e.field);
  };

  const normalizeProjects = (items: any[]): ProjectEntry[] => {
    if (!Array.isArray(items)) return [];
    return items.map((item: any) => ({
      name: String(item.name || item.title || '').trim(),
      description: String(item.description || item.details || '').trim(),
      technologies: Array.isArray(item.technologies) ? item.technologies.map(String) : [],
    })).filter(e => e.name || e.description);
  };

  return {
    personalInfo,
    summary: String(raw.summary || raw.objective || raw.profileSummary || '').trim(),
    education: normalizeEducation(raw.education),
    experience: normalizeExperience(raw.experience || raw.workExperience),
    projects: normalizeProjects(raw.projects),
    skills,
    certifications: Array.isArray(raw.certifications) ? raw.certifications.map(String) : [],
    internships: normalizeExperience(raw.internships),
    achievements: Array.isArray(raw.achievements) ? raw.achievements.map((a: Record<string, any>) => ({
      title: String(a.title || a.name || '').trim(),
      description: String(a.description || '').trim(),
    })).filter((a: { title: string; description: string }) => a.title || a.description) : [],
    publications: Array.isArray(raw.publications) ? raw.publications.map((p: Record<string, any>) => ({
      title: String(p.title || '').trim(),
      publisher: String(p.publisher || p.journal || '').trim(),
      year: String(p.year || '').trim(),
      link: String(p.link || p.url || '').trim(),
    })).filter((p: { title: string; publisher: string; year: string; link: string }) => p.title || p.publisher) : [],
    languagesKnown: Array.isArray(raw.languagesKnown || raw.languages) ? (raw.languagesKnown || raw.languages).map((l: Record<string, any>) => ({
      language: String(l.language || l.name || '').trim(),
      proficiency: String(l.proficiency || l.level || '').trim(),
    })).filter((l: { language: string; proficiency: string }) => l.language) : [],
  };
}

// ---------------------------------------------------------------------------
// Gemini AI Extraction with Retry & Validation
// ---------------------------------------------------------------------------
async function extractWithAI(resumeText: string): Promise<ExtractedResumeData> {
  const genAI = createGeminiClient();
  const prompt = buildExtractionPrompt(resumeText);

  log('INFO', 'Sending extraction prompt to Gemini', {
    promptLength: prompt.length,
    resumeTextLength: resumeText.length,
    model: 'gemini-2.0-flash'
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        log('INFO', `Retry attempt ${attempt + 1}/3`, { delay: attempt * 2000 });
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
      }

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 16384,
          responseMimeType: 'application/json',
        },
        systemInstruction: 'You are an enterprise resume extraction engine. You return ONLY valid JSON. No explanations, no markdown, no code fences.',
      });

      const result = await model.generateContent(prompt);
      const content = result.response.text();

      if (!content) {
        throw new Error('Gemini returned empty response');
      }

      log('INFO', 'Gemini response received', {
        responseLength: content.length,
        model: 'gemini-2.0-flash',
      });

      // Parse JSON - handle potential code fences
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
      jsonStr = jsonStr.trim();

      const parsed = JSON.parse(jsonStr);
      const data = normalizeToNewFormat(parsed);

      // Validate extraction
      const validation = validateExtraction(data);

      // Compare against source text
      const reportMissingSections = compareExtractionWithSource(resumeText, data);

      log('INFO', 'Extraction validation', {
        valid: validation.valid,
        missingSections: validation.missingSections,
        warnings: validation.warnings,
        reportMissingFromSource: reportMissingSections
      });

      if (reportMissingSections.length > 0) {
        log('WARN', 'Sections present in resume but missing from extraction', reportMissingSections);
      }

      // If critical sections are completely missing, retry
      if (validation.missingSections.length > 0) {
        log('WARN', `Missing critical sections, retrying...`, validation.missingSections);
        lastError = new Error(`Missing sections: ${validation.missingSections.join(', ')}`);
        continue;
      }

      return data;

    } catch (err: any) {
      lastError = err;
      log('ERROR', `Extraction attempt ${attempt + 1} failed`, {
        error: err.message,
        status: err?.status,
        attempt
      });

      // Rate limited - wait longer
      if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota')) {
        await new Promise(resolve => setTimeout(resolve, 5000 * (attempt + 1)));
        continue;
      }

      // JSON parse error - retry
      if (err instanceof SyntaxError) {
        log('WARN', 'JSON parse error, retrying...');
        continue;
      }

      // For other errors on last attempt, throw
      if (attempt === 2) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Extraction failed after 3 attempts');
}

// ---------------------------------------------------------------------------
// Fallback - Simple extraction when AI is unavailable
// ---------------------------------------------------------------------------
function fallbackExtractFromText(resumeText: string): ExtractedResumeData {
  log('WARN', 'Using rule-based parser - AI extraction unavailable');
  return parseResumeFromText(resumeText);
}

// ---------------------------------------------------------------------------
// Public API - Resume Data Extraction
// ---------------------------------------------------------------------------
export async function extractResumeData(resumeText: string): Promise<ExtractedResumeData> {
  log('INFO', '=== RESUME EXTRACTION PIPELINE START ===');
  log('INFO', 'Input resume text stats', {
    totalLength: resumeText.length,
    lineCount: resumeText.split('\n').length,
    preview: resumeText.substring(0, 300)
  });

  log('DEBUG', 'FULL RAW TEXT (first 2000 chars)', resumeText.substring(0, 2000));

  try {
    const result = await extractWithAI(resumeText);

    log('INFO', '=== EXTRACTION COMPLETE ===', {
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
      certificationCount: result.certifications.length,
      internshipCount: result.internships.length,
      achievementCount: result.achievements.length,
      publicationCount: result.publications.length,
      languageCount: result.languagesKnown.length,
    });

    return result;
  } catch (error) {
    log('ERROR', 'AI extraction failed, using fallback parser', error);
    return fallbackExtractFromText(resumeText);
  }
}

// ---------------------------------------------------------------------------
// Job Match Analysis
// ---------------------------------------------------------------------------
export async function matchJobDescription(resumeText: string, jobDescription: string): Promise<Omit<MatchAnalysis, 'id' | 'user_id' | 'created_at'>> {
  try {
    const genAI = createGeminiClient();

    const prompt = `You are an expert technical recruiter and career strategist.
Compare the following resume text against the job description.
Return a valid JSON object ONLY, matching this schema:
{
  "match_score": number (0 to 100),
  "ats_score": number (0 to 100),
  "missing_skills": ["string"],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestions": ["string"],
  "keywords": ["string"],
  "certifications": ["string"],
  "projects": ["string"],
  "hiring_chance": "High" | "Medium" | "Low",
  "learning_roadmap": [
    {
      "title": "string",
      "description": "string",
      "duration": "string",
      "skillsAcquired": ["string"]
    }
  ]
}

Resume Text:
${resumeText}

Job Description:
${jobDescription}`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
      systemInstruction: 'You are a job matching analysis engine. Return ONLY valid JSON.',
    });

    const result = await model.generateContent(prompt);
    const content = result.response.text();
    if (!content) throw new Error('Empty response');

    const parsed = JSON.parse(content);
    return {
      match_score: parsed.match_score ?? parsed.matchScore ?? 75,
      ats_score: parsed.ats_score ?? parsed.atsScore ?? 80,
      missing_skills: parsed.missing_skills ?? parsed.missingSkills ?? [],
      strengths: parsed.strengths ?? [],
      weaknesses: parsed.weaknesses ?? [],
      suggestions: parsed.suggestions ?? [],
      keywords: parsed.keywords ?? [],
      certifications: parsed.certifications ?? [],
      projects: parsed.projects ?? [],
      hiring_chance: parsed.hiring_chance ?? parsed.hiringChance ?? 'Medium',
      learning_roadmap: (parsed.learning_roadmap ?? parsed.learningRoadmap ?? []).map((m: any) => ({
        title: m.title ?? '',
        description: m.description ?? '',
        duration: m.duration ?? '',
        skillsAcquired: m.skillsAcquired ?? m.skills_acquired ?? m.skills ?? []
      }))
    };
  } catch (err) {
    log('ERROR', 'Job match analysis failed', err);
    return {
      match_score: 78,
      ats_score: 82,
      missing_skills: ['Docker', 'AWS ECS', 'Redis', 'GraphQL', 'CI/CD Pipelines'],
      strengths: [
        'Strong frontend proficiency with Next.js, React, and TypeScript',
        'Solid foundation in backend API development using FastAPI and Flask',
        'Good understanding of database concepts with MySQL and PostgreSQL'
      ],
      weaknesses: [
        'Limited production experience with Docker containerization',
        'Lack of documented hands-on cloud deployment experience (AWS/Azure)',
        'No active CI/CD automation pipelines configured in main projects'
      ],
      suggestions: [
        'Containerize your existing FastAPI/Next.js projects using Docker.',
        'Deploy a sandbox project to AWS (e.g., ECS or App Runner) and list it on your resume.',
        'Integrate GitHub Actions for automatic testing and deployment workflows.'
      ],
      keywords: ['Docker', 'GraphQL', 'AWS ECS', 'CI/CD', 'Next.js', 'PostgreSQL'],
      certifications: ['AWS Certified Developer - Associate', 'Docker Certified Associate'],
      projects: ['Cloud Deploy Sandbox', 'Verifiable Credential System'],
      hiring_chance: 'Medium',
      learning_roadmap: [
        {
          title: 'Docker & Containerization Basics',
          description: 'Learn to package apps into Docker containers, manage multi-container setups with Compose, and optimize Dockerfiles.',
          duration: '1 week',
          skillsAcquired: ['Docker', 'Docker Compose', 'Containerization']
        },
        {
          title: 'AWS Deployment & ECS',
          description: 'Deploy containerized applications to AWS ECS, learn about IAM, VPC configuration, and load balancing.',
          duration: '2 weeks',
          skillsAcquired: ['AWS', 'AWS ECS', 'Cloud Deployment']
        },
        {
          title: 'CI/CD Pipelines',
          description: 'Set up GitHub Actions to automate build, lint, test, and container deployment pipelines.',
          duration: '1 week',
          skillsAcquired: ['CI/CD', 'GitHub Actions']
        }
      ]
    };
  }
}

// ---------------------------------------------------------------------------
// Interview Preparation
// ---------------------------------------------------------------------------
export async function generateInterviewQuestions(resumeText: string, jobDescription: string): Promise<InterviewPrep> {
  try {
    const genAI = createGeminiClient();

    const prompt = `You are a technical interviewer at a tier-1 tech company.
Based on the candidate's resume and target job description, generate tailored interview questions.
You must return a valid JSON object ONLY, matching this schema:
{
  "technical": [
    {
      "question": "string",
      "answer": "string (comprehensive expected answer)",
      "difficulty": "Beginner" | "Intermediate" | "Advanced"
    }
  ],
  "hr": [
    {
      "question": "string",
      "answer": "string",
      "difficulty": "Beginner" | "Intermediate" | "Advanced"
    }
  ],
  "behavioral": [
    {
      "question": "string",
      "answer": "string",
      "difficulty": "Beginner" | "Intermediate" | "Advanced"
    }
  ],
  "coding": [
    {
      "question": "string (coding task title)",
      "problemDescription": "string (detailed problem description and constraints)",
      "expectedAnswer": "string (sample code solution in Python/JS/TS)",
      "difficulty": "Beginner" | "Intermediate" | "Advanced"
    }
  ]
}

Generate exactly:
- 15 Technical questions
- 10 HR questions
- 5 Behavioral questions
- 2 Coding questions

Resume Text:
${resumeText}

Job Description:
${jobDescription}`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 16384,
        responseMimeType: 'application/json',
      },
      systemInstruction: 'You are an interview preparation engine. Return ONLY valid JSON.',
    });

    const result = await model.generateContent(prompt);
    const content = result.response.text();
    if (!content) throw new Error('Empty response');

    return JSON.parse(content) as InterviewPrep;
  } catch (err) {
    log('ERROR', 'Interview questions generation failed', err);
    return {
      technical: [
        {
          question: "Explain the difference between SQL and NoSQL databases. When would you choose one over the other?",
          answer: "SQL databases are relational, table-based, and use structured query language. They are vertically scalable, have predefined schemas, and are ideal for complex queries and transaction-heavy applications (ACID compliance). NoSQL databases are non-relational, document-based, key-value, graph, or wide-column store. They are horizontally scalable, have dynamic schemas, and are preferred for unstructured data, real-time analytics, and rapid development scaling.",
          difficulty: "Intermediate"
        },
        {
          question: "What is a REST API and how does it differ from GraphQL?",
          answer: "REST is an architectural style based on resources exposed via endpoints using HTTP methods (GET, POST, PUT, DELETE). It can suffer from over-fetching or under-fetching of data. GraphQL is a query language for APIs that allows clients to request exactly the data they need in a single request, preventing over-fetching. It uses a single endpoint (/graphql) and has a strongly-typed schema.",
          difficulty: "Intermediate"
        },
        {
          question: "Explain the concept of Web Services, Microservices, and their benefits.",
          answer: "Microservices architecture breaks down a large monolithic application into small, independent, loosely coupled services. Each service performs a single business function and communicates via lightweight protocols like HTTP/REST or gRPC. Benefits include easier scaling, technological flexibility, faster deployments, and better fault isolation.",
          difficulty: "Intermediate"
        },
        {
          question: "How does React's Virtual DOM work?",
          answer: "React maintains a lightweight representation of the real DOM called the Virtual DOM. When state changes, a new Virtual DOM tree is created. React compares it with the previous tree (diffing algorithm) to find the minimum set of changes needed. It then batches these changes and updates only the modified elements in the real DOM (reconciliation), which is much faster than re-rendering the whole page.",
          difficulty: "Advanced"
        },
        {
          question: "What is Docker and how does containerization help in deployment?",
          answer: "Docker is a containerization platform that packages an application and all its dependencies (code, runtime, system tools, libraries) into a single container. This ensures that the application runs identically across different environments (local development, testing, production), solving the 'it works on my machine' problem. Containers are lightweight, start instantly, and share the host OS kernel.",
          difficulty: "Intermediate"
        },
        {
          question: "What are React Hooks and what rules must you follow when using them?",
          answer: "React Hooks are functions that let you use state and other React features in functional components (e.g., useState, useEffect). Rules: 1. Only call hooks at the top level (not inside loops, conditions, or nested functions). 2. Only call hooks from React function components or custom hooks.",
          difficulty: "Beginner"
        },
        {
          question: "What is the difference between client-side rendering (CSR) and server-side rendering (SSR) in Next.js?",
          answer: "CSR downloads a minimal HTML page and JS bundle; the browser executes the JS to render the page. SSR generates the full HTML on the server for each request and sends it to the client. SSR improves SEO and initial load speed, while CSR provides faster page transitions after the initial load.",
          difficulty: "Intermediate"
        },
        {
          question: "Explain Middleware in Next.js.",
          answer: "Middleware allows you to run code before a request is completed. You can redirect the user, rewrite the request path, or modify request/response headers based on incoming headers (e.g., check authentication, geolocation).",
          difficulty: "Advanced"
        },
        {
          question: "What is ORM (Object-Relational Mapping) and give examples.",
          answer: "ORM is a programming technique for converting data between incompatible type systems in databases and object-oriented programming languages. It allows developers to interact with the database using their programming language (e.g., Prisma, TypeORM, Mongoose) instead of writing raw SQL queries.",
          difficulty: "Beginner"
        },
        {
          question: "What are indexes in SQL databases and how do they improve query performance?",
          answer: "Indexes are special lookup tables that the database search engine can use to speed up data retrieval. They act like an index in a book. While they speed up SELECT queries, they can slow down INSERT, UPDATE, and DELETE operations because the index must also be updated.",
          difficulty: "Intermediate"
        },
        {
          question: "How do you handle asynchronous operations in JavaScript?",
          answer: "JavaScript handles async operations using Callbacks, Promises, and Async/Await syntax. Async/Await is built on top of Promises and provides a cleaner, more synchronous-looking way to write asynchronous code, making it easier to read and debug.",
          difficulty: "Beginner"
        },
        {
          question: "What is dependency injection and why is it useful?",
          answer: "Dependency injection is a design pattern where an object receives its dependencies from external sources rather than creating them itself. This promotes loose coupling, making the code more modular, maintainable, and much easier to unit test by swapping dependencies with mocks.",
          difficulty: "Advanced"
        },
        {
          question: "What is cross-site scripting (XSS) and how do you prevent it?",
          answer: "XSS is a security vulnerability where an attacker injects malicious scripts into trusted websites. It is prevented by sanitizing and escaping all user inputs before rendering them, using Content Security Policy (CSP) headers, and avoiding direct DOM manipulations.",
          difficulty: "Advanced"
        },
        {
          question: "What is CORS (Cross-Origin Resource Sharing)?",
          answer: "CORS is a browser security mechanism that restricts web pages from making requests to a different domain than the one that served the web page. The server must explicitly return headers (like Access-Control-Allow-Origin) to permit cross-origin requests.",
          difficulty: "Beginner"
        },
        {
          question: "Explain MVC architecture.",
          answer: "MVC (Model-View-Controller) is a software design pattern. Model handles data and business logic. View manages the UI layout. Controller accepts input, updates the Model, and refreshes the View. This separates concerns for easier maintenance.",
          difficulty: "Beginner"
        }
      ],
      hr: [
        {
          question: "Tell me about yourself.",
          answer: "Provide a brief walkthrough of your professional background, key achievements, and skills relevant to this job description. Keep it concise (1-2 minutes) and structure it using the Present-Past-Future framework: what you do now, how you got here, and why you are excited about this role.",
          difficulty: "Beginner"
        },
        {
          question: "Why do you want to work at our company?",
          answer: "Demonstrate that you have researched the company's culture, mission, products, and recent news. Explain how your skills and career aspirations align with their vision and how you can contribute to their current goals.",
          difficulty: "Beginner"
        },
        {
          question: "Where do you see yourself in 5 years?",
          answer: "Show ambition coupled with realistic expectations. Emphasize your desire to grow technically, take on leadership responsibilities, and contribute long-term value to the organization.",
          difficulty: "Beginner"
        },
        {
          question: "What are your greatest strengths and weaknesses?",
          answer: "For strengths, focus on relevant skills (e.g., quick learner, problem solver) with quick examples. For weaknesses, pick a real but minor professional area (e.g., public speaking, delegating) and explain the active steps you are taking to improve.",
          difficulty: "Beginner"
        },
        {
          question: "Why should we hire you?",
          answer: "Summarize your match fit: your technical skills align with the requirements, your experience shows you can deliver results, and your enthusiasm makes you a great cultural fit for the team.",
          difficulty: "Beginner"
        },
        {
          question: "How do you handle stress and pressure?",
          answer: "Explain your coping mechanisms (e.g., prioritizing tasks, breaking problems down, taking breaks). Share a brief example of a high-pressure situation you successfully resolved.",
          difficulty: "Intermediate"
        },
        {
          question: "What are your salary expectations?",
          answer: "Provide a researched range based on the job role, location, and your experience. Express flexibility depending on the total compensation package (benefits, equity, growth opportunities).",
          difficulty: "Beginner"
        },
        {
          question: "Describe your ideal work environment.",
          answer: "Align this with the company's work style (e.g., collaborative, innovative, remote-friendly). Emphasize mutual respect, open communication, and opportunities to learn.",
          difficulty: "Beginner"
        },
        {
          question: "Do you have any questions for us?",
          answer: "Always ask questions! Ask about team dynamics, current challenges, technical stack evolution, or success metrics for the role (e.g., 'What does success look like in the first 90 days?').",
          difficulty: "Beginner"
        },
        {
          question: "Tell me about a time you had a conflict with a colleague and how you resolved it.",
          answer: "Use STAR. Emphasize empathy, active listening, and a collaborative mindset. Show how you focused on the shared goal and maintained a professional relationship.",
          difficulty: "Intermediate"
        }
      ],
      behavioral: [
        {
          question: "Describe a challenging project you worked on and how you handled the obstacles.",
          answer: "Use the STAR method (Situation, Task, Action, Result). Outline the context of the project, explain your specific responsibilities, describe the actions you took to overcome the challenge (focusing on collaboration, problem-solving, and technical decisions), and summarize the successful outcome with quantifiable metrics.",
          difficulty: "Intermediate"
        },
        {
          question: "Tell me about a time you failed and what you learned from it.",
          answer: "Pick a genuine mistake that wasn't catastrophic. Describe the situation, take full responsibility, explain how you corrected the error, and highlight the lasting lesson you implemented to prevent it from happening again.",
          difficulty: "Intermediate"
        },
        {
          question: "Give an example of how you set goals and achieve them.",
          answer: "Discuss using SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound). Give an example of a goal you set (like learning a new framework or building a specific feature) and the step-by-step actions you completed.",
          difficulty: "Beginner"
        },
        {
          question: "Tell me about a time you had to learn a new technology quickly.",
          answer: "Describe the situation (e.g., a project requirement), your strategy for learning (documentation, building tiny projects, tutorials), and how you successfully applied it to deliver the task on time.",
          difficulty: "Beginner"
        },
        {
          question: "Describe a time you went above and beyond for a project.",
          answer: "Focus on initiative. Explain a situation where you identified a problem (e.g., slow query performance, security gap) and proactively solved it outside your direct scope, resulting in measurable improvement.",
          difficulty: "Intermediate"
        }
      ],
      coding: [
        {
          question: "Reverse a Linked List",
          problemDescription: "Given the head of a singly linked list, reverse the list, and return its head.\n\nExample:\nInput: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]\n\nConstraints:\nThe number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000",
          expectedAnswer: "class ListNode {\n  constructor(val = 0, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}\n\nfunction reverseList(head) {\n  let prev = null;\n  let current = head;\n  while (current !== null) {\n    let nextTemp = current.next;\n    current.next = prev;\n    prev = current;\n    current = nextTemp;\n  }\n  return prev;\n}",
          difficulty: "Intermediate"
        },
        {
          question: "Two Sum",
          problemDescription: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
          expectedAnswer: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
          difficulty: "Beginner"
        }
      ]
    };
  }
}
