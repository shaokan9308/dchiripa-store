import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Users, DollarSign, TrendingDown, Clock } from 'lucide-react'
import SubscriptionActions from './subscription-actions'
import SubscriptionFilters from './subscription-filters'
import ManualSubscriptionForm from './manual-subscription-form'

export const dynamic = 'force-dynamic'

export default async function AdminSubscriptionsPage() {
  try {
    await requireAdmin()
  } catch {
    redirect('/auth/login')
  }

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true },
  })

  const totalSubscriptions = subscriptions.length
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length
  const canceledSubscriptions = subscriptions.filter(s => s.status === 'canceled').length
  const pastDueSubscriptions = subscriptions.filter(s => s.status === 'past_due').length
  const manualSubscriptions = subscriptions.filter(s => s.isManual).length

  const statusColors: Record<string, string> = {
    active: 'bg-success/10 text-success border-success/20',
    canceled: 'bg-destructive/10 text-destructive border-destructive/20',
    past_due: 'bg-warning/10 text-warning border-warning/20',
    trialing: 'bg-primary/10 text-primary border-primary/20',
  }

  const statusLabels: Record<string, string> = {
    active: 'Activa',
    canceled: 'Cancelada',
    past_due: 'Pago pendiente',
    trialing: 'Período de prueba',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Suscripciones</h1>
        <p className="text-muted-foreground">Gestiona las suscripciones de los usuarios.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Activas</CardTitle>
            <Users className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{activeSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Canceladas</CardTitle>
            <TrendingDown className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{canceledSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pago pendiente</CardTitle>
            <DollarSign className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{pastDueSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Manuales</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{manualSubscriptions}</div>
          </CardContent>
        </Card>
      </div>

      <ManualSubscriptionForm users={users} />

      <SubscriptionFilters subscriptions={subscriptions} statusColors={statusColors} statusLabels={statusLabels} />
    </div>
  )
}
