'use client';

import { useState, useEffect } from 'react';
import { 
  UserCircle2, Sparkles, CheckCircle2, User, Briefcase, 
  Layers, Trophy, Mail, Calendar, Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Label, Input } from '@/components/ui';

export default function ProfilePage() {
  const { profile, updateProfile, loading } = useAuth();
  const [name, setName] = useState('');
  const [preferredRole, setPreferredRole] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [skills, setSkills] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Synchronize inputs with async profile state when loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setPreferredRole(profile.preferredRole ?? '');
      setExperienceYears(profile.experienceYears?.toString() ?? '');
      setSkills((profile.skills ?? []).join(', '));
    }
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    setSuccess(false);
    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateProfile({
        name,
        preferredRole,
        experienceYears: Number(experienceYears || 0),
        skills: skillsArray,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Card className="h-64 animate-pulse bg-slate-200 dark:bg-slate-900/60" />
            <Card className="h-[400px] animate-pulse bg-slate-200 dark:bg-slate-900/60" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Your Profile</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Manage your professional credentials to tailor AI suggestions and match parameters.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          
          {/* Profile Card Mockup */}
          <div className="space-y-4">
            <Card className="text-center p-6 flex flex-col items-center">
              <div className="relative mb-5 group">
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-extrabold text-white text-3xl shadow-lg shadow-indigo-500/10">
                  {name?.[0]?.toUpperCase() || <UserCircle2 className="h-12 w-12" />}
                </div>
                <div className="absolute bottom-0 right-0 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/10 p-1.5 text-indigo-500">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{name || 'Your Name'}</h2>
              <p className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold mt-1 flex items-center gap-1.5 justify-center">
                <Briefcase className="h-3.5 w-3.5" />
                {preferredRole || 'Target Job Title'}
              </p>
              
              {experienceYears && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 flex items-center gap-1.5 justify-center">
                  <Calendar className="h-3.5 w-3.5" />
                  {experienceYears} Years of Experience
                </p>
              )}

              <div className="w-full h-px bg-slate-200 dark:bg-white/5 my-5" />

              <div className="w-full text-left space-y-3.5">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Registered Email</span>
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">{profile?.email || 'N/A'}</span>
                  </div>
                </div>

                {profile?.skills && profile.skills.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Primary Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.slice(0, 8).map((skill) => (
                        <Badge key={skill} variant="gray" className="text-[10px]">
                          {skill}
                        </Badge>
                      ))}
                      {profile.skills.length > 8 && (
                        <Badge variant="brand" className="text-[10px]">
                          +{profile.skills.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Edit Profile Information</CardTitle>
              <CardDescription>Keep your profile updated. Our AI matcher uses these fields as primary anchors.</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="pl-10"
                      placeholder="Ava Nguyen"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Preferred Role</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      value={preferredRole} 
                      onChange={(e) => setPreferredRole(e.target.value)} 
                      className="pl-10"
                      placeholder="Senior Full Stack Engineer"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Experience (Years)</Label>
                  <div className="relative">
                    <Trophy className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="number"
                      value={experienceYears} 
                      onChange={(e) => setExperienceYears(e.target.value)} 
                      className="pl-10"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Primary Skills</Label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      value={skills} 
                      onChange={(e) => setSkills(e.target.value)} 
                      className="pl-10"
                      placeholder="TypeScript, React, Next.js, Node.js"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-normal">Separate skills with commas (e.g. JavaScript, AWS, SQL).</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-white/5">
                <Button 
                  onClick={handleSave} 
                  variant="gradient"
                  disabled={saving}
                  className="gap-2 shrink-0"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </Button>

                {success && (
                  <div className="text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5 font-semibold animate-pulse">
                    <CheckCircle2 className="h-4.5 w-4.5" /> Profile successfully saved!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </DashboardShell>
  );
}
