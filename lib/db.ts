import { supabase } from './supabase';
import { ResumeRecord, MatchAnalysis } from '@/types';

// Heuristic to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      url !== 'https://example.supabase.co' &&
      key.startsWith('eyJ')
  );
}

// LocalStorage Database Keys
const LOCAL_RESUMES_KEY = 'resumeai-local-resumes';
const LOCAL_ANALYSES_KEY = 'resumeai-local-analyses';

// ----------------------------------------------------
// RESUMES OPERATIONS
// ----------------------------------------------------

export async function dbGetResumes(userId: string): Promise<ResumeRecord[]> {
  // Always get local storage data first (for local-fallback auth users)
  let localResumes: ResumeRecord[] = [];
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(`${LOCAL_RESUMES_KEY}-${userId}`);
    if (stored) {
      localResumes = JSON.parse(stored);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // If Supabase returned data, use it; otherwise fall back to localStorage
      if (data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Supabase getResumes error, falling back to local storage:', e);
    }
  }

  return localResumes;
}

export async function dbSaveResume(
  userId: string,
  fileName: string,
  parsedText: string,
  extractedData: any
): Promise<ResumeRecord> {
  const newRecord: Omit<ResumeRecord, 'id' | 'created_at'> = {
    user_id: userId,
    file_name: fileName,
    storage_path: `resumes/${userId}/${Date.now()}-${fileName}`,
    parsed_text: parsedText,
    extracted_data: extractedData
  };

  if (isSupabaseConfigured()) {
    try {
      // In a real environment, we'd also upload to Supabase storage.
      // We will perform the DB insertion.
      const { data, error } = await supabase
        .from('resumes')
        .insert([{
          user_id: newRecord.user_id,
          file_name: newRecord.file_name,
          storage_path: newRecord.storage_path,
          parsed_text: newRecord.parsed_text,
          extracted_data: newRecord.extracted_data
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('Supabase saveResume error, falling back to local storage:', e);
    }
  }

  // Fallback to LocalStorage
  if (typeof window === 'undefined') {
    throw new Error('Local storage is unavailable.');
  }

  const storedResumes = await dbGetResumes(userId);
  const fullRecord: ResumeRecord = {
    ...newRecord,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString()
  };

  storedResumes.unshift(fullRecord);
  window.localStorage.setItem(`${LOCAL_RESUMES_KEY}-${userId}`, JSON.stringify(storedResumes));
  return fullRecord;
}

// ----------------------------------------------------
// ANALYSES OPERATIONS
// ----------------------------------------------------

export async function dbGetAnalyses(userId: string): Promise<MatchAnalysis[]> {
  let localAnalyses: MatchAnalysis[] = [];
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(`${LOCAL_ANALYSES_KEY}-${userId}`);
    if (stored) {
      localAnalyses = JSON.parse(stored);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('resume_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          user_id: row.user_id,
          resume_id: row.resume_id,
          job_description_id: row.job_description_id,
          job_title: row.job_title,
          match_score: row.match_score,
          ats_score: row.ats_score,
          missing_skills: row.missing_skills || [],
          strengths: row.strengths || [],
          weaknesses: row.weaknesses || [],
          suggestions: row.suggestions || [],
          keywords: row.keywords || [],
          certifications: row.certifications || [],
          projects: row.projects || [],
          hiring_chance: row.hiring_chance || 'Medium',
          learning_roadmap: row.learning_roadmap || [],
          interview_questions: row.interview_questions || null,
          created_at: row.created_at
        }));
      }
    } catch (e) {
      console.warn('Supabase getAnalyses error, falling back to local storage:', e);
    }
  }

  return localAnalyses;
}

export async function dbSaveAnalysis(
  userId: string,
  analysis: Omit<MatchAnalysis, 'id' | 'user_id' | 'created_at'>
): Promise<MatchAnalysis> {
  const fullAnalysis: MatchAnalysis = {
    ...analysis,
    id: crypto.randomUUID(),
    user_id: userId,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('resume_analysis')
        .insert([{
          user_id: userId,
          resume_id: analysis.resume_id,
          job_description_id: analysis.job_description_id,
          job_title: analysis.job_title,
          match_score: analysis.match_score,
          ats_score: analysis.ats_score,
          missing_skills: analysis.missing_skills,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          suggestions: analysis.suggestions,
          keywords: analysis.keywords,
          certifications: analysis.certifications,
          projects: analysis.projects,
          hiring_chance: analysis.hiring_chance,
          learning_roadmap: analysis.learning_roadmap,
          interview_questions: analysis.interview_questions
        }])
        .select()
        .single();

      if (!error && data) {
        fullAnalysis.id = data.id;
        fullAnalysis.created_at = data.created_at;
      }
    } catch (e) {
      console.warn('Supabase saveAnalysis error, falling back to local storage:', e);
    }
  }

  // Always save to LocalStorage as secondary local cache
  if (typeof window !== 'undefined') {
    const storedAnalyses = await dbGetAnalyses(userId);
    // Prevent duplicate entry if already present
    const filtered = storedAnalyses.filter(a => a.id !== fullAnalysis.id);
    filtered.unshift(fullAnalysis);
    window.localStorage.setItem(`${LOCAL_ANALYSES_KEY}-${userId}`, JSON.stringify(filtered));
  }

  return fullAnalysis;
}
