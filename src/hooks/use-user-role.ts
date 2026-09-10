'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'

export function useUserRole() {
  const { data: session } = authClient.useSession()
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      setRole(null)
      setLoading(false)
      return
    }

    fetch('/api/user/role')
      .then((res) => res.json())
      .then((data) => {
        setRole(data.role)
        setLoading(false)
      })
      .catch(() => {
        setRole(null)
        setLoading(false)
      })
  }, [session])

  return { role, loading, isAdmin: role === 'admin' }
}
