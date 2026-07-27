import {
  AchievementEntry,
  CategorizedSkills,
  EducationEntry,
  ExperienceEntry,
  ExtractedResumeData,
  LanguageEntry,
  PersonalInfo,
  ProjectEntry,
  PublicationEntry,
} from '@/types';

const SECTION_PATTERNS: Record<string, RegExp> = {
  summary: /^(professional\s+summary|summary|objective|about(\s+me)?|profile|career\s+objective)\s*$/i,
  experience: /^(experience|work\s+experience|employment(\s+history)?|professional\s+experience)\s*$/i,
  education: /^(education|academic(\s+background)?|qualifications?)\s*$/i,
  skills: /^(skills|technical\s+skills|technologies|programming\s+skills|core\s+competencies)\s*$/i,
  projects: /^(projects?|portfolio|personal\s+projects?)\s*$/i,
  certifications: /^(certifications?|certificates?|licenses?|credentials?)\s*$/i,
  achievements: /^(achievements?|awards?|honors?|recognition)\s*$/i,
  publications: /^(publications?|papers?|research)\s*$/i,
  languages: /^(languages?|language\s+proficiency)\s*$/i,
  internships: /^(internships?|internship\s+experience)\s*$/i,
};

const DATE_RANGE =
  /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?\d{4}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(?:\d{4}|Present|Current)/i;

const KNOWN_SKILLS: Record<keyof Omit<CategorizedSkills, 'softSkills'>, string[]> = {
  languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Kotlin', 'Swift', 'Ruby', 'PHP', 'SQL', 'HTML', 'CSS', 'R', 'Scala', 'Julia', 'HTML5', 'CSS3'],
  frameworks: ['React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'FastAPI', 'Streamlit', 'Ruby on Rails'],
  libraries: ['TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy', 'Redux', 'React Query', 'Jest', 'Cypress', 'D3.js', 'Lodash', 'Keras', 'XGBoost'],
  databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase', 'Supabase', 'SQLite', 'Elasticsearch', 'BigQuery', 'Snowflake', 'Oracle'],
  tools: ['Git', 'GitHub', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Ansible', 'Figma', 'Postman', 'MLflow', 'Jira', 'Confluence', 'Notion', 'Tableau', 'Power BI'],
  cloud: ['AWS', 'Azure', 'GCP', 'Heroku', 'Vercel', 'SageMaker', 'Vertex AI', 'Netlify', 'Cloudflare'],
};

const SOFT_SKILLS = [
  'Communication', 'Teamwork', 'Leadership', 'Problem Solving', 'Critical Thinking',
  'Collaboration', 'Project Management', 'Time Management', 'Adaptability',
];

function splitIntoSections(text: string): Record<string, string> {
  const lines = text.split('\n');
  const sections: Record<string, string> = {};
  let currentSection = 'header';
  const buffers: Record<string, string[]> = { header: [] };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const normalized = line.replace(/[:\s]+$/, '').trim();
    let matchedSection: string | null = null;

    for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(normalized)) {
        matchedSection = key;
        break;
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
      if (!buffers[currentSection]) buffers[currentSection] = [];
      continue;
    }

    if (!buffers[currentSection]) buffers[currentSection] = [];
    buffers[currentSection].push(line);
  }

  for (const [key, buf] of Object.entries(buffers)) {
    sections[key] = buf.join('\n').trim();
  }

  return sections;
}

function extractPersonalInfo(text: string, headerSection: string): PersonalInfo {
  const source = `${headerSection}\n${text.split('\n').slice(0, 8).join('\n')}`;
  const lines = source.split('\n').map((l) => l.trim()).filter(Boolean);

  const emailMatch = source.match(/([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})/);
  const phoneMatch = source.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
  const linkedinMatch = source.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
  const githubMatch = source.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i);
  const portfolioMatch = source.match(/(?:https?:\/\/)?(?:[\w-]+\.)+(?:dev|io|me|com)\/[\w-]+/i);

  const locationMatch = source.match(
    /\b([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}|[A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+|Remote|Hyderabad|Mumbai|Delhi|Bangalore|Bengaluru|Chennai|Pune|Kolkata|Ahmedabad|Jaipur|Lucknow|Noida|Gurgaon|Gurugram|New York|San Francisco|London|Toronto|Singapore|Chicago)\b/
  );

  let name = '';
  for (const line of lines) {
    if (emailMatch && line.includes(emailMatch[1])) continue;
    if (phoneMatch && line.includes(phoneMatch[0])) continue;
    if (/linkedin|github|http|www\./i.test(line)) continue;
    if (line.length > 2 && line.length < 60 && /^[A-Z]/.test(line) && !SECTION_PATTERNS.summary.test(line)) {
      name = line.replace(/\s*\|.*$/, '').trim();
      break;
    }
  }

  return {
    name,
    email: emailMatch?.[1] || '',
    phone: phoneMatch?.[0]?.trim() || '',
    location: locationMatch?.[1]?.trim() || '',
    linkedin: linkedinMatch?.[0] || '',
    github: githubMatch?.[0] || '',
    portfolio: portfolioMatch?.[0] && !portfolioMatch[0].includes('linkedin') && !portfolioMatch[0].includes('github')
      ? portfolioMatch[0]
      : '',
  };
}

function parseExperienceBlock(block: string): ExperienceEntry[] {
  if (!block) return [];

  const entries: ExperienceEntry[] = [];
  const chunks = block.split(/\n(?=[A-Z][^\n]{2,80}(?:\||\n|$))/);

  for (const chunk of chunks) {
    const chunkLines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (chunkLines.length === 0) continue;

    const headerLine = chunkLines[0];
    const dateMatch = chunk.match(DATE_RANGE);
    const duration = dateMatch?.[0] || '';

    let company = '';
    let role = '';

    if (headerLine.includes('|')) {
      const parts = headerLine.split('|').map((p) => p.trim());
      company = parts[0] || '';
      role = parts[1] || '';
    } else {
      const lines = chunkLines.slice(0, 3);
      role = lines[0] || '';
      company = lines.find((l, i) => i > 0 && !DATE_RANGE.test(l) && l !== role) || '';
    }

    const bullets = chunkLines
      .filter((l) => /^[-•*–—]\s/.test(l) || /^\d+\.\s/.test(l))
      .map((l) => l.replace(/^[-•*–—]\s*|^\d+\.\s*/, '').trim());

    const description = bullets.length > 0
      ? bullets.join('\n')
      : chunkLines.slice(1).filter((l) => l !== company && l !== role && !DATE_RANGE.test(l)).join('\n');

    if (company || role || description) {
      entries.push({
        company: company.replace(/\s*\|.*$/, '').trim(),
        role: role.trim(),
        duration,
        description,
      });
    }
  }

  return entries;
}

function parseEducationBlock(block: string): EducationEntry[] {
  if (!block) return [];

  const entries: EducationEntry[] = [];
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const degreePattern =
      /(B\.?\s*Tech|M\.?\s*Tech|Bachelor|Master|Ph\.?\s*D|M\.?\s*Sc|B\.?\s*Sc|B\.?\s*A|M\.?\s*A|Diploma|Associate|MBA|B\.?\s*E|M\.?\s*E)[^\n]*/i;

    if (degreePattern.test(line)) {
      const yearMatch = (line + ' ' + (lines[i + 1] || '')).match(DATE_RANGE) ||
        (line + ' ' + (lines[i + 1] || '')).match(/\d{4}/);
      const schoolLine = lines[i + 1] && !degreePattern.test(lines[i + 1]) ? lines[i + 1] : '';
      const school = schoolLine.includes('|')
        ? schoolLine.split('|')[0].trim()
        : schoolLine || line.split('|')[1]?.trim() || '';

      entries.push({
        degree: line.split('|')[0].trim(),
        school: school || line.split('|')[1]?.trim() || '',
        field: '',
        year: yearMatch?.[0] || '',
      });
      if (schoolLine) i++;
    }
  }

  return entries.filter((e) => e.degree || e.school);
}

function parseSkillsBlock(block: string, fullText: string): CategorizedSkills {
  const skills: CategorizedSkills = {
    languages: [],
    frameworks: [],
    libraries: [],
    databases: [],
    tools: [],
    cloud: [],
    softSkills: [],
  };

  const skillText = block || fullText;

  for (const [category, list] of Object.entries(KNOWN_SKILLS)) {
    for (const skill of list) {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`\\b${escaped}\\b`, 'i').test(skillText)) {
        skills[category as keyof typeof KNOWN_SKILLS].push(skill);
      }
    }
  }

  const categoryLinePattern =
    /^(Languages?|Frameworks?|Libraries?|Databases?|Tools?|Cloud|ML\/DL|Data|Visualization|Design|Research|Prototyping|Frontend|Soft\s*Skills?)\s*:\s*(.+)$/gim;

  let match;
  while ((match = categoryLinePattern.exec(skillText)) !== null) {
    const label = match[1].toLowerCase();
    const items = match[2].split(/[,;|•]/).map((s) => s.trim()).filter(Boolean);

    for (const item of items) {
      if (/language/i.test(label) && !skills.languages.includes(item)) skills.languages.push(item);
      else if (/framework/i.test(label) && !skills.frameworks.includes(item)) skills.frameworks.push(item);
      else if (/library|ml\/dl/i.test(label) && !skills.libraries.includes(item)) skills.libraries.push(item);
      else if (/database|data/i.test(label) && !skills.databases.includes(item)) skills.databases.push(item);
      else if (/tool|visualization|design|research|prototyping|frontend/i.test(label) && !skills.tools.includes(item)) skills.tools.push(item);
      else if (/cloud/i.test(label) && !skills.cloud.includes(item)) skills.cloud.push(item);
      else if (/soft/i.test(label) && !skills.softSkills.includes(item)) skills.softSkills.push(item);
    }
  }

  for (const skill of SOFT_SKILLS) {
    if (new RegExp(`\\b${skill}\\b`, 'i').test(skillText) && !skills.softSkills.includes(skill)) {
      skills.softSkills.push(skill);
    }
  }

  return skills;
}

function parseProjectsBlock(block: string): ProjectEntry[] {
  if (!block) return [];

  const projects: ProjectEntry[] = [];
  const blocks = block.split(/\n(?=[A-Z][^\n]{3,})/);

  for (const chunk of blocks) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const name = lines[0].replace(/^[-•*–—]\s*/, '').replace(/\s*[-–—]\s*.+$/, '').trim();
    const techMatch = chunk.match(/Technologies?\s*:\s*(.+)/i);
    const technologies = techMatch
      ? techMatch[1].split(/[,;|]/).map((t) => t.trim()).filter(Boolean)
      : [];

    const description = lines
      .slice(1)
      .filter((l) => !/^Technologies?\s*:/i.test(l))
      .map((l) => l.replace(/^[-•*–—]\s*/, ''))
      .join('\n');

    if (name) {
      projects.push({ name, description, technologies });
    }
  }

  return projects;
}

function parseListSection(block: string): string[] {
  if (!block) return [];
  return block
    .split('\n')
    .map((l) => l.replace(/^[-•*–—]\s*/, '').trim())
    .filter((l) => l.length > 2);
}

function parseAchievements(block: string): AchievementEntry[] {
  return parseListSection(block).map((line) => ({
    title: line.split('–')[0]?.split('-')[0]?.trim() || line,
    description: line.includes('–') ? line.split('–').slice(1).join('–').trim() : '',
  }));
}

function parsePublications(block: string): PublicationEntry[] {
  return parseListSection(block).map((line) => {
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);
    return {
      title: line.replace(/\s*[-–—]\s*.+$/, '').trim(),
      publisher: line.includes('–') ? line.split('–').slice(1).join('–').trim() : '',
      year: yearMatch?.[0] || '',
      link: '',
    };
  });
}

function parseLanguages(block: string): LanguageEntry[] {
  if (!block) return [];

  return block
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(.+?)\s*[\(–-]\s*(.+?)[\)]?$/);
      if (match) {
        return { language: match[1].trim(), proficiency: match[2].trim() };
      }
      return { language: part, proficiency: '' };
    });
}

export function parseResumeFromText(resumeText: string): ExtractedResumeData {
  const text = resumeText.replace(/\r\n/g, '\n').trim();
  const sections = splitIntoSections(text);
  const personalInfo = extractPersonalInfo(text, sections.header || '');

  const experience = [
    ...parseExperienceBlock(sections.experience || ''),
    ...parseExperienceBlock(sections.internships || ''),
  ];

  const internships = parseExperienceBlock(sections.internships || '');

  return {
    personalInfo,
    summary: sections.summary || '',
    education: parseEducationBlock(sections.education || ''),
    experience: experience.filter(
      (e) => !internships.some((i) => i.company === e.company && i.role === e.role)
    ),
    projects: parseProjectsBlock(sections.projects || ''),
    skills: parseSkillsBlock(sections.skills || '', text),
    certifications: parseListSection(sections.certifications || ''),
    internships,
    achievements: parseAchievements(sections.achievements || ''),
    publications: parsePublications(sections.publications || ''),
    languagesKnown: parseLanguages(sections.languages || ''),
  };
}
