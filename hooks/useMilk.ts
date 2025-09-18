"use client"

import { useEffect, useState, useCallback } from 'react'
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getAllMilkRecords, addMilkRecord, updateMilkRecord, deleteMilkRecord } from '@/lib/firestore'

export function useMilk() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllMilkRecords()
      setRecords(data)
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    const q = query(collection(db, 'milkRecords'), orderBy('productionDate', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        setRecords(docs)
        setLoading(false)
      },
      (err) => {
        console.error('[useMilk] snapshot error', err)
        setError(err.message || String(err))
        setLoading(false)
      },
    )

    return () => unsub()
  }, [])

  const add = async (data: any) => {
    try {
      // Normalize productionDate to yyyy-MM-dd (in case caller passed a Date)
      const productionDate = typeof data.productionDate === 'string' ? data.productionDate : new Date(data.productionDate).toISOString().split('T')[0]

      // Search for an existing record for the same cattleId and productionDate
      const q = query(collection(db, 'milkRecords'), where('cattleId', '==', data.cattleId), where('productionDate', '==', productionDate))
      const snap = await getDocs(q)

      if (!snap.empty) {
        // Merge into the first found document (should be at most one if rules/enforcement applied)
        const existing = snap.docs[0]
        const existingData = existing.data() as any

        const merged = {
          ...existingData,
          morningLiters: (existingData.morningLiters || 0) + (data.morningLiters || 0),
          afternoonLiters: (existingData.afternoonLiters || 0) + (data.afternoonLiters || 0),
          eveningLiters: (existingData.eveningLiters || 0) + (data.eveningLiters || 0),
          totalLiters: (existingData.totalLiters || 0) + (data.morningLiters || 0) + (data.afternoonLiters || 0) + (data.eveningLiters || 0),
          notes: data.notes || existingData.notes || '',
        }

        await updateMilkRecord(existing.id, merged)
        return existing.id
      }

      // No existing record -> create new (ensure productionDate normalized)
      const payload = { ...data, productionDate }
      const id = await addMilkRecord(payload)
      return id
    } catch (e: any) {
      setError(e.message || String(e))
      throw e
    }
  }

  const update = async (id: string, data: any) => {
    try {
      await updateMilkRecord(id, data)
    } catch (e: any) {
      setError(e.message || String(e))
      throw e
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteMilkRecord(id)
    } catch (e: any) {
      setError(e.message || String(e))
      throw e
    }
  }

  return { records, loading, error, refresh, add, update, remove }
}
