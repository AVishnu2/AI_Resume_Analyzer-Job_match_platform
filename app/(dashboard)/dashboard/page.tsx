'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, FileText, ArrowRight, BrainCircuit, 
  TrendingUp, Award, Clock, UploadCloud, ChevronRight 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell 
} from 'recharts';
import { useAuth } from '@/hooks/use-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Gauge, Progress, Badge, Skeleton } from '@/components/ui';
import { dbGetResumes, dbGetAnalyses } from '@/lib/db';
import { ResumeRecord, MatchAnalysis } from '@/types';

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [analyses, setAnalyses] = useState<MatchAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [userResumes, userAnalyses] = await Promise.all([
          dbGetResumes(user.id),
          dbGetAnalyses(user.id)
        ]);
        setResumes(userResumes);
        setAnalyses(userAnalyses);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadData();
    }
  }, [user]);

  // If loading authentication or initial mount, display page loader
  if (authLoading || !isMounted) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </DashboardShell>
    );
  }

  const latestResume = resumes[0];
  const hasResume = resumes.length > 0;
  const hasAnalyses = analyses.length > 0;

  // Calculate completeness:
  // 20% for name, 20% for email, 25% for skills list, 20% for work history, 15% for projects
  let completeness = 0;
  if (profile?.name) completeness += 20;
  if (profile?.email) completeness += 20;
  if (profile?.skills && profile.skills.length > 0) completeness += 25;
  if (latestResume?.extracted_data?.workExperience && latestResume.extracted_data.workExperience.length > 0) completeness += 20;
  if (latestResume?.extracted_data?.projects && latestResume.extracted_data.projects.length > 0) completeness += 15;
  if (completeness === 0) completeness = 20; // default initial completeness

  // Chart 1 Data: Match Score History over time
  // Reverse to make it chronological
  const historyChartData = [...analyses]
    .reverse()
    .slice(-6) // take last 6
    .map(a => {
      const date = new Date(a.created_at);
      return {
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Match Score': a.match_score,
        'ATS Score': a.ats_score,
      };
    });

  // Default chart data if empty
  const defaultHistoryData = [
    { name: 'Scan 1', 'Match Score': 65, 'ATS Score': 70 },
    { name: 'Scan 2', 'Match Score': 72, 'ATS Score': 78 },
    { name: 'Scan 3', 'Match Score': 84, 'ATS Score': 91 },
  ];

  // Chart 2 Data: Top Technical Skills frequency in resume
  const skillsData = latestResume?.extracted_data?.technicalSkills || latestResume?.extracted_data?.skills || profile?.skills || [];
  const chartSkillsData = skillsData.slice(0, 5).map((skill, idx) => ({
    name: skill,
    frequency: 100 - idx * 12, // mock value to show scale
  }));

  const defaultSkillsData = [
    { name: 'TypeScript', frequency: 95 },
    { name: 'React', frequency: 90 },
    { name: 'Node.js', frequency: 80 },
    { name: 'PostgreSQL', frequency: 75 },
    { name: 'Next.js', frequency: 70 },
  ];

  const COLORS = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Banner Card */}
        <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-100 backdrop-blur-md border border-white/10">
                <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
                ResumeAI Active
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Welcome back, {profile?.name || 'Engineer'}
              </h1>
              <p className="mt-2 text-sm text-slate-200 max-w-xl leading-relaxed">
                Compare your credentials with target job requirements, boost your keyword matches, and generate mock interview answers.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">Completeness</p>
                <p className="text-2xl font-extrabold text-white mt-1">{completeness}%</p>
              </div>
              <Gauge value={completeness} size={60} strokeWidth={6} colorClass="text-amber-400" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { 
              label: 'Average Match Score', 
              value: hasAnalyses ? `${Math.round(analyses.reduce((acc, curr) => acc + curr.match_score, 0) / analyses.length)}%` : '0%', 
              detail: hasAnalyses ? `${analyses.length} match runs computed` : 'No analyses run yet',
              icon: TrendingUp,
              color: 'text-indigo-500 dark:text-indigo-400'
            },
            { 
              label: 'Average ATS Score', 
              value: hasAnalyses ? `${Math.round(analyses.reduce((acc, curr) => acc + curr.ats_score, 0) / analyses.length)}` : '0', 
              detail: hasAnalyses ? 'Targeting high keyword matches' : 'Upload job descriptions to test',
              icon: BrainCircuit,
              color: 'text-emerald-500 dark:text-emerald-400'
            },
            { 
              label: 'Extracted Skills', 
              value: hasResume ? `${skillsData.length}` : '0', 
              detail: hasResume ? 'Extracted from latest PDF' : 'Upload resume to extract',
              icon: FileText,
              color: 'text-purple-500 dark:text-purple-400'
            },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <Card key={idx} className="relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">{card.label}</p>
                  <Icon className={`h-4.5 w-4.5 ${card.color}`} />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{card.value}</p>
                <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{card.detail}</p>
              </Card>
            );
          })}
        </div>

        {/* Empty State Banner (No Resume) */}
        {!hasResume && !loading && (
          <Card className="p-8 text-center border-dashed border-indigo-500/30 bg-indigo-500/5">
            <UploadCloud className="mx-auto h-12 w-12 text-indigo-500 dark:text-indigo-400 animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Upload your resume to begin</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
              We need your resume PDF to extract skills, experience years, and run comparative match scores against job descriptions.
            </p>
            <Link href="/dashboard/resume" className="inline-block mt-6">
              <Button variant="gradient" className="gap-2">
                Upload Resume PDF <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        )}

        {/* Charts & Details Grid */}
        {hasResume && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            
            {/* Chart 1: Performance History */}
            <Card className="flex flex-col justify-between h-[380px]">
              <CardHeader>
                <CardTitle>Historical Analytics</CardTitle>
                <CardDescription>Visual progress of Match and ATS compatibility scores across your history.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 w-full h-[240px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hasAnalyses ? historyChartData : defaultHistoryData}>
                    <defs>
                      <linearGradient id="colorMatch" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="Match Score" stroke="#4f46e5" fillOpacity={1} fill="url(#colorMatch)" strokeWidth={2} />
                    <Area type="monotone" dataKey="ATS Score" stroke="#10b981" fillOpacity={1} fill="url(#colorAts)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Chart 2: Skills Breakdown */}
            <Card className="flex flex-col justify-between h-[380px]">
              <CardHeader>
                <CardTitle>Skills Distribution</CardTitle>
                <CardDescription>Top technical capabilities extracted from your uploaded profile.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 w-full h-[240px] pt-4 flex flex-col justify-between">
                <div className="flex-1 h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartSkillsData.length > 0 ? chartSkillsData : defaultSkillsData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={90} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      />
                      <Bar dataKey="frequency" radius={10} barSize={10}>
                        {(chartSkillsData.length > 0 ? chartSkillsData : defaultSkillsData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 justify-center">
                  {(chartSkillsData.length > 0 ? chartSkillsData : defaultSkillsData).map((skill, idx) => (
                    <Badge key={idx} variant="gray" className="text-[10px]">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History List Table */}
        {hasResume && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Job Match Reports</CardTitle>
                <CardDescription>Browse through your history of compared roles and overall feedback.</CardDescription>
              </div>
              <Link href="/dashboard/history" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline">
                View all history <ChevronRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {hasAnalyses ? (
                <div className="space-y-2.5">
                  {analyses.slice(0, 3).map((item) => (
                    <div 
                      key={item.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 px-5 py-4 transition gap-3"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{item.job_title || 'Untitled Target Role'}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {new Date(item.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs text-slate-600 dark:text-slate-400 block">Match Score</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.match_score}%</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
                        <div className="text-right">
                          <span className="text-xs text-slate-600 dark:text-slate-400 block">ATS Score</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.ats_score}</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
                        <Badge variant={item.hiring_chance === 'High' ? 'success' : item.hiring_chance === 'Medium' ? 'brand' : 'warning'}>
                          {item.hiring_chance} Hiring Chance
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 space-y-3">
                  <p>You haven’t matched your resume with a job description yet.</p>
                  <Link href="/dashboard/job-matcher" className="inline-block">
                    <Button variant="outline" size="sm" className="gap-2">
                      Compare with Role <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardShell>
  );
}
