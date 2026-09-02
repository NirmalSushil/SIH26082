# Deployment Guide

This guide walks you through deploying the Air Pollution–Weather Coupled Forecast app to **Vercel** (free tier) with zero required API secrets.

---

## Why Vercel?

- **Free tier:** Unlimited deployments, up to 100 Serverless Function invocations/month
- **Zero configuration:** Git-to-production in minutes
- **Auto-scaling:** Handles traffic spikes automatically
- **Edge network:** Global CDN for fast page loads
- **Environment variables:** Built-in secrets management (optional)
- **Automatic HTTPS:** Free SSL certificate included
- **Rollbacks:** One-click revert to previous deployment

---

## Prerequisites

- GitHub account (https://github.com) — free
- Vercel account (https://vercel.com) — free, sign up with GitHub
- Project pushed to GitHub repository
- All documentation and code complete (per `/docs` and `/src`)

---

## Step 1: Push to GitHub

### Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new public or private repository (e.g., `air-pollution-forecast`)
3. Do **NOT** initialize with README (you have one)

### Push Local Code to GitHub

```bash
cd c:\Users\nirma\Documents\SIH26082\air-pollution-forecast

# Initialize Git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Air Pollution-Weather Coupled Forecast MVP"

# Add remote origin (replace USERNAME/REPO with your GitHub details)
git remote add origin https://github.com/USERNAME/air-pollution-forecast.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Verify:** Go to https://github.com/USERNAME/air-pollution-forecast and confirm files are there.

---

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended for Beginners)

1. **Sign in to Vercel:**
   - Go to https://vercel.com
   - Click "Sign in" and choose "Continue with GitHub"
   - Authorize Vercel to access your GitHub repositories

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your GitHub organization
   - Search for and select `air-pollution-forecast` repository
   - Click "Import"

3. **Configure Project:**
   - **Project name:** `air-pollution-forecast` (auto-filled)
   - **Framework preset:** Next.js (auto-detected)
   - **Root directory:** `./` (correct if project root has `package.json`)
   - **Environment Variables:** Leave empty (Open-Meteo needs no keys)
     - *Optional:* If using WAQI fallback, add:
       ```
       NEXT_PUBLIC_WAQI_TOKEN=your_token_here
       ```

4. **Deploy:**
   - Click "Deploy"
   - Wait 2–3 minutes for build to complete
   - You'll see a success message with a live URL

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI (one-time)
npm install -g vercel

# In project directory
cd c:\Users\nirma\Documents\SIH26082\air-pollution-forecast

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - "Set up and deploy? Yes"
# - "Which scope? your-username"
# - "Link to existing project? No"
# - "What's your project's name? air-pollution-forecast"
# - "In which directory is your code? ./"
# - "Want to override the settings? No"

# Wait for build to complete...
# You'll see a live URL like: https://air-pollution-forecast.vercel.app
```

---

## Step 3: Verify Live Deployment

### Test the Live URL

1. Click the Vercel deployment link (e.g., `https://air-pollution-forecast.vercel.app`)
2. Test functionality:
   - [ ] Search bar accepts city names
   - [ ] Forecast data loads for multiple cities
   - [ ] Chart displays with raw + adjusted AQI lines
   - [ ] Current conditions show AQI + weather
   - [ ] No console errors (F12 → Console)
   - [ ] Responsive on mobile (DevTools: mobile emulation)

### Check Deployment Status

In Vercel dashboard:
- Go to https://vercel.com/dashboard
- Select your project
- View **Deployments** tab to see all builds
- View **Analytics** to monitor traffic and performance

---

## Step 4: Configure Custom Domain (Optional)

If you want a custom domain (e.g., `airquality.me`):

1. **Buy a domain** from registrar (GoDaddy, Namecheap, etc.)
2. **In Vercel Dashboard:**
   - Go to project Settings → Domains
   - Enter your custom domain (e.g., `airquality.me`)
   - Follow instructions to update DNS records at your registrar
   - Wait 24–48 hours for DNS propagation

Your app will then be accessible at `https://airquality.me`

---

## Step 5: Monitor & Maintain

### View Logs

In Vercel dashboard → **Deployments** tab:
- Click a deployment → **View Build Logs**
- Scroll to see build output and any errors

### Check Runtime Errors

- Go to **Functions** tab to see Serverless Function invocations
- Go to **Monitoring** to see performance metrics and errors

### Redeploy After Code Changes

```bash
# Make changes locally
# ... edit files ...

# Commit and push
git add .
git commit -m "Fix: adjust AQI coupling weights"
git push origin main

# Vercel auto-redeploys! Check dashboard for build status.
```

**No manual deployment needed** — Vercel watches GitHub and auto-deploys on every push to `main` branch.

### Rollback to Previous Deployment

In Vercel dashboard → **Deployments** tab:
- Find a previous successful deployment
- Click "..." → "Promote to Production"
- Your live app instantly reverts to that version

---

## Environment Variables (Optional)

If you want to add environment variables (e.g., WAQI token):

### Local Development

Create `.env.local`:

```bash
# .env.local (NOT committed to Git)
NEXT_PUBLIC_WAQI_TOKEN=abc123xyz...
```

Access in code:

```typescript
const waqi_token = process.env.NEXT_PUBLIC_WAQI_TOKEN;
```

**Note:** The `NEXT_PUBLIC_` prefix means it's exposed to the browser. Use it for non-sensitive config only.

### Production (Vercel)

1. Go to Vercel dashboard → Project Settings → **Environment Variables**
2. Add variable:
   - **Name:** `NEXT_PUBLIC_WAQI_TOKEN`
   - **Value:** `abc123xyz...`
   - **Environments:** Production, Preview, Development
3. Save and **redeploy** (or push to GitHub to auto-redeploy)

---

## Performance Optimization

### Check Page Speed

Use Google PageSpeed Insights:
- Go to https://pagespeed.web.dev/
- Enter your live Vercel URL
- Review metrics (LCP, CLS, FID)
- Vercel provides recommendations

### Common Optimizations (Already in Next.js)

- ✅ Automatic code splitting
- ✅ Image optimization (next/image)
- ✅ CSS minification (Tailwind)
- ✅ Server-side rendering (RSC)
- ✅ Edge caching via CDN

No additional work needed for MVP; Vercel handles this automatically.

---

## Troubleshooting Deployment

### Issue: "Build failed"

**Solution:**
1. Check **Build Logs** in Vercel dashboard
2. Common causes:
   - Missing dependency: `npm install` and push updated `package-lock.json`
   - TypeScript error: `npm run build` locally to see error, fix, then push
   - Missing `.env` file: Add optional vars to Vercel dashboard

### Issue: "Blank page or 404 after deployment"

**Solution:**
1. Check browser DevTools Console (F12)
2. If errors about missing APIs:
   - Verify Open-Meteo endpoints are accessible (not firewalled)
   - Check CORS headers (should work from Vercel's IP)
3. If showing generic Next.js 404:
   - Verify `src/app/page.tsx` exists
   - Run `npm run build` locally to test

### Issue: "API calls failing in production but work locally"

**Solution:**
1. **Check CORS:** Open-Meteo APIs have open CORS; calls should work
2. **Check rate limits:** If thousands of users hit app simultaneously, may hit Open-Meteo rate limit (unlikely for MVP)
3. **Check environment:** Verify `.env.local` vars are in Vercel dashboard (if used)

---

## Cost Estimate

**Vercel Free Tier Coverage:**

| Item | Limit | Usage (MVP) | Cost |
|------|-------|-----------|------|
| **Serverless Functions** | 100 invocations/month | ~100 forecasts/month = 1 invocation | Free ✅ |
| **Edge Functions** | 50 per month | 0 | Free ✅ |
| **Bandwidth** | 100 GB/month | ~10 MB/month | Free ✅ |
| **Build execution** | 100 hours/month | ~0.5 hours (initial build only) | Free ✅ |

**Total monthly cost:** $0 USD

If your app goes viral (>100k users), upgrade to **Vercel Pro** ($20/month) for:
- Unlimited Functions and bandwidth
- Priority support
- Advanced analytics

---

## Continuous Integration / Continuous Deployment (CI/CD)

Vercel provides built-in CI/CD:

1. **Preview Deployments:** Every pull request → automatic staging URL
2. **Production Deployment:** Merge to `main` → auto-deploy to live URL
3. **Automatic Rollback:** Failed builds don't go live

**No additional setup needed** — just push to GitHub and Vercel handles the rest.

---

## Monitoring & Alerts (Optional)

Enable Vercel Alerts for build failures:

1. Go to project Settings → **Notifications**
2. Add email or Slack webhook
3. Get instant alerts on failed builds or performance issues

---

## Summary

**Quick Deployment Path:**

1. Push code to GitHub (5 min)
2. Sign in to Vercel with GitHub (1 min)
3. Import repository (auto-configured) (2 min)
4. Click "Deploy" (3 min wait for build)
5. Visit live URL and test (5 min)

**Total time: ~15 minutes from start to live production URL.**

---

## Next Steps

- ✅ Deployment complete
- ✅ Live URL shared with team/judges
- ✅ Run through Definition of Done checklist
- ✅ Celebrate! 🎉

For detailed Vercel documentation, see: https://vercel.com/docs
