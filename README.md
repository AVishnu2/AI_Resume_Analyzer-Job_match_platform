# ResumeAI - AI Resume Analyzer & Job Match Platform

ResumeAI is a production-ready SaaS application designed for intelligent resume parsing, job matching, ATS score optimization, and automated technical & behavioral interview preparation powered by Google Gemini.

---

## 🌟 Key Features

- **🔐 Authentication & User Profiles**: User registration, sign-in, profile management, and persistent local/cloud session fallback.
- **📄 AI Resume Parsing & Extraction**: Upload and parse PDF resumes to automatically extract contact info, skills, work experience, education, projects, and certifications.
- **🎯 Intelligent Job Matcher**: Compare your resume against any target job description to generate:
  - **Compatibility Ratings**: Overall Match Score & ATS Compatibility Score.
  - **Keyword & Skill Gap Analysis**: Missing required skills and keywords to include for recruiter screening.
  - **Actionable Resume Suggestions**: Targeted recommendations, certs, and project suggestions to boost ATS alignment.
  - **Learning Roadmap**: Customized timeline pathway with milestone objectives to acquire missing qualifications.
  - **Tailored Interview Prep**: 15 Technical questions, 10 HR questions, 5 Behavioral STAR scenarios, and interactive Coding challenges complete with expected answers and solution code.
- **🤖 Interactive AI Career Assistant**: Built-in floating chatbot widget providing real-time AI career coaching, ATS keyword advice, resume suggestions, and interview strategy.
- **📜 History & Report Tracking**: Persistent storage for past job matches with full interactive report review.
- **🎨 Premium Modern Design System**: Responsive light/dark theme support, smooth dynamic animations (Framer Motion), clean typography, and high-contrast accessible UI elements.

---

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling & UI**: Tailwind CSS, Framer Motion, Lucide Icons, Recharts
- **Backend**: Next.js API Routes (Node.js runtime)
- **AI Models & Engine**: Google Gemini API (`gemini-2.5-flash`)
- **Database & Storage**: Supabase Client (PostgreSQL) + LocalStorage offline-first fallback
- **PDF Processing**: `pdf-parse`

---

## 📂 Folder Structure

```text
├── app/                        # Next.js App Router (Pages, Layouts, API routes)
│   ├── (auth)/                 # Authentication pages (login, register)
│   ├── (dashboard)/            # Dashboard sub-routes (job-matcher, history, profile, settings)
│   └── api/                    # Serverless API endpoints (job-match, interview-prep, parse-pdf)
├── components/                 # Reusable UI components & Layout Shells
├── hooks/                      # Custom React Hooks (e.g. useAuth)
├── lib/                        # Client libraries & Database interface abstraction (db.ts, supabase.ts)
├── services/                   # AI services & Gemini integration routines
├── supabase/                   # Database schema SQL files
├── types/                      # TypeScript definitions & data models
└── utils/                      # Helper & formatting utilities
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd "AI Resume Analyzer & job match platform"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create `.env.local` using the template above.

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Typecheck & Linting**:
   ```bash
   node "node_modules/typescript/lib/tsc.js" --noEmit
   ```

---

## 📄 Database Setup (Optional)

If using Supabase for production database persistence, run `supabase/schema.sql` in your Supabase SQL Editor to provision the required tables (`profiles`, `resumes`, `job_descriptions`, `resume_analysis`). If Supabase keys are not set, the platform seamlessly operates using LocalStorage.

---

## 📜 License

Distributed under the MIT License.
