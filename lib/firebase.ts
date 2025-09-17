// lib/firebase.ts (o src/firebase.ts)

import { getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCSA2nU62MaGpf2KpJXOTpoBldyLKNbabg',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'ayacucho-a7d2e.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ayacucho-a7d2e',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'ayacucho-a7d2e.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '598880998409',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:598880998409:web:b27d6dd8c9fcdae79994d8',
}

if (!getApps().length) initializeApp(firebaseConfig)

export const db = getFirestore()
export const auth = getAuth()
