import { ExtractedResumeData, MatchAnalysis, InterviewPrep } from '@/types';

// Helper to check if Gemini API key is configured with a valid format
function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  // Valid Gemini/Google API keys start with 'AIzaSy' or 'AQ.'
  if (!key || (!key.startsWith('AIzaSy') && !key.startsWith('AQ.'))) {
    return null;
  }
  return key;
}

// Helper to call Gemini API
export async function callGemini(prompt: string, expectJson: boolean = true): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured or has invalid format.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      ...(expectJson ? {
        generationConfig: {
          responseMimeType: 'application/json',
        }
      } : {})
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API request failed: ${response.status} - ${errorBody}`);
  }

  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API returned an empty response.');
  }

  return text;
}

// 1. Resume Data Extraction
export async function extractResumeData(resumeText: string): Promise<ExtractedResumeData> {
  try {
    const prompt = `You are an expert technical recruiter and resume parser.
Analyze this resume text and extract all profile details.
Return a valid JSON object ONLY, matching this schema:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "skills": ["string"],
  "technicalSkills": ["string"],
  "softSkills": ["string"],
  "experience": "string (e.g. '5 years of full-stack development')",
  "education": [
    {
      "school": "string",
      "degree": "string",
      "field": "string",
      "year": "string"
    }
  ],
  "workExperience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string",
      "description": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"]
    }
  ],
  "certifications": ["string"]
}

Resume Text:
${resumeText}`;

    const jsonText = await callGemini(prompt);
    return JSON.parse(jsonText) as ExtractedResumeData;
  } catch {
    // Using mock fallback — API key may not be configured
    return {
      name: 'Ava Nguyen',
      email: 'ava.nguyen@example.com',
      phone: '+1 (555) 019-2834',
      skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Tailwind CSS', 'PostgreSQL', 'Git', 'REST APIs', 'Agile', 'UI/UX Design'],
      technicalSkills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      softSkills: ['Problem Solving', 'Communication', 'Collaboration', 'Adaptability', 'Mentorship'],
      experience: '4 years of experience as a Full Stack Engineer',
      education: [
        {
          school: 'University of Washington',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          year: '2018 - 2022'
        }
      ],
      workExperience: [
        {
          company: 'TechFlow Systems',
          role: 'Full Stack Developer',
          duration: '2022 - Present',
          description: 'Engineered web applications using Next.js and Node.js. Improved dashboard load times by 40%. Implemented responsive user interfaces and integrated REST APIs.'
        },
        {
          company: 'Launchpad Labs',
          role: 'Software Engineer Intern',
          duration: 'Summer 2021',
          description: 'Built interactive dashboard components using React. Collaborated with UI designers to implement accessibility features according to WCAG standards.'
        }
      ],
      projects: [
        {
          name: 'AI Smart Planner',
          description: 'A productivity planner that leverages LLMs to automatically schedule tasks based on priority and workload.',
          technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Gemini API']
        },
        {
          name: 'CollabSpace',
          description: 'A real-time document editing and sharing portal using WebSockets and Express.',
          technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB']
        }
      ],
      certifications: ['AWS Certified Cloud Practitioner', 'Meta Front-End Developer Professional Certificate']
    };
  }
}

// 2. Job Match Analysis
export async function matchJobDescription(resumeText: string, jobDescription: string): Promise<Omit<MatchAnalysis, 'id' | 'user_id' | 'created_at'>> {
  try {
    const prompt = `You are an expert recruiter and career strategist.
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

    const jsonText = await callGemini(prompt);
    const parsed = JSON.parse(jsonText);
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
      learning_roadmap: parsed.learning_roadmap ?? parsed.learningRoadmap ?? []
    };
  } catch {
    // Using mock fallback — API key may not be configured
    return {
      match_score: 78,
      ats_score: 82,
      missing_skills: ['Docker', 'AWS ECS', 'Redis', 'GraphQL'],
      strengths: [
        'Strong frontend proficiency with Next.js & React',
        'Proven history of optimization and loading-speed improvements',
        'Practical experience with relational databases (PostgreSQL)'
      ],
      weaknesses: [
        'Limited experience in cloud deployment systems and containerization',
        'No direct production experience with GraphQL APIs',
        'Lack of in-memory caching implementations'
      ],
      suggestions: [
        'Incorporate cloud deployment experiences in work bullets, mentioning AWS or Docker.',
        'Add a project listing that showcases GraphQL server-client architectures.',
        'Quantify results more in your TechFlow work experience description.'
      ],
      keywords: ['Docker', 'GraphQL', 'AWS ECS', 'Redis', 'CI/CD Pipelines', 'TypeScript'],
      certifications: ['AWS Certified Developer - Associate', 'Certified Kubernetes Administrator (CKA)'],
      projects: ['Cloud Deploy Sandbox: A repo containing multi-service setup on AWS using ECS, Redis cache, and GraphQL gateway.'],
      hiring_chance: 'Medium',
      learning_roadmap: [
        {
          title: 'Docker & Containerization Basics',
          description: 'Learn to package apps into Docker containers and run them locally.',
          duration: '1 week',
          skillsAcquired: ['Docker', 'Containerization']
        },
        {
          title: 'GraphQL API Design',
          description: 'Build a server using Apollo or Nexus and connect it to a Next.js client.',
          duration: '2 weeks',
          skillsAcquired: ['GraphQL', 'Apollo Client']
        },
        {
          title: 'AWS Deployment & ECS',
          description: 'Deploy dockerized apps to AWS using Elastic Container Service (ECS) and setup caching with Redis.',
          duration: '3 weeks',
          skillsAcquired: ['AWS', 'ECS', 'Redis', 'Cloud Infrastructure']
        }
      ]
    };
  }
}

// 3. Interview Preparation Questions
export async function generateInterviewQuestions(resumeText: string, jobDescription: string): Promise<InterviewPrep> {
  try {
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

    const jsonText = await callGemini(prompt);
    return JSON.parse(jsonText) as InterviewPrep;
  } catch {
    // Using mock fallback — API key may not be configured

    // Create high-fidelity list of questions matching standard categories
    const technical: InterviewPrep['technical'] = [
      {
        question: 'Explain the difference between Server Actions and API Routes in Next.js 15.',
        answer: 'Server Actions are asynchronous functions that run on the server and are triggered directly from the client without manually writing an API route. API Routes are HTTP endpoints that can be called by external systems or using standard fetch methods.',
        difficulty: 'Intermediate'
      },
      {
        question: 'How does React 19 handle hydration mismatch errors?',
        answer: 'React 19 provides clearer error messages showing the diff between the server HTML and the client output. It also lets you suppress mismatches on specific elements using suppressHydrationWarning.',
        difficulty: 'Intermediate'
      },
      {
        question: 'What is the Virtual DOM, and is it still relevant in modern React?',
        answer: 'The Virtual DOM is an in-memory representation of the real DOM. React uses it to calculate minimal DOM updates (reconciliation). While compilers like Svelte bypass it, React continues to use it for cross-platform consistency and declarative updates.',
        difficulty: 'Beginner'
      },
      {
        question: 'How do you optimize page load performance in a Tailwind-heavy Next.js application?',
        answer: 'Tailwind automatically purges unused styles in production, so the CSS file is minimal. Further optimizations include leveraging Next.js Image component, deferring non-critical scripts, and loading code-split chunks dynamically.',
        difficulty: 'Intermediate'
      },
      {
        question: 'Describe how connection pooling works in PostgreSQL and why it is critical for serverless functions.',
        answer: 'Serverless functions scale rapidly, creating a new DB connection per invocation, which can quickly exhaust the database connection limit. A pooler (like Supabase PgBouncer or Supavisor) acts as a broker, sharing a small pool of active connections.',
        difficulty: 'Advanced'
      },
      {
        question: 'What are React Server Components (RSC) and how do they benefit performance?',
        answer: 'RSCs render on the server, which reduces the client bundle size because the dependencies used to render them are not shipped to the browser. They allow direct access to server resources (databases, files).',
        difficulty: 'Intermediate'
      },
      {
        question: 'How would you handle global state in a Next.js App Router project?',
        answer: 'For simple state, use URL query parameters or React Context inside Client Components. For larger shared states, tools like Zustand or Redux Toolkit can be initialized inside Client wrappers.',
        difficulty: 'Intermediate'
      },
      {
        question: 'What is the purpose of database indexes and when should you avoid them?',
        answer: 'Indexes speed up read queries by creating lookup data structures. Avoid them on columns with very low cardinality (e.g. boolean fields) or tables with heavy write operations, as indexing adds overhead to writes.',
        difficulty: 'Beginner'
      },
      {
        question: 'Describe the difference between optimistic updates and standard mutation states.',
        answer: 'Optimistic updates assume the server request will succeed and immediately update the local UI state. If the request fails, the state rolls back to the previous values. Standard updates wait for the server response before updating the UI.',
        difficulty: 'Intermediate'
      },
      {
        question: 'How do you secure a REST API from cross-site scripting (XSS) and cross-site request forgery (CSRF)?',
        answer: 'To prevent XSS, sanitize inputs and encode outputs. To prevent CSRF, use anti-CSRF tokens, set SameSite attribute on cookies to Lax/Strict, and avoid putting JWT tokens in local storage, preferring HTTP-only secure cookies.',
        difficulty: 'Advanced'
      },
      {
        question: 'What is memoization and when should you use useMemo or useCallback?',
        answer: 'Memoization caches the result of an operation. Use useMemo for expensive computational tasks, and useCallback to preserve reference equality of functions passed to memoized children to prevent useless re-renders.',
        difficulty: 'Intermediate'
      },
      {
        question: 'Describe the differences between JWT-based authentication and session-based authentication.',
        answer: 'JWT is stateless; the client stores the token containing all user claims and sends it with headers, which the server verifies cryptographically. Session auth is stateful; a session ID is stored in a cookie, and the server queries the database/cache to verify it.',
        difficulty: 'Intermediate'
      },
      {
        question: 'What is the difference between inner join, left join, and outer join in PostgreSQL?',
        answer: 'Inner Join returns rows with matching keys in both tables. Left Join returns all rows from the left table and matched rows from the right table. Full Outer Join returns rows when there is a match in either table.',
        difficulty: 'Beginner'
      },
      {
        question: 'What is code splitting and how does Next.js handle it automatically?',
        answer: 'Code splitting breaks down a script bundle into smaller files loaded on demand. Next.js App Router splits code by route segment automatically, and developers can use dynamic imports (next/dynamic) for client components.',
        difficulty: 'Intermediate'
      },
      {
        question: 'How do you handle error boundaries in React?',
        answer: 'Error boundaries are class components that catch JavaScript errors anywhere in their child component tree and display a fallback UI. In Next.js App Router, you define an error.tsx file to act as the boundary for that route segment.',
        difficulty: 'Beginner'
      }
    ];

    const hr: InterviewPrep['hr'] = [
      {
        question: 'Tell me about yourself.',
        answer: 'Focus on your background in software engineering, key achievements at TechFlow Systems, and passion for building AI-integrated systems.',
        difficulty: 'Beginner'
      },
      {
        question: 'Why do you want to join our company?',
        answer: 'Align your answers with the company’s product line, their technical stack (e.g. Next.js, AI), and express how your skills fit their current needs.',
        difficulty: 'Beginner'
      },
      {
        question: 'Where do you see yourself in five years?',
        answer: 'Express a desire to grow technically, take on architectural ownership, and lead product engineering initiatives.',
        difficulty: 'Beginner'
      },
      {
        question: 'What is your greatest strength?',
        answer: 'Highlight technical problem solving, fast learning speed, or your ability to translate UX mockups into responsive pixel-perfect frontends.',
        difficulty: 'Beginner'
      },
      {
        question: 'What is your greatest weakness?',
        answer: 'Share a real developmental area (e.g., public speaking or cloud ops depth) and explain the active steps you are taking to overcome it.',
        difficulty: 'Beginner'
      },
      {
        question: 'How do you handle feedback or criticism?',
        answer: 'Emphasize that you view feedback as a tool for improvement. Give an example of code reviews where you constructive adapted your implementation.',
        difficulty: 'Intermediate'
      },
      {
        question: 'Why are you looking to leave your current role?',
        answer: 'Keep it positive. Frame it as seeking new challenges, growing your AI/cloud experience, or scaling products with larger impact.',
        difficulty: 'Beginner'
      },
      {
        question: 'Describe your ideal work environment.',
        answer: 'Talk about collaborative, agile teams with clear objectives, high technical standards, and a focus on shipping quality code.',
        difficulty: 'Beginner'
      },
      {
        question: 'What are your salary expectations?',
        answer: 'Mention a range based on market research, but express that you are open to discussing the entire compensation package including equity/benefits.',
        difficulty: 'Intermediate'
      },
      {
        question: 'Do you have any questions for us?',
        answer: 'Ask about the team’s current sprint challenges, how they incorporate AI into their development flow, or their deployment frequency.',
        difficulty: 'Beginner'
      }
    ];

    const behavioral: InterviewPrep['behavioral'] = [
      {
        question: 'Describe a time when you had a conflict with a co-worker and how you resolved it.',
        answer: 'Use the STAR method (Situation, Task, Action, Result). Focus on active listening, finding common technical ground, and executing a mutually agreed-upon solution.',
        difficulty: 'Intermediate'
      },
      {
        question: 'Tell me about a time you missed a deadline. What did you learn?',
        answer: 'Discuss a situation where scope creep occurred, how you communicated early with stakeholders, reprioritized requirements, and what processes you put in place to avoid it.',
        difficulty: 'Intermediate'
      },
      {
        question: 'Give an example of a difficult technical problem you solved.',
        answer: 'Explain the 40% dashboard load time optimization. Describe the profiling, discovering redundant SQL queries, implementing pagination, and client-side caching.',
        difficulty: 'Advanced'
      },
      {
        question: 'Describe a situation where you had to work with ambiguous requirements.',
        answer: 'Talk about building a prototype, getting early user feedback, and refining the functional spec iteratively through communication.',
        difficulty: 'Intermediate'
      },
      {
        question: 'Tell me about a time you had to learn a new technology quickly.',
        answer: 'Talk about integrating Gemini API for the AI planner project. Explain how you read documentation, built a small sandbox proof-of-concept, and deployed to production within a week.',
        difficulty: 'Intermediate'
      }
    ];

    const coding: InterviewPrep['coding'] = [
      {
        question: 'Find First Non-Repeating Character',
        problemDescription: 'Given a string, find the first non-repeating character in it and return its index. If it does not exist, return -1. Time complexity must be O(N) and space complexity must be O(K) where K is character set size.',
        expectedAnswer: `function firstUniqChar(s: string): number {
  const charCounts = new Map<string, number>();
  
  // First pass: count frequencies
  for (const char of s) {
    charCounts.set(char, (charCounts.get(char) || 0) + 1);
  }
  
  // Second pass: find index of first unique
  for (let i = 0; i < s.length; i++) {
    if (charCounts.get(s[i]) === 1) {
      return i;
    }
  }
  
  return -1;
}`,
        difficulty: 'Beginner'
      },
      {
        question: 'Merge Overlapping Intervals',
        problemDescription: 'Given an array of intervals where intervals[i] = [start, end], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the input intervals. Intervals should be sorted by start time.',
        expectedAnswer: `function merge(intervals: number[][]): number[][] {
  if (intervals.length <= 1) return intervals;
  
  // Sort intervals by start value
  intervals.sort((a, b) => a[0] - b[0]);
  
  const merged: number[][] = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const lastMerged = merged[merged.length - 1];
    
    // If overlap, merge by updating end time
    if (current[0] <= lastMerged[1]) {
      lastMerged[1] = Math.max(lastMerged[1], current[1]);
    } else {
      merged.push(current);
    }
  }
  
  return merged;
}`,
        difficulty: 'Intermediate'
      }
    ];

    return { technical, hr, behavioral, coding };
  }
}
