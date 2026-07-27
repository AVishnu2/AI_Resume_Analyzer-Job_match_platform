'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  History, Calendar, Clock, ChevronRight, ArrowLeft, Trash2,
  Gauge as GaugeIcon, AlertCircle, BookOpen, Award, CheckCircle2,
  ChevronDown, Terminal, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Gauge, Badge, Skeleton } from '@/components/ui';
import { dbGetAnalyses, dbClearAnalyses } from '@/lib/db';
import { MatchAnalysis } from '@/types';

export default function HistoryPage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<MatchAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<MatchAnalysis | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  
  // Tab states for detail view
  const [activeResultTab, setActiveResultTab] = useState<'fit' | 'gaps' | 'roadmap' | 'interview'>('fit');
  const [activeInterviewTab, setActiveInterviewTab] = useState<'technical' | 'hr' | 'behavioral' | 'coding'>('technical');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadHistory() {
      if (!user) return;
      try {
        const list = await dbGetAnalyses(user.id);
        setAnalyses(list);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [user]);

  function toggleAnswer(key: string) {
    setRevealedAnswers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  function handleSelectRecord(record: MatchAnalysis) {
    setSelectedAnalysis(record);
    setActiveResultTab('fit');
    setRevealedAnswers({});
  }

  async function handleClearHistory() {
    if (!user) return;
    setClearing(true);
    try {
      await dbClearAnalyses(user.id);
      setAnalyses([]);
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Failed to clear history:', err);
    } finally {
      setClearing(false);
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Header */}
        {!selectedAnalysis ? (
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analysis History</h1>
            <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">Review your past resume scans, keyword matches, and generated interview preps.</p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedAnalysis(null)}
              className="rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">Back to History</span>
                <span className="text-slate-400 dark:text-slate-600 font-bold">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(selectedAnalysis.created_at).toLocaleDateString()}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{selectedAnalysis.job_title}</h1>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full animate-pulse" />
            <Skeleton className="h-20 w-full animate-pulse" />
            <Skeleton className="h-20 w-full animate-pulse" />
          </div>
        )}

        {/* Content Toggle */}
        {!loading && !selectedAnalysis && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                    Your Job Match History
                  </CardTitle>
                  <CardDescription>Click on any job comparison below to inspect scores and resume suggestions.</CardDescription>
                </div>
                {analyses.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClearConfirm(true)}
                    className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {analyses.length > 0 ? (
                <div className="space-y-3">
                  {analyses.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleSelectRecord(item)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/10 px-5 py-4 transition cursor-pointer gap-4 group"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">{item.job_title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(item.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                          <span className="text-slate-400 dark:text-slate-600">•</span>
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(item.created_at).toLocaleTimeString('en-US', { timeStyle: 'short' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-start">
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold uppercase">Match</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{item.match_score}%</span>
                          </div>
                          <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold uppercase">ATS</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{item.ats_score}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400 space-y-4">
                  <p className="max-w-xs mx-auto text-sm leading-relaxed">You have not generated any comparison reports yet. Head over to the Job Matcher to scan roles.</p>
                  <Link href="/dashboard/job-matcher" className="inline-block">
                    <Button variant="gradient" className="gap-2">
                      Go to Job Matcher <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Clear History Confirmation Dialog */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-6 max-w-md w-full shadow-2xl"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                  <div className="rounded-full bg-rose-100 dark:bg-rose-950/50 p-2">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clear All History?</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  This will permanently delete all your job match analysis history. This action cannot be undone.
                </p>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowClearConfirm(false)}
                    disabled={clearing}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={handleClearHistory}
                    disabled={clearing}
                    className="flex-1 bg-rose-600 hover:bg-rose-700"
                  >
                    {clearing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      'Clear All'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Detailed Report View */}
        {!loading && selectedAnalysis && (
          <div className="space-y-6">
            
            {/* Tabs Bar */}
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
                  <Card className="flex flex-col items-center justify-center text-center p-8 h-[320px]">
                    <CardHeader className="mb-6">
                      <CardTitle>Compatibility Scores</CardTitle>
                      <CardDescription>Match fit and ATS optimization rating compared to requirements.</CardDescription>
                    </CardHeader>
                    <div className="flex items-center gap-10">
                      <div className="space-y-2">
                        <Gauge value={selectedAnalysis.match_score} size={110} strokeWidth={8} colorClass="text-indigo-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Match Score</span>
                      </div>
                      <div className="space-y-2">
                        <Gauge value={selectedAnalysis.ats_score} size={110} strokeWidth={8} colorClass="text-emerald-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">ATS Score</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="flex flex-col justify-between p-8 h-[320px]">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Hiring Assessment</span>
                        <Badge variant={selectedAnalysis.hiring_chance === 'High' ? 'success' : selectedAnalysis.hiring_chance === 'Medium' ? 'brand' : 'warning'}>
                          {selectedAnalysis.hiring_chance} Hiring Chance
                        </Badge>
                      </div>
                      <div className="space-y-2.5">
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                          This profile matched the target listing with <span className="font-semibold text-slate-900 dark:text-white">{selectedAnalysis.match_score}% relevance</span>. 
                          Key strengths align with requirements, though missing tags could affect recruiter scans.
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                          To push your score higher, review the <strong>Keyword & Gaps</strong> tab to add specific missing technologies.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-950 p-4 text-xs font-semibold text-slate-900 dark:text-white">
                      <span>Report ID:</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono select-all">{selectedAnalysis.id.slice(0, 8)}...</span>
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab 2: Keyword & Gaps */}
              {activeResultTab === 'gaps' && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Missing Required Skills</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        {selectedAnalysis.missing_skills.length > 0 ? (
                          selectedAnalysis.missing_skills.map((skill) => (
                            <Badge key={skill} variant="error">{skill}</Badge>
                          ))
                        ) : (
                          <span className="text-slate-400 text-sm">No missing core skills.</span>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Target Keywords to Add</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        {selectedAnalysis.keywords.length > 0 ? (
                          selectedAnalysis.keywords.map((word) => (
                            <Badge key={word} variant="brand">{word}</Badge>
                          ))
                        ) : (
                          <span className="text-slate-400 text-sm">No critical keywords missing.</span>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Key Profile Strengths</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                          {(selectedAnalysis.strengths || []).map((str, idx) => (
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
                          {(selectedAnalysis.weaknesses || []).map((weak, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                              <span>{weak}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Actionable Resume Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2.5">
                        {(selectedAnalysis.suggestions || []).map((sug, idx) => (
                          <div key={idx} className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {sug}
                          </div>
                        ))}
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 pt-2">
                        {(selectedAnalysis.certifications?.length ?? 0) > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Recommended Certs</span>
                            <div className="rounded-xl bg-slate-100 dark:bg-slate-950 p-3.5 text-xs text-indigo-700 dark:text-indigo-300">
                              {selectedAnalysis.certifications?.join(', ')}
                            </div>
                          </div>
                        )}
                        {(selectedAnalysis.projects?.length ?? 0) > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Suggested Projects</span>
                            <div className="rounded-xl bg-slate-100 dark:bg-slate-950 p-3.5 text-xs text-indigo-700 dark:text-indigo-300">
                              {selectedAnalysis.projects?.join(', ')}
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
                  </CardHeader>
                  <CardContent className="relative pl-8 border-l border-slate-200 dark:border-white/10 space-y-8 ml-3 py-2">
                    {(selectedAnalysis.learning_roadmap || []).map((milestone, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[43px] top-1 h-5 w-5 rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-950 flex items-center justify-center">
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
                              <Badge key={skill} variant="gray" className="text-[10px]">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Tab 4: Interview Prep */}
              {activeResultTab === 'interview' && selectedAnalysis.interview_questions && (
                <div className="space-y-6">
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

                  <div className="space-y-3">
                    
                    {/* Render questions based on sub-tab */}
                    {activeInterviewTab === 'technical' && selectedAnalysis.interview_questions.technical.map((q, idx) => {
                      const key = `tech-${idx}`;
                      const isOpened = revealedAnswers[key];
                      return (
                        <div key={idx} className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/60 overflow-hidden text-sm">
                          <button onClick={() => toggleAnswer(key)} className="flex w-full items-start justify-between p-5 text-left font-semibold text-slate-900 dark:text-white gap-4 hover:bg-slate-100 dark:hover:bg-white/5 transition">
                            <span className="flex gap-2">
                              <span className="text-indigo-600 dark:text-indigo-400">Q{idx+1}:</span>
                              <span>{q.question}</span>
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                              <Badge variant={q.difficulty === 'Advanced' ? 'error' : q.difficulty === 'Intermediate' ? 'brand' : 'gray'} className="text-[10px]">
                                {q.difficulty}
                              </Badge>
                              <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition ${isOpened ? 'rotate-180' : ''}`} />
                            </div>
                          </button>
                          <AnimatePresence>
                            {isOpened && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
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
                    {activeInterviewTab === 'hr' && selectedAnalysis.interview_questions.hr.map((q, idx) => {
                      const key = `hr-${idx}`;
                      const isOpened = revealedAnswers[key];
                      return (
                        <div key={idx} className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/60 overflow-hidden text-sm">
                          <button onClick={() => toggleAnswer(key)} className="flex w-full items-start justify-between p-5 text-left font-semibold text-slate-900 dark:text-white gap-4 hover:bg-slate-100 dark:hover:bg-white/5 transition">
                            <span className="flex gap-2">
                              <span className="text-indigo-600 dark:text-indigo-400">Q{idx+1}:</span>
                              <span>{q.question}</span>
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                              <Badge variant="gray" className="text-[10px]">{q.difficulty}</Badge>
                              <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition ${isOpened ? 'rotate-180' : ''}`} />
                            </div>
                          </button>
                          <AnimatePresence>
                            {isOpened && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                <div className="border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950/60 px-5 py-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                  <p className="font-bold text-slate-400 dark:text-white/50 mb-1.5 uppercase tracking-wide text-[10px]">Advice:</p>
                                  {q.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}

                    {/* Render Behavioral */}
                    {activeInterviewTab === 'behavioral' && selectedAnalysis.interview_questions.behavioral.map((q, idx) => {
                      const key = `be-${idx}`;
                      const isOpened = revealedAnswers[key];
                      return (
                        <div key={idx} className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/60 overflow-hidden text-sm">
                          <button onClick={() => toggleAnswer(key)} className="flex w-full items-start justify-between p-5 text-left font-semibold text-slate-900 dark:text-white gap-4 hover:bg-slate-100 dark:hover:bg-white/5 transition">
                            <span className="flex gap-2">
                              <span className="text-indigo-600 dark:text-indigo-400">Q{idx+1}:</span>
                              <span>{q.question}</span>
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                              <Badge variant="brand" className="text-[10px]">{q.difficulty}</Badge>
                              <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition ${isOpened ? 'rotate-180' : ''}`} />
                            </div>
                          </button>
                          <AnimatePresence>
                            {isOpened && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                <div className="border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950/60 px-5 py-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                  <p className="font-bold text-slate-400 dark:text-white/50 mb-1.5 uppercase tracking-wide text-[10px]">Response Strategy:</p>
                                  {q.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}

                    {/* Render Coding */}
                    {activeInterviewTab === 'coding' && selectedAnalysis.interview_questions.coding.map((q, idx) => {
                      const key = `code-${idx}`;
                      const isOpened = revealedAnswers[key];
                      return (
                        <div key={idx} className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/60 overflow-hidden text-sm">
                          <button onClick={() => toggleAnswer(key)} className="flex w-full items-start justify-between p-5 text-left font-semibold text-slate-900 dark:text-white gap-4 hover:bg-slate-100 dark:hover:bg-white/5 transition">
                            <span className="flex gap-2">
                              <span className="text-purple-600 dark:text-purple-400 font-mono">Task {idx+1}:</span>
                              <span>{q.question}</span>
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                              <Badge variant={q.difficulty === 'Advanced' ? 'error' : 'brand'} className="text-[10px]">
                                {q.difficulty}
                              </Badge>
                              <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition ${isOpened ? 'rotate-180' : ''}`} />
                            </div>
                          </button>
                          <AnimatePresence>
                            {isOpened && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                <div className="border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950 px-5 py-5 space-y-4">
                                  <div className="space-y-1.5">
                                    <p className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">Description & Constraints:</p>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 whitespace-pre-wrap">{q.problemDescription}</p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <p className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">Solution Code:</p>
                                    <pre className="text-xs text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-white/5 overflow-x-auto font-mono">
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
