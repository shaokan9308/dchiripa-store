'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, X, CreditCard } from 'lucide-react'
import SubscriptionActions from './subscription-actions'

interface Subscription {
  id: string
  stripeSubscriptionId: string
  stripePriceId: string
  stripeCurrentPeriodEnd: Date
  status: string
  cancelAtPeriodEnd: boolean
  createdAt: Date
  user: { id: string; name: string | null; email: string }
}

interface Props {
  subscriptions: Subscription[]
  statusColors: Record<string, string>
  statusLabels: Record<string, string>
}

export default function SubscriptionFilters({ subscriptions, statusColors, statusLabels }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const statuses = ['active', 'canceled', 'past_due', 'trialing']

  const filtered = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch = search === '' ||
        sub.user.name?.toLowerCase().includes(search.toLowerCase()) ||
        sub.user.email.toLowerCase().includes(search.toLowerCase()) ||
        sub.stripePriceId.toLowerCase().includes(search.toLowerCase())
      
      const matchesStatus = statusFilter === null || sub.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [subscriptions, search, statusFilter])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o precio ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(null)}
          >
            Todas ({subscriptions.length})
          </Button>
          {statuses.map((status) => {
            const count = subscriptions.filter(s => s.status === status).length
            return (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(statusFilter === status ? null : status)}
              >
                {statusLabels[status]} ({count})
              </Button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {search || statusFilter ? 'No se encontraron suscripciones con esos filtros.' : 'No hay suscripciones aún.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((sub) => (
            <Card key={sub.id} className="transition-colors hover:bg-accent/50">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{sub.user.name || 'Sin nombre'}</p>
                        <Badge variant="outline" className={`text-xs ${statusColors[sub.status] || ''}`}>
                          {statusLabels[sub.status] || sub.status}
                        </Badge>
                        {sub.cancelAtPeriodEnd && (
                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                            Se cancela al finalizar
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{sub.user.email}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>ID: {sub.stripePriceId}</span>
                        <span>·</span>
                        <span>Fin del período: {formatDate(sub.stripeCurrentPeriodEnd)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:ml-4">
                    <SubscriptionActions
                      subscriptionId={sub.id}
                      stripeSubscriptionId={sub.stripeSubscriptionId}
                      status={sub.status}
                      cancelAtPeriodEnd={sub.cancelAtPeriodEnd}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
