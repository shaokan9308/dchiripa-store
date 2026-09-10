import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SubscriptionActions from './subscription-actions'

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

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    canceled: 'bg-red-100 text-red-800',
    past_due: 'bg-yellow-100 text-yellow-800',
    trialing: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Suscripciones</h1>
        <p className="text-muted-foreground">Gestiona las suscripciones de los usuarios.</p>
      </div>

      <div className="grid gap-4">
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay suscripciones aún.
            </CardContent>
          </Card>
        ) : (
          subscriptions.map((sub) => (
            <Card key={sub.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{sub.user.name || sub.user.email}</CardTitle>
                  <Badge className={statusColors[sub.status] || ''}>{sub.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  <p>Email: {sub.user.email}</p>
                  <p>Precio ID: {sub.stripePriceId}</p>
                  <p>Periodo hasta: {new Date(sub.stripeCurrentPeriodEnd).toLocaleDateString('es')}</p>
                  <p>Cancelar al final: {sub.cancelAtPeriodEnd ? 'Sí' : 'No'}</p>
                </div>
                <div className="mt-4">
                  <SubscriptionActions
                    subscriptionId={sub.id}
                    stripeSubscriptionId={sub.stripeSubscriptionId}
                    status={sub.status}
                    cancelAtPeriodEnd={sub.cancelAtPeriodEnd}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
