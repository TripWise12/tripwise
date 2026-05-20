# TripIQ — Intelligent Travel Planning Platform

> From "I want to travel" to fully planned trip in under 2 minutes.

---

## What's included

```
tripiq/
├── frontend/          ← Next.js 14 app (TypeScript + Tailwind)
│   ├── src/app/
│   │   ├── page.tsx           ← Premium landing page
│   │   ├── plan/page.tsx      ← 4-step trip input flow
│   │   ├── trip/[id]/page.tsx ← Full trip dashboard
│   │   └── globals.css        ← Design system
│   └── package.json
│
└── backend/           ← FastAPI (Python)
    ├── main.py                ← App entry point + CORS
    ├── routers/
    │   ├── viability.py       ← AI trip viability report
    │   ├── itinerary.py       ← AI day-by-day itinerary
    │   ├── flights.py         ← Flight + hotel search
    │   ├── trips.py           ← CRUD for saved trips
    │   ├── group.py           ← Group coordination
    │   └── expenses.py        ← Bill splitting logic
    ├── supabase_schema.sql    ← Database schema (run once)
    └── requirements.txt
```

---

## Quick Start (Local Development)

### Prerequisites
- Node 18+ (`node --version`)
- Python 3.10+ (`python --version`)
- An OpenAI API key (platform.google-generativeai.com)

---

### Step 1 — Backend setup

```bash
cd tripiq/backend

# Create virtual environment
py -m venv venv

# Activate it
source venv/bin/activate       # Mac / Linux
venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Now edit .env and add your GEMINI_API_KEY


Edit `backend/.env`:
```
GEMINI_API_KEY=your-gemini-api-key-here
SUPABASE_URL=                  # leave blank for now — works without it
SUPABASE_KEY=                  # leave blank for now
FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

Test it: open http://localhost:8000/health → should return `{"status":"ok"}`

---

### Step 2 — Frontend setup

```bash
cd tripiq/frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local — the default values work for local dev
```

`.env.local` default (works out of the box):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the frontend:
```bash
npm run dev
```

Open http://localhost:3000 — you should see the TripIQ landing page.

---

### Step 3 — Test the full flow

1. Click **"Plan a trip"**
2. Enter: Mumbai → Tokyo, pick dates, interests, budget
3. Click **"Generate my trip"**
4. Watch the AI build your viability report + full itinerary (15–30 seconds)
5. Explore all 7 tabs: Overview, Itinerary, Flights, Hotels, Packing, Budget, Group

---

## Deployment

### Backend → Railway (recommended, free tier)

1. Create account at railway.app
2. New Project → Deploy from GitHub
3. Select your `backend/` folder (or root with nixpacks pointing to backend)
4. Add environment variables in Railway dashboard:
   ```
   GEMINI_API_KEY=sk-...
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Railway gives you a URL like `https://tripiq-backend.railway.app`

### Frontend → Vercel (recommended, free tier)

1. Push to GitHub
2. vercel.com → New Project → Import
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://tripiq-backend.railway.app
   ```
5. Deploy — you get `https://tripiq.vercel.app`

---

## Setting up Supabase (for saved trips + auth)

Supabase is optional — the app works without it using sessionStorage.
Add it when you want users to save and revisit trips.

### Setup

1. Create account at supabase.com → New Project
2. Go to **SQL Editor** → paste contents of `backend/supabase_schema.sql` → Run
3. Go to **Settings → API** → copy your Project URL and anon key
4. Add to `backend/.env`:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   ```
5. Add to `frontend/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Enable Google Auth (optional)

1. Supabase Dashboard → Authentication → Providers → Google → Enable
2. Create OAuth credentials at console.cloud.google.com
3. Paste Client ID + Secret into Supabase

---

## API Reference

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| POST | /api/viability | Trip viability report (weather, visa, safety, currency) |
| POST | /api/generate-itinerary | Full AI day-by-day itinerary |
| POST | /api/edit-itinerary | Edit existing itinerary with AI |
| POST | /api/flights | Flight search results |
| POST | /api/hotels | Hotel search results |
| POST | /api/trips | Save a trip |
| GET | /api/trips/{id} | Get a saved trip |
| PUT | /api/trips/{id} | Update a trip |
| GET | /api/trips/join/{code} | Get trip by invite code |
| POST | /api/trips/{id}/join | Join a group trip |
| GET | /api/trips/{id}/members | Get group members |
| POST | /api/trips/{id}/expense | Add an expense |
| GET | /api/trips/{id}/expenses | Get all expenses |
| GET | /api/trips/{id}/splits | Calculate bill splits |
| POST | /api/trips/{id}/comments | Add itinerary comment |
| GET | /api/trips/{id}/comments | Get comments |

### Example: Generate itinerary

```bash
curl -X POST http://localhost:8000/api/generate-itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Mumbai",
    "destination": "Tokyo",
    "start_date": "2025-04-01",
    "end_date": "2025-04-08",
    "interests": ["culture", "food"],
    "pace": "balanced",
    "budget_inr": 100000,
    "group_size": 2,
    "dietary": ["vegetarian"],
    "stay_type": "hotel",
    "planning_to_drive": false
  }'
```

---

## Upgrading to real flight/hotel data

The current flight and hotel search uses AI-generated results. To get live prices:

### Real flights — Amadeus API (free tier available)

1. Register at developers.amadeus.com → get Client ID + Secret
2. Add to `backend/.env`:
   ```
   AMADEUS_CLIENT_ID=your-id
   AMADEUS_CLIENT_SECRET=your-secret
   ```
3. In `backend/routers/flights.py`, replace the OpenAI call with:
   ```python
   pip install amadeus
   from amadeus import Client
   amadeus = Client(client_id=..., client_secret=...)
   response = amadeus.shopping.flight_offers_search.get(
       originLocationCode='BOM',
       destinationLocationCode='TYO',
       departureDate='2025-04-01',
       adults=2,
       currencyCode='INR'
   )
   ```

### Real hotels — Booking.com Affiliate API

1. Register at affiliate-program.booking.com (free, earn 25–40% commission)
2. Use their search widget or API to show real hotel results

---

## Cost estimate (running in production)

| Service | Free tier | Cost at scale |
|---------|-----------|---------------|
| Vercel (frontend) | 100GB bandwidth | $20/mo Pro |
| Railway (backend) | $5 credit/mo | ~$10-20/mo |
| Supabase (database) | 500MB, 50k rows | $25/mo Pro |
| OpenAI (AI) | Pay per use | ~₹80-150 per trip generated |

At 100 trips/day: ~₹8,000-15,000/month in OpenAI costs.
Offset with ₹299/month premium plan or affiliate commissions.

---

## Roadmap (what to build next)

After Phase 5 (current), the app is fully usable. Get 20 users before building more.

**Phase 6 — Real flight search** (Amadeus API)
**Phase 7 — PWA + offline mode** (`next-pwa`)
**Phase 8 — Push notifications** (live companion mode)
**Phase 9 — User accounts** (Supabase auth + saved trips)
**Phase 10 — SEO pages** (`/plan/tokyo`, `/plan/bali`, etc.)

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.10+ |
| AI | OpenAI GPT-4o |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| Frontend hosting | Vercel |
| Backend hosting | Railway |
| Realtime | Supabase Realtime |

---

Built for Indian travelers. Ship it.
