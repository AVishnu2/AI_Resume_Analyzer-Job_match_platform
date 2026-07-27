'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Sparkles, CheckCircle2, ChevronDown, 
  ShieldCheck, BrainCircuit, Lightbulb, Users, Check,
  Zap, Award, FileText, CheckCircle, Sun, Moon
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { useTheme } from '@/components/theme-provider';
import { ChatbotWidget } from '@/components/chatbot-widget';

// Features data
const features = [
  {
    title: 'AI Resume Extraction',
    description: 'Instantly pull skills, project metrics, experience years, and education from standard PDF files.',
    icon: BrainCircuit,
    color: 'from-blue-500/20 to-indigo-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Job Match Comparison',
    description: 'Contrast your capabilities against any description to identify missing keywords and technical requirements.',
    icon: Zap,
    color: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    title: 'ATS & Optimization Tips',
    description: 'Grade your compatibility against automated screening algorithms to maximize recruiter callbacks.',
    icon: ShieldCheck,
    color: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Interview Q&A Prep',
    description: 'Generate 30 target interview questions covering HR, technical, behavioral, and practical coding exercises.',
    icon: Lightbulb,
    color: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    title: 'Milestone Roadmap',
    description: 'Obtain step-by-step career path guides with duration estimates to close skill gaps effectively.',
    icon: Award,
    color: 'from-rose-500/20 to-red-500/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    title: 'Multi-Analysis History',
    description: 'Store previous resumes and target job applications to track score improvements over time.',
    icon: Users,
    color: 'from-indigo-500/20 to-cyan-500/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
];

// Workflow Steps
const workflowSteps = [
  {
    number: '01',
    title: 'Upload Resume',
    description: 'Drop your PDF resume. Our system parses the content and extracts your profile details automatically.',
    icon: FileText,
  },
  {
    number: '02',
    title: 'Paste Job Post',
    description: 'Provide the description of your target job. The AI compares your skills with what hiring managers want.',
    icon: Zap,
  },
  {
    number: '03',
    title: 'Optimize & Prepare',
    description: 'Review ATS scores, insert missing keywords, study interview questions, and follow your custom learning roadmap.',
    icon: Sparkles,
  },
];

// Testimonials data
const testimonials = [
  {
    quote: 'ResumeAI identified missing Docker and Redis keywords that were holding back my job applications. Landed 3 interviews within a week!',
    name: 'Sarah Chen',
    role: 'Senior Frontend Engineer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  },
  {
    quote: 'The tailored interview prep section generated exact coding challenges I was asked during my technical loop at Meta.',
    name: 'Marcus Vance',
    role: 'Full Stack Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    quote: 'The ATS score breakdown gives instant, clear feedback. Must-have tool for any developer navigating job hunts.',
    name: 'Elena Rostova',
    role: 'Product Designer & PM',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
];

// Pricing Plans
const pricingPlans = [
  {
    name: 'Starter',
    price: '$0',
    description: 'Perfect for exploring resume parsing and initial ATS score checks.',
    features: [
      '3 Resume Uploads',
      'Basic Job Match Analysis',
      'Standard ATS Scoring',
      'Community Support',
    ],
    buttonText: 'Start Free',
    popular: false,
    href: '/register',
  },
  {
    name: 'Professional',
    price: '$19',
    description: 'Full power for active job seekers needing complete interview & roadmap tools.',
    features: [
      'Unlimited Resume Uploads',
      'Advanced Gemini 2.5 Job Comparison',
      '30 Customized Interview Prep Questions',
      'Milestone Learning Roadmaps',
      'Detailed ATS Keyword Suggestions',
      'Priority Email Support',
    ],
    buttonText: 'Get Started',
    popular: true,
    href: '/register',
  },
  {
    name: 'Enterprise',
    price: '$49',
    description: 'For career coaches, recruiters, and placement organizations.',
    features: [
      'Everything in Professional',
      'Multi-user Team Organization',
      'API Access for Automated Parsing',
      'Dedicated Account Manager',
      'Custom Prompt Configurations',
    ],
    buttonText: 'Contact Sales',
    popular: false,
    href: 'mailto:sales@resumeai.dev',
  },
];

// FAQs
const faqs = [
  {
    question: 'How does ResumeAI extract data from my PDF?',
    answer: 'We parse the document on our server to retrieve raw text, then leverage Google Gemini to build structured JSON profiles containing experience, projects, skills, and academic history.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use Supabase Auth and Storage to secure your uploaded resumes. Only you can view or delete your records. We never share your personal information.',
  },
  {
    question: 'What is an ATS score?',
    answer: 'Applicant Tracking Systems (ATS) scan resumes for specific keywords. ResumeAI evaluates your document against your target job description, identifying critical keywords and technical requirements to grade your compatibility.',
  },
  {
    question: 'Can I use this without a Supabase setup?',
    answer: 'Yes! If you run ResumeAI locally and do not input Supabase environment variables, the app automatically transitions to an offline LocalStorage engine. Your data is stored right in your browser.',
  },
];

export default function HomePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-10 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      {/* Navigation bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2 shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span>ResumeAI</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </button>
            <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
              Login
            </Link>
            <Link href="/register">
              <Button variant="gradient" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 text-center lg:px-8 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            Empowered by Gemini 2.5 Flash
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Optimize your resume. <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 dark:from-indigo-400 dark:via-purple-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Conquer the job match.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            Upload your resume, paste a target job posting, and receive a comprehensive match analysis, ATS scores, learning path, and tailored interview questions in seconds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button variant="gradient" size="lg" className="group gap-2">
                Analyze For Free 
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                Explore Demo Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400 pt-6">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Free to Try</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> PDF Parsing</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Real-time Analytics</span>
          </div>
        </motion.div>

        {/* Hero Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 sm:mt-24 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 p-3 shadow-2xl backdrop-blur-md max-w-4xl mx-auto overflow-hidden"
        >
          <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950 overflow-hidden shadow-inner">
            {/* Top Bar Mockup */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-slate-200/60 dark:bg-slate-900/60 px-4 py-3 text-slate-500 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/60" />
                <span className="h-3 w-3 rounded-full bg-amber-500/60" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="rounded bg-slate-300/50 dark:bg-white/5 px-8 py-1 font-mono text-slate-600 dark:text-slate-400">resumeai.dev/dashboard</div>
              <div className="w-12" />
            </div>
            
            {/* Inner Dashboard Simulation */}
            <div className="grid gap-6 p-6 text-left sm:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 dark:bg-indigo-500/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-300 font-semibold">Comparison Fit</p>
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">84%</p>
                  </div>
                  <Badge variant="success">Strong Fit</Badge>
                </div>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900/80 px-4 py-3 text-sm shadow-sm border border-slate-200 dark:border-transparent">
                    <span className="text-slate-600 dark:text-slate-400">ATS Keyword Match</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">91/100</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900/80 px-4 py-3 text-sm shadow-sm border border-slate-200 dark:border-transparent">
                    <span className="text-slate-600 dark:text-slate-400">Missing Core Skills</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">AWS, Redis</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 p-5 space-y-3 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Immediate Improvements</p>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>Incorporate quantitative impact metrics inside TechFlow experience bullets.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>Include Docker and deployment environments.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* AI Workflow Steps Section */}
      <section className="border-t border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/20 py-20 sm:py-28 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-16 sm:mb-24">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Simple, Powerful workflow
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Get comprehensive technical career feedback in three elementary steps.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Connector Line (Desktop) */}
            <div className="absolute top-1/2 left-[15%] right-[15%] h-0.5 border-t border-dashed border-slate-300 dark:border-white/10 -translate-y-1/2 hidden md:block z-0" />
            
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <Card key={idx} className="relative z-10 space-y-4 hover:border-indigo-500/40 group">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-indigo-500/10 p-3.5 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 transition duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-3xl font-extrabold text-slate-200 dark:text-white/10 select-none">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-4">{step.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-16 sm:mb-24">
            <Badge variant="brand">Full Suite</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Everything you need to secure your next role
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Unlock professional resume features and deep semantic match assessments.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} hoverEffect className="flex flex-col h-full">
                  <div className={`mb-5 inline-flex rounded-2xl bg-gradient-to-br ${feature.color} p-3.5 ${feature.iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/20 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-16 sm:mb-24">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Job seekers are winning
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Here is what software engineers, designer profiles, and PMs say about ResumeAI.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="space-y-6 flex flex-col justify-between">
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-white/5">
                  <img
                    className="h-10 w-10 rounded-full object-cover border border-slate-300 dark:border-white/10"
                    src={t.avatar}
                    alt={t.name}
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Cards (Dummy) */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute top-1/2 left-1/2 h-[350px] w-[350px] rounded-full bg-purple-500/5 blur-[90px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-16 sm:mb-24">
            <Badge variant="brand">Pricing</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              No hidden fees. Free tier available to get started.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 items-stretch max-w-5xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <Card 
                key={idx} 
                className={`relative flex flex-col justify-between h-full hover:border-indigo-500/30 ${
                  plan.popular ? 'border-indigo-500/50 bg-white dark:bg-slate-900/80 shadow-indigo-500/10 ring-1 ring-indigo-500/30' : ''
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3.5 py-1 text-xs font-semibold text-white tracking-wide shadow-md">
                    Most Popular
                  </span>
                )}
                
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{plan.price}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">/month</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{plan.description}</p>
                  
                  <ul className="mt-6 space-y-3.5 text-sm text-slate-700 dark:text-slate-300">
                    {plan.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2.5">
                        <Check className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-8 pt-4">
                  <Link href={plan.href} className="block w-full">
                    <Button 
                      variant={plan.popular ? 'gradient' : 'outline'} 
                      className="w-full"
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="border-t border-slate-200 dark:border-white/5 py-20 sm:py-28 bg-slate-100/50 dark:bg-slate-900/10">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Clear up any doubts before starting your optimization workflow.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/30 overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`h-4.5 w-4.5 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="border-t border-slate-200 dark:border-white/5 px-6 py-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Chatbot Widget */}
      <ChatbotWidget />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/5 py-12 text-slate-500 text-sm">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6 lg:px-8">
          <div className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-slate-300">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <span>ResumeAI</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-slate-300 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-slate-300 transition">Terms of Service</Link>
            <Link href="mailto:support@resumeai.dev" className="hover:text-slate-900 dark:hover:text-slate-300 transition">Contact Support</Link>
          </div>
          
          <p>© 2026 ResumeAI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
