# TripWise — Complete Environment Variables Guide

---

## LOCAL DEVELOPMENT

### backend/.env
Create this file (copy from backend/.env.example):

| Variable | Value | Where to get it |
|----------|-------|-----------------|
| `GEMINI_API_KEY` | `AIzaSy...` | aistudio.google.com/app/apikey → Create API key |
| `SUPABASE_URL` | `https://xxx.supabase.co` | supabase.com → your project → Settings → API → Project URL |
| `SUPABASE_KEY` | `eyJ...` | supabase.com → your project → Settings → API → anon/public key |
| `RENDER_URL` | `https://your-service.onrender.com` | Your Render service URL (leave blank locally) |
| `FRONTEND_URL` | `http://localhost:3000` | Localhost for local dev |

### frontend/.env.local
Create this file (copy from frontend/.env.example):

| Variable | Value | Where to get it |
|----------|-------|-----------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Your local backend |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSy...` | Firebase console (see below) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `xxx.firebaseapp.com` | Firebase console |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `your-project-id` | Firebase console |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `xxx.appspot.com` | Firebase console |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | Firebase console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:xxx:web:xxx` | Firebase console |

**How to get Firebase values:**
1. console.firebase.google.com → your project
2. Click the gear icon → Project settings
3. Scroll to "Your apps" → click your web app
4. Copy values from the `firebaseConfig` object

---

## RENDER (Backend)

Go to: Render dashboard → your service → **Environment** tab

Add these variables:

| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | Your Gemini API key |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase anon key |
| `RENDER_URL` | `https://your-service-name.onrender.com` ← your own Render URL |
| `FRONTEND_URL` | `https://tripwiseai.vercel.app` |

> **RENDER_URL** is used by the keep-alive bot to ping itself every 10 minutes.
> Set it to the exact URL Render gave your service.

---

## VERCEL (Frontend)

Go to: Vercel dashboard → your project → **Settings** → **Environment Variables**

Add these variables (set all to **Production**, **Preview**, and **Development**):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-service-name.onrender.com` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `your-project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:xxx:web:xxx` |

After adding variables on Vercel → click **Redeploy** to apply them.

---

## SUPABASE — One-time database setup

1. Go to supabase.com → your project → **SQL Editor**
2. Click **New query**
3. Paste the entire contents of `backend/supabase_schema.sql`
4. Click **Run**

That creates the `trips`, `trip_members`, and `expenses` tables.

---

## SUMMARY CHECKLIST

### Render — 5 variables
- [ ] `GEMINI_API_KEY`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_KEY`
- [ ] `RENDER_URL`
- [ ] `FRONTEND_URL`

### Vercel — 7 variables
- [ ] `NEXT_PUBLIC_API_URL`
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

### Supabase
- [ ] Run `supabase_schema.sql` in SQL Editor

### Firebase
- [ ] Add `tripwiseai.vercel.app` to Authorized domains
