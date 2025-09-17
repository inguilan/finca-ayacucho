"use client"

import { auth } from '@/lib/firebase'
import { addCattle, deleteCattle, getAllCattle, updateCattle } from '@/lib/firestore'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { useCallback, useEffect, useState } from 'react'

export function useCattle() {
  const [cattle, setCattle] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const uid = auth?.currentUser?.uid
      console.log('[useCattle] fetching cattle... uid=', uid)
      const data = await getAllCattle()
      console.log('[useCattle] fetched cattle count=', data.length)
      setCattle(data)
      return data
    } catch (err: any) {
      console.error('[useCattle] fetch error', err)
      // Detect permission-denied from Firestore
      if (err && err.code === 'permission-denied') {
        setError('Permiso denegado: revisa las reglas de Firestore o si el usuario está autenticado.')
      } else if (err && err.message) {
        setError(err.message)
      } else {
        setError(String(err))
      }
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let unsub: (() => void) | undefined
    try {
      unsub = onAuthStateChanged(auth, (user) => {
        console.log('[useCattle] auth state changed, user=', user?.uid)
        if (user) {
          fetchAll().catch((e) => console.warn('[useCattle] fetchAll after auth failed', e))
        } else {
          console.log('[useCattle] no auth user yet')
        }
      })
    } catch (e) {
      console.error('[useCattle] onAuthStateChanged error', e)
      setError('Error inicializando auth listener: ' + String(e))
    }

    // also try if auth already exists
    if (auth?.currentUser) {
      fetchAll().catch((e) => console.warn('[useCattle] fetchAll immediate failed', e))
    }

    return () => {
      try {
        if (unsub) unsub()
      } catch (e) {
        // ignore
      }
    }
  }, [fetchAll])

  const addCattleWrap = async (data: any) => {
    try {
      let uid = auth.currentUser?.uid || (typeof window !== 'undefined' && (window as any).localStorage.getItem('uid'))
      if (!uid) {
        // attempt anonymous sign-in and use the returned credential to get uid
        console.log('[useCattle] no uid, attempting anonymous sign-in')
        try {
          const cred = await signInAnonymously(auth)
          uid = cred?.user?.uid || (typeof window !== 'undefined' && (window as any).localStorage.getItem('uid'))
          console.log('[useCattle] anonymous sign-in success uid=', uid)
        } catch (e: any) {
          console.warn('[useCattle] anonymous sign-in failed', e)
          // If anonymous auth is disabled in Firebase console, explain it
          const msg = e?.code === 'auth/operation-not-allowed'
            ? 'Inicio anónimo deshabilitado en Firebase. Habilítalo en Firebase Console > Authentication > Sign-in method > Anonymous.'
            : (e?.message || String(e))
          setError('Falló inicio anónimo: ' + msg)
        }
      }

     

      const id = await addCattle({ ...data, ownerId: uid })
      setCattle((prev) => [...prev, { id, ...data, ownerId: uid }])
      return id
    } catch (e: any) {
      setError(e.message || String(e))
      console.error('[useCattle] addCattle error', e)
      throw e
    }
  }

  const updateCattleWrap = async (id: string, data: any) => {
    try {
      await updateCattle(id, data)
      setCattle((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
    } catch (e: any) {
      setError(e.message || String(e))
      throw e
    }
  }

  const removeCattleWrap = async (id: string) => {
    try {
      await deleteCattle(id)
      setCattle((prev) => prev.filter((c) => c.id !== id))
    } catch (e: any) {
      setError(e.message || String(e))
      throw e
    }
  }

  return { cattle, loading, error, refresh: fetchAll, addCattle: addCattleWrap, updateCattle: updateCattleWrap, removeCattle: removeCattleWrap }
}
