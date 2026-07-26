'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const exchange = async () => {
      const next = searchParams.get('next') || '/dashboard';

      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error('OAuth callback exchange failed:', error);
        router.replace('/login?error=' + encodeURIComponent(error.message));
        return;
      }

      router.replace(next);
    };

    exchange();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    }>
      <AuthCallbackHandler />
    </Suspense>
  );
}
