'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Chrome, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { AuthShell } from '@/components/auth-shell';
import { Input, Label, Button } from '@/components/ui';

export default function RegisterPage() {
  const { signUp, signInWithGoogle, error, setError } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signUp(email, password, fullName);
      if (res && !res.success) {
        // useAuth set the error message already
      }
    } catch (e) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setOauthLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError('Google signup failed.');
    } finally {
      setOauthLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      description="Start your next job search with AI-backed resume strategy."
      footer={
        <div className="text-center text-xs text-slate-600 dark:text-slate-400">
          Already have an account? <Link href="/login" className="text-brand-600 dark:text-brand-300 font-semibold hover:underline transition">Sign in</Link>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-600 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label>Full Name</Label>
          <Input
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setError(null); }}
            placeholder="Ava Nguyen"
            required
            disabled={loading || oauthLoading}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Email Address</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            placeholder="you@company.com"
            required
            disabled={loading || oauthLoading}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            placeholder="••••••••"
            required
            disabled={loading || oauthLoading}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3"
          disabled={loading || oauthLoading}
        >
          {loading ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            'Create Account'
          )}
        </Button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2.5 rounded-full border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 transition active:scale-[0.99] disabled:opacity-50 shadow-sm"
          disabled={loading || oauthLoading}
        >
          {oauthLoading ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <>
              <Chrome className="h-4.5 w-4.5 text-indigo-500" />
              <span>Sign up with Google</span>
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
