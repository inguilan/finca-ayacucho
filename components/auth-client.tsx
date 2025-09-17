"use client"

import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'

export default function AuthClient() {
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      console.log('Usuario autenticado anonimamente, uid =', user.uid)
    }
  }, [user])

  return null
}
