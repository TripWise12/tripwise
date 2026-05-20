# Firebase Google Auth Setup

## Step 1 — Create Firebase project

1. Go to **console.firebase.google.com**
2. Click **Add project** → name it "tripwise"
3. Disable Google Analytics (optional) → Create project

## Step 2 — Enable Google Sign-In

1. In Firebase console → **Authentication** (left sidebar)
2. Click **Get started**
3. Under **Sign-in method** tab → click **Google**
4. Toggle **Enable** → add your support email → **Save**

## Step 3 — Register your web app

1. Project Overview → click the **</>** (Web) icon
2. App nickname: "tripwise-web" → **Register app**
3. Copy the `firebaseConfig` object — you need these values:

```js
const firebaseConfig = {
  apiKey: "...",           → NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "...",       → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "...",        → NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "...",    → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "...",→ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "..."             → NEXT_PUBLIC_FIREBASE_APP_ID
}
```

## Step 4 — Add to your .env.local

```
cp frontend/.env.example frontend/.env.local
```

Then open `frontend/.env.local` and paste your values.

## Step 5 — Add authorized domains

1. Firebase console → **Authentication** → **Settings** tab
2. **Authorized domains** → **Add domain**
3. Add:
   - `localhost` (already there)
   - `your-app.vercel.app` (when you deploy)

## Step 6 — Restart frontend

```
Ctrl+C
npm run dev
```

That's it. The Sign in button will now work.

---

## How auth works in TripWise

- Home page: visible to everyone, sign-in button top right
- Clicking "Plan a trip" without being signed in → shows sign-in modal
- After Google sign-in → user is sent to /plan automatically
- /plan and /trip pages → redirect to home if not signed in
- User profile photo + name shown in nav when signed in
- Sign out from the dropdown under the profile picture
