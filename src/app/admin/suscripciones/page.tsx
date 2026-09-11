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

  const totalSubscriptions = subscriptions.length
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length
  const canceledSubscriptions = subscriptions.filter(s => s.status === 'canceled').length
  const pastDueSubscriptions = subscriptions.filter(s => s.status === 'past_due').length
  const manualSubscriptions = subscriptions.filter(s => s.isManual).length

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 border-green-200',
    canceled: 'bg-red-100 text-red-800 border-red-200',
    past_due: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    trialing: 'bg-blue-100 text-blue-800 border-blue-200',
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
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Canceladas</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{canceledSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pago pendiente</CardTitle>
            <DollarSign className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pastDueSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Manuales</CardTitle>
            <Clock className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{manualSubscriptions}</div>
          </CardContent>
        </Card>
      </div>

      <ManualSubscriptionForm />

      <SubscriptionFilters subscriptions={subscriptions} statusColors={statusColors} statusLabels={statusLabels} />
    </div>
  )
}
