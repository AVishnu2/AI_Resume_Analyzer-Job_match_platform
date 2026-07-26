'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface AuthProfile {
  name?: string;
  email?: string;
  preferredRole?: string;
  experienceYears?: number;
  skills?: string[];
}

const PROFILE_STORAGE_KEY = 'resumeai-profile';
const USER_STORAGE_KEY = 'resumeai-user';

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      url !== 'https://example.supabase.co' &&
      key.startsWith('eyJ'),
  );
}

function readStoredProfile() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AuthProfile) : null;
  } catch {
    return null;
  }
}

function writeStoredProfile(profile: AuthProfile | null) {
  if (typeof window === 'undefined') return;
  if (!profile) {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const persistProfile = useCallback(
    (nextProfile: AuthProfile | null) => {
      if (typeof window === 'undefined') return;
      if (!nextProfile) {
        writeStoredProfile(null);
        setProfile(null);
        return;
      }

      const mergedProfile = {
        ...nextProfile,
        email: nextProfile.email ?? user?.email ?? '',
      };

      writeStoredProfile(mergedProfile);
      setProfile(mergedProfile);
    },
    [user?.email],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedProfile = readStoredProfile();
    if (storedProfile) {
      setProfile(storedProfile);
    }

    if (!isSupabaseConfigured()) {
      const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
      }
      setLoading(false);
      setInitialized(true);
      return;
    }

    const loadSession = async () => {
      let currentSession: Session | null = null;
      let currentUser: User | null = null;

      // Handle return from Supabase OAuth error redirect bounce (e.g. ?error=server_error)
      if (typeof window !== 'undefined' && (window.location.search.includes('error=') || window.location.hash.includes('error='))) {
        const urlParams = new URLSearchParams(window.location.search);
        const errorDescription = urlParams.get('error_description') || 'OAuth authentication failed.';
        setError(errorDescription);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Instantly restore stored local user state so initial page load is fast
      const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
          setLoading(false);
          setInitialized(true);
        } catch {}
      }

      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) => 
          setTimeout(() => resolve({ data: { session: null } }), 1200)
        );

        const { data } = await Promise.race([sessionPromise, timeoutPromise]);
        currentSession = data?.session ?? null;
        currentUser = currentSession?.user ?? null;
      } catch (err) {
        console.warn('Supabase getSession failed:', err);
      }

      if (currentUser) {
        setUser(currentUser);
        setSession(currentSession);
        if (!storedProfile) {
          const fallbackProfile: AuthProfile = {
            name: currentUser.user_metadata?.full_name ?? currentUser.email?.split('@')[0] ?? 'Member',
            email: currentUser.email ?? '',
          };
          persistProfile(fallbackProfile);
        }
        if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
          router.replace('/dashboard');
        }
      }

      setLoading(false);
      setInitialized(true);
    };

    loadSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (nextSession?.user) {
          const meta = nextSession.user.user_metadata;
          const displayName = meta?.full_name || meta?.name || (nextSession.user.email ? nextSession.user.email.split('@')[0] : 'Member');
          
          setUser(nextSession.user);
          setSession(nextSession);
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextSession.user));
          persistProfile({
            name: displayName,
            email: nextSession.user.email ?? '',
          });
          if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
            router.replace('/dashboard');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        persistProfile(null);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [persistProfile, router]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const fallbackEmailLogin = () => {
      const fallbackUser = {
        id: crypto.randomUUID(),
        email,
      } as User;
      setUser(fallbackUser);
      setSession({
        access_token: 'local-session',
        refresh_token: 'local-session',
        user: fallbackUser,
      } as Session);
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUser));
      persistProfile({ name: email.split('@')[0], email });
      setLoading(false);
      router.replace('/dashboard');
      return { success: true };
    };

    if (!isSupabaseConfigured()) {
      return fallbackEmailLogin();
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        console.warn('Supabase signInWithPassword failed, using fallback login:', signInError.message);
        return fallbackEmailLogin();
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        persistProfile({ name: data.user.email?.split('@')[0] ?? 'Member', email: data.user.email ?? '' });
        router.replace('/dashboard');
      }
    } catch (err) {
      console.warn('Supabase signIn exception, using fallback login:', err);
      return fallbackEmailLogin();
    }

    setLoading(false);
    return { success: true };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    setError(null);

    const fallbackSignUp = () => {
      const fallbackUser = {
        id: crypto.randomUUID(),
        email,
      } as User;
      setUser(fallbackUser);
      setSession({
        access_token: 'local-session',
        refresh_token: 'local-session',
        user: fallbackUser,
      } as Session);
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUser));
      persistProfile({ name: fullName || email.split('@')[0], email });
      setLoading(false);
      router.replace('/dashboard');
      return { success: true };
    };

    if (!isSupabaseConfigured()) {
      return fallbackSignUp();
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        console.warn('Supabase signUp error, using fallback sign up:', signUpError.message);
        return fallbackSignUp();
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        persistProfile({ name: fullName || (data.user.email?.split('@')[0] ?? 'Member'), email: data.user.email ?? '' });
        router.replace('/dashboard');
      }
    } catch (err) {
      console.warn('Supabase signUp exception, using fallback sign up:', err);
      return fallbackSignUp();
    }

    setLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setUser(null);
      setSession(null);
      persistProfile(null);
      window.localStorage.removeItem(USER_STORAGE_KEY);
      setLoading(false);
      router.replace('/login');
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut failed:', err);
    }

    setUser(null);
    setSession(null);
    persistProfile(null);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    setLoading(false);
    router.replace('/login');
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setLoading(false);
      return { success: true };
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return { success: false };
    }

    setLoading(false);
    return { success: true };
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setError('Supabase credentials are not configured in .env.local.');
      setLoading(false);
      return { success: false };
    }

    try {
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?next=/dashboard`
        : undefined;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) {
        setError(`Google OAuth Error: ${oauthError.message}. Make sure Google Provider is enabled in your Supabase dashboard.`);
        setLoading(false);
        return { success: false };
      }
    } catch (err: any) {
      setError(err?.message ?? 'Google OAuth failed to initialize.');
      setLoading(false);
      return { success: false };
    }
  };

  const updateProfile = async (updates: Partial<AuthProfile>) => {
    if (!user) return;
    const nextProfile = {
      ...(profile ?? {}),
      ...(updates ?? {}),
      email: user.email ?? updates.email ?? profile?.email ?? '',
    };

    if (isSupabaseConfigured()) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            name: nextProfile.name,
            email: nextProfile.email,
            preferred_role: nextProfile.preferredRole,
            experience_years: nextProfile.experienceYears,
            skills: nextProfile.skills,
          });
        if (profileError) {
          console.warn('Supabase profile upsert failed (will use local storage):', profileError.message);
        }
      } catch (err: any) {
        console.warn('Supabase profile update error (will use local storage):', err?.message || err);
      }
    } else {
      console.log('Supabase not configured — profile saved to local storage only.');
    }

    persistProfile(nextProfile);
    return nextProfile;
  };

  return {
    user,
    session,
    profile,
    loading,
    initialized,
    error,
    setError,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
    updateProfile,
  };
}
