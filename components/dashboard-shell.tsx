"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart3, BrainCircuit, FileText, History, LayoutGrid, 
  LogOut, Settings, Sparkles, UserCircle2, Sun, Moon 
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from './theme-provider';
import { ChatbotWidget } from './chatbot-widget';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/dashboard/resume', label: 'Resume Analyzer', icon: FileText },
  { href: '/dashboard/job-matcher', label: 'Job Matcher', icon: BrainCircuit },
  { href: '/dashboard/history', label: 'History', icon: History },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle2 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, profile, initialized } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/login');
    }
  }, [initialized, user, router]);

  if (!initialized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
        <aside className="w-full rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 p-4 lg:w-72 shadow-md dark:shadow-none backdrop-blur-xl">
          <div className="mb-8 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand-500/20 p-2 text-brand-600 dark:text-brand-100">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">ResumeAI</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">AI career OS</p>
              </div>
            </div>

            {/* Quick theme toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </button>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 font-semibold">Signed in</p>
            <p className="mt-2 font-medium text-slate-900 dark:text-white">{profile?.name ?? user.email ?? 'Member'}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                    active 
                      ? 'border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-white' 
                      : 'border-transparent text-slate-600 dark:text-slate-300 hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button 
            onClick={() => signOut()} 
            className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-slate-200 dark:border-white/10 px-3 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
      <ChatbotWidget />
    </div>
  );
}
