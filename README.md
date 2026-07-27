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

## 📂 Project Structure

```text
├── FRONTEND/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (auth)/                   # Authentication pages (login, register)
│   │   ├── (dashboard)/              # Dashboard pages (job-matcher, history, profile, settings)
│   │   ├── (marketing)/              # Marketing pages (landing page)
│   │   ├── api/                      # Backend API routes (serverless functions)
│   │   ├── globals.css               # Global styles & Tailwind imports
│   │   └── layout.tsx                # Root layout with theme provider
│   ├── components/                   # Reusable React components
│   │   ├── ui.tsx                    # Base UI component library (Button, Card, Badge, etc.)
│   │   ├── auth-shell.tsx            # Authentication layout wrapper
│   │   ├── dashboard-shell.tsx       # Dashboard layout wrapper
│   │   ├── chatbot-widget.tsx        # AI Career Assistant chatbot
│   │   └── theme-provider.tsx        # Dark/light theme context
│   └── hooks/                        # Custom React hooks
│       └── use-auth.ts               # Authentication state management
│
├── BACKEND/
│   ├── app/api/                      # Next.js API Routes (Serverless Functions)
│   │   ├── chat/route.ts             # Chatbot AI endpoint
│   │   ├── job-match/route.ts        # Job matching analysis endpoint
│   │   ├── interview-prep/route.ts   # Interview questions generation endpoint
│   │   └── parse-pdf/route.ts        # PDF resume parsing endpoint
│   ├── services/                     # Business logic & AI services
│   │   └── gemini.ts                 # Google Gemini AI integration
│   └── lib/                          # Core libraries & data access
│       ├── db.ts                     # Database operations (Supabase + LocalStorage)
│       ├── supabase.ts               # Supabase client configuration
│       └── utils.ts                  # Helper functions
│
├── DATABASE/
│   └── supabase/
│       └── schema.sql                # PostgreSQL schema for Supabase
│
├── TYPES/
│   └── types/
│       ├── index.ts                  # TypeScript type definitions
│       ├── lucide-react.d.ts         # Lucide icon type declarations
│       └── pdf-parse.d.ts            # PDF parser type declarations
│
├── CONFIGURATION/
│   ├── .env.example                  # Environment variables template
│   ├── .gitignore                    # Git ignore rules
│   ├── next.config.js                # Next.js configuration
│   ├── tailwind.config.ts            # Tailwind CSS configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── postcss.config.js             # PostCSS configuration
│   ├── vercel.json                   # Vercel deployment configuration
│   └── eslint.config.mjs             # ESLint configuration
│
├── CI/CD/
│   └── .github/
│       └── workflows/
│           └── vercel-deploy.yml     # GitHub Actions CI/CD pipeline
│
└── DOCUMENTATION/
    ├── README.md                     # Project overview & quick start
    └── docs/
        └── DEPLOYMENT.md             # Comprehensive deployment guide
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

## 🔄 CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment to Vercel.

### Pipeline Workflow

The CI/CD pipeline (`.github/workflows/vercel-deploy.yml`) automatically:

1. **Triggers**: On every push to `main` branch or pull request
2. **Quality Checks**:
   - Type checking with TypeScript
   - Linting with ESLint
   - Build verification
3. **Deployment**: Automatically deploys to Vercel production on main branch pushes

### Required GitHub Secrets

To enable automated deployment, add these secrets to your GitHub repository:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `VERCEL_TOKEN`: Your Vercel authentication token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

### Getting Vercel Credentials

1. **VERCEL_TOKEN**:
   - Go to [Vercel Dashboard](https://vercel.com/account/tokens)
   - Click "New Token"
   - Copy the generated token

2. **VERCEL_ORG_ID** and **VERCEL_PROJECT_ID**:
   - Import your project to Vercel (if not already done)
   - Go to Project Settings → General
   - Find "Project ID" and "Org ID" under the project details

### Manual Deployment

You can also deploy manually using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 📜 License

Distributed under the MIT License.
