# TripWise — Intelligent Travel Planning

> AI-powered travel platform. From "I want to travel" to full trip plan in 2 minutes.

**Live:** https://tripwiseai.vercel.app

---

## Project structure

```
tripwise/
├── backend/          ← FastAPI (Python 3.11)
│   ├── main.py       ← App entry + keep-alive bot
│   ├── routers/      ← viability, itinerary, flights, trips, group, expenses
│   ├── requirements.txt
│   └── runtime.txt   ← pins Python 3.11 for Render
│
└── frontend/         ← Next.js 14 (TypeScript + Tailwind)
    └── src/
        ├── app/      ← pages: home, plan, trip/[id]
        ├── lib/      ← firebase.ts
        └── context/  ← AuthContext.tsx
```

---

## Local development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # add your GEMINI_API_KEY
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # add Firebase + backend URL
npm run dev
```

---

## Hosting

| Service | Platform |
|---------|----------|
| Frontend | Vercel — root dir: `frontend` |
| Backend | Render — root dir: `backend`, start: `uvicorn main:app --host 0.0.0.0 --port $PORT` |

### Render environment variables
```
GEMINI_API_KEY   = your key
RENDER_URL       = https://tripwise-backend.onrender.com  (your own URL)
FRONTEND_URL     = https://tripwiseai.vercel.app
```

### Vercel environment variables
```
NEXT_PUBLIC_API_URL                    = https://tripwise-backend.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY           = ...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN       = ...
NEXT_PUBLIC_FIREBASE_PROJECT_ID        = ...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET    = ...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = ...
NEXT_PUBLIC_FIREBASE_APP_ID            = ...
```

---

## Stack
Next.js · TypeScript · Tailwind · FastAPI · Python 3.11 · Gemini AI · Firebase Auth
