import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { Package, Users, CreditCard, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  try {
    await requireAdmin()
  } catch {
    redirect('/auth/login')
  }

  const [totalProducts, totalUsers, totalSubscriptions, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
    prisma.subscription.count({ where: { status: 'active' } }),
    prisma.purchase.aggregate({ _sum: { amount: true }, where: { status: 'completed' } }),
  ])

  const stats = [
    { name: 'Productos', value: totalProducts, icon: Package, color: 'text-blue-600' },
    { name: 'Usuarios', value: totalUsers, icon: Users, color: 'text-green-600' },
    { name: 'Suscripciones activas', value: totalSubscriptions, icon: CreditCard, color: 'text-purple-600' },
    { name: 'Ingresos totales', value: `€${((revenue._sum.amount || 0) / 100).toFixed(2)}`, icon: DollarSign, color: 'text-yellow-600' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground">Gestiona productos, usuarios y suscripciones.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
