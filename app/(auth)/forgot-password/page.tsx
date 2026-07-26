'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { AuthShell } from '@/components/auth-shell';
import { Input, Label, Button } from '@/components/ui';

export default function ForgotPasswordPage() {
  const { resetPassword, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await resetPassword(email);
      if (res && res.success) {
        setSuccess(true);
      }
    } catch (e) {
      setError('Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell 
      title="Reset your password" 
      description="We’ll send a secure link to your email to get you back in." 
      footer={
        <div className="text-center text-xs text-slate-600 dark:text-slate-400">
          Back to <Link href="/login" className="text-brand-600 dark:text-brand-300 font-semibold hover:underline transition">sign in</Link>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-600 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3.5 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>A reset link has been sent to your email address! Please check your spam folder if it doesn&apos;t arrive.</span>
          </div>
        ) : null}
        
        <div className="space-y-1.5">
          <Label>Email Address</Label>
          <Input 
            type="email"
            value={email} 
            onChange={(e) => { setEmail(e.target.value); setError(null); setSuccess(false); }} 
            placeholder="you@company.com" 
            required
            disabled={loading}
          />
        </div>
        
        <Button 
          type="submit"
          variant="primary"
          className="w-full py-3"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
