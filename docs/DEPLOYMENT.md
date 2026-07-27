# Deployment Guide

This guide covers deploying ResumeAI to production using Vercel.

## Prerequisites

- GitHub account with repository access
- Vercel account (free tier available)
- Supabase project configured
- Google Gemini API key

## Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add -A
git commit -m "chore: prepare for deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: One-Click Deploy (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AVishnu2/AI_Resume_Analyzer-Job_match_platform)

1. Click the button above
2. Sign in with your GitHub account
3. Import the repository
4. Add environment variables (see Step 3)
5. Click "Deploy"

### Option B: Manual Deployment

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project settings:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Add environment variables (see Step 3)
5. Click "Deploy"

## Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

### Required Variables

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `GEMINI_API_KEY` | Google Gemini API key | [Google AI Studio](https://makersuite.google.com/app/apikey) |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Your production URL | Auto-detected by Vercel |

## Step 4: Configure CI/CD Pipeline (GitHub Actions)

### Get Vercel Credentials

1. **VERCEL_TOKEN**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and get token
   vercel login
   vercel token
   ```
   Or get it from: [Vercel Dashboard → Settings → Tokens](https://vercel.com/account/tokens)

2. **VERCEL_ORG_ID** and **VERCEL_PROJECT_ID**:
   ```bash
   # Link your project
   vercel link
   
   # Check .vercel/project.json for IDs
   cat .vercel/project.json
   ```

### Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

### Verify CI/CD Pipeline

The pipeline will automatically:
- Run on every push to `main` branch
- Run type checking and linting
- Build the project
- Deploy to Vercel production

Check pipeline status: GitHub → Your Repo → Actions tab

## Step 5: Configure Supabase

### Run Database Schema

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Copy and paste contents from `supabase/schema.sql`
4. Click **Run** to execute the schema

### Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)

## Step 6: Verify Deployment

After deployment completes:

1. **Test Landing Page**: Visit your Vercel URL
   - Verify chatbot appears in bottom-right corner
   - Check theme toggle works
   - Test navigation links

2. **Test Authentication**:
   - Register a new account
   - Login with credentials
   - Verify redirect to dashboard

3. **Test Core Features**:
   - Upload a PDF resume
   - Paste a job description
   - Run job match analysis
   - View analysis history
   - Test clear history feature
   - Try the chatbot

4. **Test Chatbot**:
   - Open chatbot from landing page (no login required)
   - Ask different questions
   - Verify varied responses

## Step 7: Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate provisioning (automatic)

## Troubleshooting

### Build Failures

```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run typecheck

# Check for linting errors
npm run lint
```

### Environment Variables Not Working

- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding new environment variables
- Check Vercel build logs for missing variables

### Database Connection Issues

- Verify Supabase URL and keys are correct
- Check Supabase project is not paused
- Ensure RLS policies are configured correctly

### Chatbot Not Responding

- Verify `GEMINI_API_KEY` is set in Vercel
- Check Vercel function logs for errors
- Ensure Gemini API quota is not exceeded

## Monitoring

### Vercel Analytics

Enable Vercel Analytics in your project dashboard:
- Traffic analytics
- Performance metrics
- Error tracking

### Application Monitoring

Monitor your application:
- Vercel Dashboard → Your Project → Logs
- Supabase Dashboard → Database → Logs
- GitHub Actions → Workflow runs

## Rollback

If deployment fails:

1. Go to Vercel Dashboard → Deployments
2. Find the last successful deployment
3. Click "..." → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Cost Estimation

### Vercel Free Tier
- 100GB bandwidth/month
- Unlimited serverless functions
- Automatic HTTPS
- Preview deployments

### Supabase Free Tier
- 500MB database
- 1GB file storage
- 10,000 monthly active users
- 50MB database transfer/day

### Google Gemini API
- Free tier: 15 requests/minute
- Pay-as-you-go pricing beyond free tier

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **GitHub Issues**: [Your Repository Issues](https://github.com/AVishnu2/AI_Resume_Analyzer-Job_match_platform/issues)