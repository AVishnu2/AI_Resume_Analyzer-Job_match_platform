'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, UploadCloud, FileText, CheckCircle, 
  AlertCircle, Briefcase, GraduationCap, Code2, ShieldAlert,
  Loader2, BadgeIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Skeleton } from '@/components/ui';
import { dbSaveResume, dbGetResumes } from '@/lib/db';
import { ExtractedResumeData, ResumeRecord } from '@/types';

export default function ResumeAnalyzerPage() {
  const { user, updateProfile } = useAuth();
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'profile' | 'experience' | 'projects' | 'skills'>('profile');
  const [selectedResume, setSelectedResume] = useState<ResumeRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load user resumes
  useEffect(() => {
    async function loadResumes() {
      if (!user) return;
      try {
        const list = await dbGetResumes(user.id);
        setResumes(list);
        if (list.length > 0) {
          setSelectedResume(list[0]);
        }
      } catch (err) {
        console.error('Error loading resumes:', err);
      }
    }
    loadResumes();
  }, [user]);

  // Drag handlers
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      await processFile(file);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  }

  // File Upload and Gemini Analysis
  async function processFile(file: File) {
    if (!user) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload PDF and parse text
      setUploadProgress(30);
      const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadJson = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadJson.error || 'Failed to parse PDF.');

      setUploadProgress(60);
      
      // 2. Call analyze API route to extract structured data
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: uploadJson.text }),
      });
      const analysisJson = (await analysisResponse.json()) as ExtractedResumeData;
      if (!analysisResponse.ok) throw new Error('Failed to run resume AI parser.');

      setUploadProgress(90);

      // 3. Save to LocalStorage / Supabase
      const savedRecord = await dbSaveResume(
        user.id,
        file.name,
        uploadJson.text,
        analysisJson
      );

      // 4. Update local state
      setResumes((prev) => [savedRecord, ...prev]);
      setSelectedResume(savedRecord);
      setUploadProgress(100);

      // 5. Update user profile details automatically (preserving signed-in user name)
      await updateProfile({
        preferredRole: analysisJson.experience?.split('as a')?.[1]?.trim() || 'Software Engineer',
        skills: analysisJson.skills || []
      });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      // delay hiding analysis loading state slightly for smooth transition
      setTimeout(() => {
        setIsAnalyzing(false);
        setUploadProgress(0);
      }, 500);
    }
  }

  const profileData = selectedResume?.extracted_data;

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Title Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Resume Analyzer</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Upload your PDF resume to extract credentials and sync your profile info.</p>
          </div>
          
          {resumes.length > 1 && selectedResume && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400">Selected Resume:</span>
              <select 
                value={selectedResume.id} 
                onChange={(e) => {
                  const found = resumes.find(r => r.id === e.target.value);
                  if (found) setSelectedResume(found);
                }}
                className="rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
              >
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.file_name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Upload Container */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          
          {/* Drag & Drop Area */}
          <div className="space-y-4">
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition cursor-pointer select-none min-h-[300px] ${
                isDragging 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-slate-300 dark:border-white/10 bg-slate-100/60 dark:bg-slate-900/40 hover:border-indigo-400 dark:hover:border-white/20'
              }`}
            >
              <input type="file" accept="application/pdf" className="sr-only" onChange={handleFileChange} disabled={isAnalyzing} />
              
              {isAnalyzing ? (
                <div className="space-y-4 w-full max-w-xs">
                  <Loader2 className="mx-auto h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Parsing credentials...</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Extracting experience nodes, academic details, and tech skills.</p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-full bg-indigo-50 dark:bg-slate-800 p-4 inline-flex text-indigo-600 dark:text-indigo-400">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Drag & drop your resume PDF</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">Max size 5MB • Standard formatted PDFs preferred</p>
                  </div>
                  <Button variant="secondary" className="gap-2 pointer-events-none mt-2">
                    Choose PDF file <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </label>

            {error && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3.5 flex items-start gap-3 text-rose-600 dark:text-rose-300 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {selectedResume && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Uploaded Resume
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-950 p-4 text-sm">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{selectedResume.file_name}</p>
                      <p className="text-xs text-slate-500">Uploaded on {new Date(selectedResume.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="h-3 w-3" /> Extracted
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Extracted Data View */}
          <div className="space-y-4">
            {isAnalyzing ? (
              <Card className="h-full space-y-5 p-6">
                <Skeleton className="h-8 w-1/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <div className="space-y-3 pt-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </Card>
            ) : profileData ? (
              <Card className="flex flex-col h-[500px]">
                <div className="border-b border-slate-200 dark:border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-extrabold text-white">
                      {profileData.name?.[0] || 'A'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">{profileData.name}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{profileData.email} • {profileData.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Tabs bar */}
                <div className="flex border-b border-slate-200 dark:border-white/5 text-sm gap-2 mt-4">
                  {[
                    { id: 'profile', label: 'Summary' },
                    { id: 'experience', label: 'Experience' },
                    { id: 'projects', label: 'Projects' },
                    { id: 'skills', label: 'Skills' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-3.5 px-2 border-b-2 font-medium transition ${
                        activeTab === tab.id 
                          ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-white' 
                          : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-sm">
                  {activeTab === 'profile' && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Overview</span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                          {profileData.experience}
                        </p>
                      </div>

                      {profileData.education && profileData.education.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Education</span>
                          <div className="space-y-2">
                            {profileData.education.map((edu, idx) => (
                              <div key={idx} className="flex gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                                <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-slate-900 dark:text-white">{edu.school}</p>
                                  <p className="text-xs text-slate-700 dark:text-slate-300">{edu.degree} in {edu.field}</p>
                                  <p className="text-[10px] text-slate-500 font-semibold mt-1">{edu.year}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'experience' && (
                    <div className="space-y-3">
                      {profileData.workExperience && profileData.workExperience.length > 0 ? (
                        profileData.workExperience.map((exp, idx) => (
                          <div key={idx} className="flex gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                            <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-1.5">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{exp.role}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{exp.company} • {exp.duration}</p>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{exp.description}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-center py-6">No experience logs extracted.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'projects' && (
                    <div className="space-y-3">
                      {profileData.projects && profileData.projects.length > 0 ? (
                        profileData.projects.map((proj, idx) => (
                          <div key={idx} className="flex gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                            <Code2 className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                            <div className="space-y-2">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{proj.name}</p>
                                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{proj.description}</p>
                              </div>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {proj.technologies?.map((tech) => (
                                  <Badge key={tech} variant="gray" className="text-[10px]">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-center py-6">No projects logs extracted.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'skills' && (
                    <div className="space-y-4">
                      {profileData.technicalSkills && profileData.technicalSkills.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Technical skills</span>
                          <div className="flex flex-wrap gap-2">
                            {profileData.technicalSkills.map((s) => (
                              <Badge key={s} variant="brand">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {profileData.softSkills && profileData.softSkills.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Soft skills</span>
                          <div className="flex flex-wrap gap-2">
                            {profileData.softSkills.map((s) => (
                              <Badge key={s} variant="success">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {profileData.certifications && profileData.certifications.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Certifications</span>
                          <div className="grid gap-2">
                            {profileData.certifications.map((cert) => (
                              <div key={cert} className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300">
                                {cert}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col items-center justify-center p-12 text-center h-[500px] border-dashed border-slate-300 dark:border-white/10">
                <FileText className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No data parsed yet</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 max-w-xs leading-relaxed">
                  Upload a PDF resume on the left to extract technical skills, timeline history, and certifications.
                </p>
              </Card>
            )}
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
