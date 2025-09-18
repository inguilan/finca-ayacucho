"use client"

import { useEffect, useState, useCallback } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getAllWeightRecords, addWeightRecord, updateWeightRecord, deleteWeightRecord } from '@/lib/firestore'

export function useWeight() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllWeightRecords()
      setRecords(data)
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    const q = query(collection(db, 'weightRecords'), orderBy('weightDate', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        setRecords(docs)
        setLoading(false)
      },
      (err) => {
        console.error('[useWeight] snapshot error', err)
        setError(err.message || String(err))
        setLoading(false)
      },
    )

    return () => unsub()
  }, [])

  const add = async (data: any) => {
    try {
      // Normalize weightDate to yyyy-MM-dd (if Date provided)
      const weightDate = typeof data.weightDate === 'string' ? data.weightDate : new Date(data.weightDate).toISOString().split('T')[0]
      const payload = { ...data, weightDate }
      const id = await addWeightRecord(payload)
      return id
    } catch (e: any) {
      setError(e.message || String(e))
      throw e
    }
  }

  const update = async (id: string, data: any) => {
    try {
      await updateWeightRecord(id, data)
    } catch (e: any) {
      setError(e.message || String(e))
      throw e
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteWeightRecord(id)
    } catch (e: any) {
      setError(e.message || String(e))
      throw e
    }
  }

  return { records, loading, error, refresh, add, update, remove }
}
