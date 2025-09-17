"use client"

import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth'
import { useEffect, useState } from 'react'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      console.error('[useAuth] auth not available')
      setError('Auth no disponible')
      setReady(true)
      return
    }

    // Only try anonymous sign-in if there's no current user
    if (!auth.currentUser) {
      signInAnonymously(auth).catch((e) => {
        console.error('[useAuth] Anonymous sign-in error', e)
        setError(String(e))
        setReady(true)
      })
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      console.log('[useAuth] onAuthStateChanged user=', u?.uid)
      setUser(u)
      setReady(true)
      if (u) {
        try {
          localStorage.setItem('uid', u.uid)
        } catch (e) {
          // ignore
        }
      }
    })

    return () => unsub()
  }, [])

  return { user, ready, error }
}
