# ResumeAI - AI Resume Analyzer & Job Match Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-emerald?style=flat-square&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

**ResumeAI** is an intelligent, AI-powered career platform designed to optimize the job search and application process. Leveraging Google's advanced Gemini AI models, the platform parses resumes, calculates compatibility scores, highlights key skill gaps, designs targeted learning roadmaps, and builds customized interview preparation guides to help job seekers get past ATS screenings and land their dream roles.

---

## 🌟 Key Features

*   **🔐 Secure Authentication & Session Fallback**: Modern user onboarding and authentication powered by Supabase with a seamless LocalStorage offline-first fallback for guest evaluation.
*   **📄 AI-Powered Resume Parsing**: Upload PDF resumes to automatically extract structured professional data (personal info, experience timeline, education history, categorized skills, and accomplishments).
*   **🎯 Intelligent Job Matcher**: Compare your parsed resume against target job descriptions to produce:
    *   **Score Assessments**: Real-time compatibility rating (Match Score) and ATS optimization rating.
    *   **Keyword & Skill Gaps**: Highlights missing required skills and high-impact target keywords to help you bypass recruiter screens.
    *   **Actionable Feedback**: Targeted resume improvements, certification ideas, and project suggestions.
    *   **Milestone Roadmap**: A custom timeline pathway with practical steps to acquire missing credentials.
    *   **Interactive Interview Prep**: Generates 30 custom questions: 15 Technical, 10 HR strategy tips, 5 Behavioral (STAR method), and 2 coding tasks complete with solutions.
*   **🤖 Interactive AI Career Coach**: A floating chatbot widget that answers career questions, assists with resume edits, and provides real-time job application strategies.
*   **📜 History Tracking**: Persistent history panels to save, reload, and monitor past job match runs.
*   **🎨 Premium Dark/Light UI**: A responsive, accessible dashboard system featuring dynamic micro-animations, glassmorphic accents, and professional layout designs.

---

## 🛠️ Tech Stack

*   **Frontend Framework**: Next.js 15 (App Router), React 19, TypeScript
*   **Styling & UI**: Tailwind CSS, Framer Motion, Lucide Icons, Recharts
*   **Backend Runtime**: Next.js Serverless API Routes (Node.js)
*   **AI Engine**: Google Gemini API (`gemini-2.0-flash` & fallback)
*   **Database & Auth**: Supabase PostgreSQL + LocalStorage offline caching
*   **PDF Parsing Engine**: `pdf-parse`

---

## 📂 Project Structure

```text
├── FRONTEND/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (auth)/                   # Authentication routes (login, register)
│   │   ├── (dashboard)/              # Dashboard sections (job-matcher, history, profile, settings)
│   │   ├── (marketing)/              # Marketing landing pages
│   │   ├── api/                      # Next.js Serverless API endpoints
│   │   ├── globals.css               # Global styles & Tailwind variables
│   │   └── layout.tsx                # Root layout with theme provider
│   ├── components/                   # Reusable React components
│   │   ├── ui.tsx                    # Shared UI library (Button, Card, Badge, etc.)
│   │   ├── auth-shell.tsx            # Auth layout wrapper
│   │   ├── dashboard-shell.tsx       # Sidebar & header shell navigation
│   │   ├── chatbot-widget.tsx        # Floating AI Career Coach widget
│   │   └── theme-provider.tsx        # Dark/light mode theme provider
│   └── hooks/                        # Custom React hooks
│       └── use-auth.ts               # Local & cloud authentication state
│
├── BACKEND & UTILS/
│   ├── app/api/                      # Endpoint implementations
│   │   ├── chat/route.ts             # Career coach chatbot interface
│   │   ├── job-match/route.ts        # Match analysis processor
│   │   ├── interview-prep/route.ts   # Custom interview question creator
│   │   └── upload/route.ts           # PDF resume parser endpoint
│   ├── services/                     # Business logic layers
│   │   ├── gemini.ts                 # Gemini AI request pipelines & robust fallbacks
│   │   └── pdf-extract.ts            # Native node PDF text processor
│   └── lib/                          # Data helpers & libraries
│       ├── db.ts                     # Database controller (Supabase <-> LocalStorage bridge)
│       └── supabase.ts               # Supabase configuration client
│
└── DATABASE & CONFIGS/
    ├── supabase/
    │   └── schema.sql                # Production DB tables & schemas
    ├── .env.example                  # Environment template file
    └── vercel.json                   # Vercel platform configurations
```

---

## ⚙️ Environment Variables

To run the application locally, create a `.env.local` file in the root directory and populate it with your credentials:

```env
# Database & Cloud Configs
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API Keys
GEMINI_API_KEY=your_google_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

---

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AVishnu2/AI_Resume_Analyzer-Job_match_platform.git
   cd AI_Resume_Analyzer-Job_match_platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file following the template in the [Environment Variables](#️-environment-variables) section.

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Typecheck & Lint**:
   ```bash
   npm run typecheck
   npm run lint
   ```

---

## 📄 Database Setup (Optional)

To enable persistent data storage across devices, run the script found in `supabase/schema.sql` inside your Supabase SQL Editor. This will provision the required tables (`profiles`, `resumes`, `resume_analysis`). If these keys are left empty, the application will automatically fall back to browser-level LocalStorage.

---

## 🔄 CI/CD & Deployments

This project utilizes GitHub Actions for continuous integration and is designed to deploy automatically to **Vercel** on pushes to the `main` branch.

### Setup Automated Deployments

1. Store the following Action Secrets in your GitHub Repository settings:
   *   `VERCEL_TOKEN`: Your Vercel API authorization token.
   *   `VERCEL_ORG_ID`: Your Vercel account/organization ID.
   *   `VERCEL_PROJECT_ID`: Your target Vercel project ID.
2. Every push to the `main` branch will automatically run compiler checks (type checking, linting) and ship the build directly to Vercel production.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
