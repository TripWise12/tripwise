import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error('Google sign-in failed:', error)
    throw error
  }
}

export async function signOutUser() {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Sign-out failed:', error)
    throw error
  }
}

export { onAuthStateChanged, type User }
