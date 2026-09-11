'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Ban, RotateCcw, Loader2, Plus, Minus } from 'lucide-react'

interface Props {
  subscriptionId: string
  stripeSubscriptionId: string | null
  status: string
  cancelAtPeriodEnd: boolean
  isManual: boolean
}

export default function SubscriptionActions({
  subscriptionId,
  stripeSubscriptionId,
  status,
  cancelAtPeriodEnd,
  isManual,
}: Props) {
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    if (!confirm('¿Cancelar esta suscripcion?')) return
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

  const handleExtend = async (months: number) => {
    setLoading(true)
    await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'extend', months }),
    })
    setLoading(false)
    window.location.reload()
  }

  if (status === 'canceled') return null

  return (
    <div className="flex gap-2 flex-wrap">
      {isManual && (
        <>
          <Button variant="outline" size="sm" onClick={() => handleExtend(1)} disabled={loading}>
            {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Plus className="mr-1 h-3 w-3" />}
            +1 mes
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExtend(3)} disabled={loading}>
            {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Plus className="mr-1 h-3 w-3" />}
            +3 meses
          </Button>
        </>
      )}
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
