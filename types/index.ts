export interface Profile {
  id: string;
  name: string;
  email: string;
  preferred_role?: string;
  experience_years?: number;
  skills?: string[];
  avatar_url?: string;
}

export interface EducationEntry {
  school: string;
  degree: string;
  field: string;
  year: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface CategorizedSkills {
  languages: string[];
  frameworks: string[];
  libraries: string[];
  databases: string[];
  tools: string[];
  cloud: string[];
  softSkills: string[];
}

export interface InternshipEntry {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface AchievementEntry {
  title: string;
  description: string;
}

export interface PublicationEntry {
  title: string;
  publisher: string;
  year: string;
  link: string;
}

export interface LanguageEntry {
  language: string;
  proficiency: string;
}

// Enterprise-grade extracted resume data structure
export interface ExtractedResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: CategorizedSkills;
  certifications: string[];
  internships: InternshipEntry[];
  achievements: AchievementEntry[];
  publications: PublicationEntry[];
  languagesKnown: LanguageEntry[];
}

export interface ResumeRecord {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  parsed_text?: string;
  extracted_data?: ExtractedResumeData;
  created_at: string;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface CodingQuestion {
  question: string;
  problemDescription: string;
  expectedAnswer: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface InterviewPrep {
  technical: InterviewQuestion[];
  hr: InterviewQuestion[];
  behavioral: InterviewQuestion[];
  coding: CodingQuestion[];
}

export interface LearningMilestone {
  title: string;
  description: string;
  duration: string;
  skillsAcquired: string[];
}

export interface MatchAnalysis {
  id: string;
  user_id: string;
  resume_id?: string;
  job_description_id?: string;
  job_title?: string;
  match_score: number;
  ats_score: number;
  missing_skills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywords: string[];
  certifications: string[];
  projects: string[];
  hiring_chance: 'High' | 'Medium' | 'Low';
  learning_roadmap: LearningMilestone[];
  interview_questions?: InterviewPrep;
  created_at: string;
}