'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Ban, RotateCcw, Loader2 } from 'lucide-react'

interface Props {
  subscriptionId: string
  stripeSubscriptionId: string
  status: string
  cancelAtPeriodEnd: boolean
}

export default function SubscriptionActions({
  subscriptionId,
  stripeSubscriptionId,
  status,
  cancelAtPeriodEnd,
}: Props) {
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    if (!confirm('¿Cancelar esta suscripción?')) return
    setLoading(true)
    await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    })
    setLoading(false)
    window.location.reload()
  }

  const handleReactivate = async () => {
    setLoading(true)
    await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reactivate' }),
    })
    setLoading(false)
    window.location.reload()
  }

  if (status === 'canceled') return null

  return (
    <div className="flex gap-2">
      {cancelAtPeriodEnd ? (
        <Button variant="outline" size="sm" onClick={handleReactivate} disabled={loading}>
          {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RotateCcw className="mr-1 h-3 w-3" />}
          Reactivar
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
          {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Ban className="mr-1 h-3 w-3" />}
          Cancelar
        </Button>
      )}
    </div>
  )
}
