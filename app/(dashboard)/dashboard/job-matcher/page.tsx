'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, FileText, AlertCircle, ArrowRight, Gauge as GaugeIcon,
  CheckCircle2, HelpCircle, GraduationCap, ChevronRight, Loader2,
  ChevronDown, BookOpen, UserCheck, Terminal, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Gauge, Progress, Badge, Skeleton } from '@/components/ui';
import { dbGetResumes, dbSaveAnalysis } from '@/lib/db';
import { ResumeRecord, MatchAnalysis, InterviewPrep } from '@/types';

export default function JobMatcherPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [selectedResume, setSelectedResume] = useState<ResumeRecord | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MatchAnalysis | null>(null);
  
  // Results UI Tabs
  const [activeResultTab, setActiveResultTab] = useState<'fit' | 'gaps' | 'roadmap' | 'interview'>('fit');
  // Interview Prep Sub-tabs
  const [activeInterviewTab, setActiveInterviewTab] = useState<'technical' | 'hr' | 'behavioral' | 'coding'>('technical');
  // Revealed Answers state (question index tracker)
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

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

  async function handleAnalyze() {
    if (!user || !selectedResume) return;
    if (!description.trim()) {
      setError('Please paste a job description first.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    setRevealedAnswers({});

    try {
      // 1. Run Job Match comparison
      const matchPromise = fetch('/api/job-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText: selectedResume.parsed_text || JSON.stringify(selectedResume.extracted_data), 
          jobDescription: description 
        }),
      });

      // 2. Run Interview prep generator
      const prepPromise = fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText: selectedResume.parsed_text || JSON.stringify(selectedResume.extracted_data), 
          jobDescription: description 
        }),
      });

      const [matchRes, prepRes] = await Promise.all([matchPromise, prepPromise]);
      
      const matchJson = await matchRes.json();
      const prepJson = await prepRes.json();

      if (!matchRes.ok) throw new Error(matchJson.error || 'Failed to match job.');
      if (!prepRes.ok) throw new Error(prepJson.error || 'Failed to generate interview questions.');

      // Extract Job Title from job description or give it a fallback
      const jobTitleMatch = description.match(/(?:title|role|position|engineer|developer|designer|manager|specialist)\b:?\s*([A-Za-z0-9\s\-]+)/i);
      const jobTitle = jobTitleMatch ? jobTitleMatch[1].trim().split('\n')[0].slice(0, 40) : 'Target Role';

      // 3. Save full analysis
      const fullAnalysis = await dbSaveAnalysis(user.id, {
        resume_id: selectedResume.id,
        job_title: jobTitle,
        match_score: matchJson.match_score ?? matchJson.matchScore ?? 0,
        ats_score: matchJson.ats_score ?? matchJson.atsScore ?? 0,
        missing_skills: matchJson.missing_skills ?? matchJson.missingSkills ?? [],
        strengths: matchJson.strengths ?? [],
        weaknesses: matchJson.weaknesses ?? [],
        suggestions: matchJson.suggestions ?? [],
        keywords: matchJson.keywords ?? [],
        certifications: matchJson.certifications ?? [],
        projects: matchJson.projects ?? [],
        hiring_chance: matchJson.hiring_chance ?? matchJson.hiringChance ?? 'Medium',
        learning_roadmap: matchJson.learning_roadmap ?? matchJson.learningRoadmap ?? [],
        interview_questions: prepJson
      });

      setAnalysisResult(fullAnalysis);
      setActiveResultTab('fit');

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Job match computation failed.');
    } finally {
      setLoading(false);
    }
  }

  function toggleAnswer(key: string) {
    setRevealedAnswers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  const hasResume = resumes.length > 0;

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Job Matcher</h1>
          <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">Paste a job description to discover gaps, keywords, learning roadmaps, and custom interview questions.</p>
        </div>

        {/* Setup panel */}
        {!analysisResult && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            
            {/* Left Column: Job Description Area */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Paste Job Description</CardTitle>
                  <CardDescription>Provide the full text of the role you are targeting.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea 
                    value={description} 
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setError(null);
                    }}
                    className="min-h-[250px] w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-100/80 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-brand-500 transition resize-none leading-relaxed"
                    placeholder="We are looking for a Senior Full Stack Engineer with 5+ years of experience in React, TypeScript, Node.js, and Docker. Experience with AWS and SQL is highly preferred..."
                    disabled={loading}
                  />

                  {error && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 flex items-start gap-2.5 text-rose-600 dark:text-rose-300 text-sm">
                      <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {!hasResume ? (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3.5 flex items-start gap-3 text-amber-700 dark:text-amber-300 text-sm">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-semibold">No Resume Uploaded</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">You must upload your resume in the Analyzer tab before comparing roles.</p>
                        <Link href="/dashboard/resume" className="inline-block mt-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                          Go to Resume Analyzer &rarr;
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleAnalyze} 
                      variant="gradient" 
                      className="w-full gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Running AI Job Matcher...
                        </>
                      ) : (
                        <>
                          Analyze Compatibility <Sparkles className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Settings and Resume Selection */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Comparison Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasResume ? (
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide">Select source resume</label>
                      <select
                        value={selectedResume?.id}
                        onChange={(e) => {
                          const found = resumes.find(r => r.id === e.target.value);
                          if (found) setSelectedResume(found);
                        }}
                        className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-100/80 dark:bg-slate-950 px-4 py-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500"
                        disabled={loading}
                      >
                        {resumes.map(r => (
                          <option key={r.id} value={r.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{r.file_name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <Skeleton className="h-14 w-full" />
                  )}

                  <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-100/60 dark:bg-slate-950/60 p-4 space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
                    <p className="font-semibold text-slate-900 dark:text-white">What happens during analysis?</p>
                    <div className="flex gap-2.5">
                      <CheckCircle2 className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>Gemini checks word frequencies to match ATS keyword densities.</span>
                    </div>
                    <div className="flex gap-2.5">
                      <CheckCircle2 className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>Skill alignment is benchmarked against required credentials.</span>
                    </div>
                    <div className="flex gap-2.5">
                      <CheckCircle2 className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>Custom interview preparation questions (30) are pre-generated.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {loading && (
                <Card className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Running deep neural analysis...</span>
                  </div>
                  <div className="space-y-2.5">
                    <Skeleton className="h-4 w-full animate-pulse" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </Card>
              )}
            </div>

          </div>
        )}

        {/* Results Panel */}
        {analysisResult && (
          <div className="space-y-6">

            {/* Return & Info banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/5 p-5 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">Analysis completed for:</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{analysisResult.job_title}</h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => setAnalysisResult(null)}>
                Compare New Role
              </Button>
            </div>

            {/* Result Tabs Bar */}
            <div className="flex border-b border-slate-200 dark:border-white/5 text-sm gap-2">
              {[
                { id: 'fit', label: 'Overview & Fit', icon: GaugeIcon },
                { id: 'gaps', label: 'Keyword & Gaps', icon: AlertCircle },
                { id: 'roadmap', label: 'Learning Roadmap', icon: BookOpen },
                { id: 'interview', label: 'Interview Preparation', icon: Award },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveResultTab(tab.id as any)}
                    className={`pb-3.5 px-3 border-b-2 font-medium transition flex items-center gap-2 ${
                      activeResultTab === tab.id 
                        ? 'border-indigo-500 text-indigo-600 dark:text-white' 
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="space-y-6">

              {/* Tab 1: Fit Report */}
              {activeResultTab === 'fit' && (
                <div className="grid gap-6 md:grid-cols-2">

                  {/* Gauge Card */}
                  <Card className="flex flex-col items-center justify-center text-center p-8 h-[320px]">
                    <CardHeader className="mb-6">
                      <CardTitle>Compatibility Scores</CardTitle>
                      <CardDescription>Match fit and ATS optimization rating compared to requirements.</CardDescription>
                    </CardHeader>
                    <div className="flex items-center gap-10">
                      <div className="space-y-2">
                        <Gauge value={analysisResult.match_score} size={110} strokeWidth={8} colorClass="text-indigo-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Match Score</span>
                      </div>
                      <div className="space-y-2">
                        <Gauge value={analysisResult.ats_score} size={110} strokeWidth={8} colorClass="text-emerald-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">ATS Score</span>
                      </div>
                    </div>
                  </Card>

                  {/* Info Card */}
                  <Card className="flex flex-col justify-between p-8 h-[320px]">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Hiring Assessment</span>
                        <Badge variant={analysisResult.hiring_chance === 'High' ? 'success' : analysisResult.hiring_chance === 'Medium' ? 'brand' : 'warning'}>
                          {analysisResult.hiring_chance} Hiring Chance
                        </Badge>
                      </div>
                      <div className="space-y-2.5">
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                          Your resume matches the target posting with <span className="font-semibold text-slate-900 dark:text-white">{analysisResult.match_score}% relevance</span>. 
                          Key strengths align with requirements, though missing tags could affect recruiter scans.
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                          To push your score higher, review the <strong>Keyword & Gaps</strong> tab to add specific missing technologies.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-950 p-4 text-xs font-semibold text-slate-900 dark:text-white">
                      <span>Sync status:</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Saved to History
                      </span>
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab 2: Keyword & Gaps */}
              {activeResultTab === 'gaps' && (
                <div className="space-y-6">

                  {/* Missing Skills and Keywords */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Missing Required Skills</CardTitle>
                        <CardDescription>Technologies mentioned in the listing but missing from your profile.</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        {(analysisResult.missing_skills?.length ?? 0) > 0 ? (
                          analysisResult.missing_skills?.map((skill) => (
                            <Badge key={skill} variant="error">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 text-sm">No missing core skills detected! Excellent alignment.</span>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Target Keywords to Add</CardTitle>
                        <CardDescription>Keywords to insert into your bullet descriptions to trigger ATS matches.</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        {(analysisResult.keywords?.length ?? 0) > 0 ? (
                          analysisResult.keywords?.map((word) => (
                            <Badge key={word} variant="brand">
                              {word}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 text-sm">No critical keywords missing.</span>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Strengths / Weaknesses */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Key Profile Strengths</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                          {(analysisResult.strengths || []).map((str, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Identified Deficits</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                          {(analysisResult.weaknesses || []).map((weak, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                              <span>{weak}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Suggestions / Certs / Projects */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Actionable Resume Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2.5">
                        {(analysisResult.suggestions || []).map((sug, idx) => (
                          <div key={idx} className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {sug}
                          </div>
                        ))}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 pt-2">
                        {(analysisResult.certifications?.length ?? 0) > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Recommended Certs</span>
                            <div className="rounded-xl bg-slate-100 dark:bg-slate-950 p-3.5 text-xs text-indigo-700 dark:text-indigo-300">
                              {analysisResult.certifications?.join(', ')}
                            </div>
                          </div>
                        )}
                        {(analysisResult.projects?.length ?? 0) > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Suggested Projects</span>
                            <div className="rounded-xl bg-slate-100 dark:bg-slate-950 p-3.5 text-xs text-indigo-700 dark:text-indigo-300">
                              {analysisResult.projects?.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tab 3: Learning Roadmap */}
              {activeResultTab === 'roadmap' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Milestone Learning Roadmap</CardTitle>
                    <CardDescription>Follow this timeline pathway to acquire missing skills and bridge qualifications.</CardDescription>
                  </CardHeader>
                  <CardContent className="relative pl-6 sm:pl-8 border-l border-slate-200 dark:border-white/10 space-y-8 ml-3 py-2">
                    {(analysisResult.learning_roadmap || []).map((milestone, idx) => (
                      <div key={idx} className="relative">
                        {/* Timeline Ring */}
                        <div className="absolute -left-[35px] sm:-left-[43px] top-1 h-5 w-5 rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-950 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <h4 className="font-bold text-slate-900 dark:text-white text-base">{milestone.title}</h4>
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-0.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold shrink-0 w-fit">
                              {milestone.duration}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{milestone.description}</p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(milestone.skillsAcquired || []).map((skill) => (
                              <Badge key={skill} variant="gray" className="text-[10px]">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Tab 4: Interview Prep */}
              {activeResultTab === 'interview' && analysisResult.interview_questions && (
                <div className="space-y-6">

                  {/* Category tabs */}
                  <div className="flex flex-wrap border-b border-slate-200 dark:border-white/5 gap-2 text-xs">
                    {[
                      { id: 'technical', label: 'Technical (15)' },
                      { id: 'hr', label: 'HR (10)' },
                      { id: 'behavioral', label: 'Behavioral (5)' },
                      { id: 'coding', label: 'Coding Tasks' },
                    ].map((subTab) => (
                      <button
                        key={subTab.id}
                        onClick={() => {
                          setActiveInterviewTab(subTab.id as any);
                          setRevealedAnswers({});
                        }}
                        className={`pb-2.5 px-3 font-semibold transition ${
                          activeInterviewTab === subTab.id 
                            ? 'text-indigo-600 dark:text-white border-b-2 border-indigo-500' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                        }`}
                      >
                        {subTab.label}
                      </button>
                    ))}
                  </div>

                  {/* Question listing container */}
                  <div className="space-y-3">

                    {/* Render Technical */}
                    {activeInterviewTab === 'technical' && analysisResult.interview_questions.technical.map((q, idx) => {
                      const key = `tech-${idx}`;
                      const isOpened = revealedAnswers[key];
                      return (
                        <div key={idx} className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/60 overflow-hidden text-sm">
                          <button 
                            onClick={() => toggleAnswer(key)}
                            className="flex w-full items-start justify-between p-5 text-left font-semibold text-slate-900 dark:text-white gap-4 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                          >
                            <span className="flex gap-2">
                              <span className="text-indigo-600 dark:text-indigo-400">Q{idx+1}:</span>
                              <span>{q.question}</span>
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                              <Badge variant={q.difficulty === 'Advanced' ? 'error' : q.difficulty === 'Intermediate' ? 'brand' : 'gray'} className="text-[10px]">
                                {q.difficulty}
                              </Badge>
                              <ChevronDown className={`h-4.5 w-4.5 text-slate-500 dark:text-slate-400 transition ${isOpened ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          <AnimatePresence>
                            {isOpened && (
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950/60 px-5 py-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                  <p className="font-bold text-slate-400 dark:text-white/50 mb-1.5 uppercase tracking-wide text-[10px]">Expected Answer:</p>
                                  {q.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}

                    {/* Render HR */}
                    {activeInterviewTab === 'hr' && analysisResult.interview_questions.hr.map((q, idx) => {
                      const key = `hr-${idx}`;
                      const isOpened = revealedAnswers[key];
                      return (
                        <div key={idx} className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/60 overflow-hidden text-sm">
                          <button 
                            onClick={() => toggleAnswer(key)}
                            className="flex w-full items-start justify-between p-5 text-left font-semibold text-slate-900 dark:text-white gap-4 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                          >
                            <span className="flex gap-2">
                              <span className="text-indigo-600 dark:text-indigo-400">Q{idx+1}:</span>
                              <span>{q.question}</span>
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                              <Badge variant="gray" className="text-[10px]">{q.difficulty}</Badge>
                              <ChevronDown className={`h-4.5 w-4.5 text-slate-500 dark:text-slate-400 transition ${isOpened ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          <AnimatePresence>
                            {isOpened && (
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950/60 px-5 py-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                  <p className="font-bold text-slate-400 dark:text-white/50 mb-1.5 uppercase tracking-wide text-[10px]">Strategy Answer Advice:</p>
                                  {q.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}

                    {/* Render Behavioral */}
                    {activeInterviewTab === 'behavioral' && analysisResult.interview_questions.behavioral.map((q, idx) => {
                      const key = `be-${idx}`;
                      const isOpened = revealedAnswers[key];
                      return (
                        <div key={idx} className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/60 overflow-hidden text-sm">
                          <button 
                            onClick={() => toggleAnswer(key)}
                            className="flex w-full items-start justify-between p-5 text-left font-semibold text-slate-900 dark:text-white gap-4 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                          >
                            <span className="flex gap-2">
                              <span className="text-indigo-600 dark:text-indigo-400">Q{idx+1}:</span>
                              <span>{q.question}</span>
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                              <Badge variant="brand" className="text-[10px]">{q.difficulty}</Badge>
                              <ChevronDown className={`h-4.5 w-4.5 text-slate-500 dark:text-slate-400 transition ${isOpened ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          <AnimatePresence>
                            {isOpened && (
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950/60 px-5 py-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                  <p className="font-bold text-slate-400 dark:text-white/50 mb-1.5 uppercase tracking-wide text-[10px]">Response Strategy (STAR Method):</p>
                                  {q.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}

                    {/* Render Coding */}
                    {activeInterviewTab === 'coding' && analysisResult.interview_questions.coding.map((q, idx) => {
                      const key = `code-${idx}`;
                      const isOpened = revealedAnswers[key];
                      return (
                        <div key={idx} className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/60 overflow-hidden text-sm">
                          <button 
                            onClick={() => toggleAnswer(key)}
                            className="flex w-full items-start justify-between p-5 text-left font-semibold text-slate-900 dark:text-white gap-4 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                          >
                            <span className="flex gap-2">
                              <span className="text-purple-600 dark:text-purple-400 font-mono">Task {idx+1}:</span>
                              <span>{q.question}</span>
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                              <Badge variant={q.difficulty === 'Advanced' ? 'error' : 'brand'} className="text-[10px]">
                                {q.difficulty}
                              </Badge>
                              <ChevronDown className={`h-4.5 w-4.5 text-slate-500 dark:text-slate-400 transition ${isOpened ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          <AnimatePresence>
                            {isOpened && (
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950 px-5 py-5 space-y-4">
                                  <div className="space-y-1.5">
                                    <p className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">Description & Constraints:</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-100/80 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 whitespace-pre-wrap">{q.problemDescription}</p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <p className="font-bold text-slate-500 uppercase tracking-wide text-[10px] flex items-center gap-1">
                                      <Terminal className="h-3.5 w-3.5" /> Sample Solution Code:
                                    </p>
                                    <pre className="text-xs text-indigo-700 dark:text-indigo-300 bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-white/5 overflow-x-auto font-mono">
                                      {q.expectedAnswer}
                                    </pre>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}

                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </DashboardShell>
  );
}