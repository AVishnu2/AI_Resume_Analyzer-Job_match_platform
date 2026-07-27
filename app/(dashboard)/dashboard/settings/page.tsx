'use client';

import { useState } from 'react';
import { 
  Settings, Moon, Sun, Bell, Trash2, LogOut, ShieldAlert,
  HelpCircle, CheckCircle2, ChevronRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@/components/ui';

import { useTheme } from '@/components/theme-provider';

export default function SettingsPage() {
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteAccount() {
    setIsDeleting(true);
    // Simulate API request and DB deletion
    setTimeout(() => {
      if (typeof window !== 'undefined' && user) {
        // clear localStorage database
        window.localStorage.removeItem(`resumeai-local-resumes-${user.id}`);
        window.localStorage.removeItem(`resumeai-local-analyses-${user.id}`);
        window.localStorage.removeItem('resumeai-profile');
        window.localStorage.removeItem('resumeai-user');
      }
      setIsDeleting(false);
      setShowDeleteModal(false);
      signOut();
    }, 1500);
  }

  return (
    <DashboardShell>
      <div className="space-y-6 relative">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">Manage appearance preferences, notification alerts, and your authentication records.</p>
        </div>

        <div className="space-y-4">
          
          {/* Theme Option */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="h-4.5 w-4.5 text-indigo-400" /> : <Sun className="h-4.5 w-4.5 text-amber-400" />}
                  Appearance Theme
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">Switch between standard dark mode and light mode interfaces.</p>
              </div>

              <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-white/5 rounded-full shrink-0">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition ${
                    theme === 'dark' 
                      ? 'bg-brand-500 text-white shadow' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" /> Dark Mode
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition ${
                    theme === 'light' 
                      ? 'bg-white text-slate-950 shadow' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" /> Light Mode
                </button>
              </div>
            </div>
          </Card>

          {/* Notifications Option */}
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="h-4.5 w-4.5 text-indigo-400" />
                  Email Notifications
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Receive system notifications and analysis completions to your email.</p>
              </div>

              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </Card>

          {/* Logout & Delete Area */}
          <Card className="border-rose-500/10">
            <CardHeader className="border-b border-slate-200 dark:border-white/5 pb-4 mb-4">
              <CardTitle className="text-base text-rose-600 dark:text-rose-300 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" /> Danger Zone
              </CardTitle>
              <CardDescription>Actions that cannot be undone, including permanent account deletion.</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 gap-4">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Sign out of session</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">End your current session on this device.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => signOut()} className="gap-2 shrink-0">
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-rose-500/5 border border-rose-500/10 p-4 gap-4">
                <div>
                  <p className="font-semibold text-rose-600 dark:text-rose-300 text-sm">Delete Account</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Permanently erase your uploaded files and history from our database.</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)} className="gap-2 shrink-0">
                  <Trash2 className="h-4 w-4" /> Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Delete Confirmation Modal Overlay */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-3xl border border-rose-500/20 bg-white dark:bg-slate-900 p-6 shadow-2xl text-left space-y-6"
              >
                <div className="flex items-center gap-3.5 border-b border-slate-200 dark:border-white/5 pb-4">
                  <div className="rounded-full bg-rose-500/10 p-2.5 text-rose-400">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Are you absolutely sure?</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">This action is irreversible.</p>
                  </div>
                </div>

                <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  Deleting your account will permanently wipe all uploaded resume documents, job comparison logs, and generated interview materials. Your data cannot be recovered.
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="danger"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Wiping Data...
                      </>
                    ) : (
                      'Yes, Delete Everything'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardShell>
  );
}