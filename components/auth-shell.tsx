"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from './theme-provider';
import { Sun, Moon } from 'lucide-react';

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { initialized, user } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (initialized && user) {
      router.replace('/dashboard');
    }
  }, [initialized, router, user]);

  if (!initialized) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-10 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      <button
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        className="absolute top-6 right-6 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition shadow-sm"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
      </button>

      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-8 shadow-xl backdrop-blur-xl">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
        <div className="mt-8">{children}</div>
        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </div>
  );
}
