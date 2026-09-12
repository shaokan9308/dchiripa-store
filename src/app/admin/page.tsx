import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Package, Users, CreditCard, DollarSign, TrendingUp, ShoppingBag, Download, Activity, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  try {
    await requireAdmin()
  } catch {
    redirect('/auth/login')
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalProducts,
    activeProducts,
    totalUsers,
    newUsersLast30Days,
    totalSubscriptions,
    activeSubscriptions,
    canceledSubscriptions,
    totalRevenue,
    revenueLast30Days,
    totalPurchases,
    purchasesLast30Days,
    totalDownloads,
    downloadsLast30Days,
    recentPurchases,
    recentUsers,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: 'active' } }),
    prisma.subscription.count({ where: { status: 'canceled' } }),
    prisma.purchase.aggregate({ _sum: { amount: true }, where: { status: 'completed' } }),
    prisma.purchase.aggregate({ _sum: { amount: true }, where: { status: 'completed', createdAt: { gte: thirtyDaysAgo } } }),
    prisma.purchase.count(),
    prisma.purchase.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.download.count(),
    prisma.download.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.purchase.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true, email: true } }, product: { select: { name: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    }),
  ])

  const formatCurrency = (amount: number) => `€${(amount / 100).toFixed(2)}`

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground">Resumen general de tu tienda.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Productos</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">{activeProducts} activos</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
            <div className="h-full bg-primary" style={{ width: `${totalProducts > 0 ? (activeProducts / totalProducts) * 100 : 0}%` }} />
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Usuarios</CardTitle>
            <Users className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">+{newUsersLast30Days} ultimo mes</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-success/20">
            <div className="h-full bg-success" style={{ width: '100%' }} />
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suscripciones</CardTitle>
            <CreditCard className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">{canceledSubscriptions} canceladas</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
            <div className="h-full bg-primary" style={{ width: `${totalSubscriptions > 0 ? (activeSubscriptions / totalSubscriptions) * 100 : 0}%` }} />
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos totales</CardTitle>
            <DollarSign className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalRevenue._sum.amount || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(revenueLast30Days._sum.amount || 0)} ultimo mes</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-warning/20">
            <div className="h-full bg-warning" style={{ width: '100%' }} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              Compras recientes
            </CardTitle>
            <Badge variant="secondary">{purchasesLast30Days} / 30 días</Badge>
          </CardHeader>
          <CardContent>
            {recentPurchases.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay compras aún.</p>
            ) : (
              <div className="space-y-3">
                {recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">{purchase.user.name || purchase.user.email}</span>
                      <span className="text-xs text-muted-foreground">{purchase.product.name}</span>
                    </div>
                    <span className="font-medium text-success">{formatCurrency(purchase.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-muted-foreground" />
              Descargas recientes
            </CardTitle>
            <Badge variant="secondary">{downloadsLast30Days} / 30 días</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total de descargas</span>
                <span className="font-medium">{totalDownloads}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Últimos 30 días</span>
                <span className="font-medium">{downloadsLast30Days}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name || user.email}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('es')}
                    </span>
                  </div>
                  <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className="text-xs">
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/productos/nuevo">
          <Card className="hover:bg-accent transition-colors cursor-pointer group">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Nuevo producto</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/productos">
          <Card className="hover:bg-accent transition-colors cursor-pointer group">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Gestionar productos</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/usuarios">
          <Card className="hover:bg-accent transition-colors cursor-pointer group">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Gestionar usuarios</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/suscripciones">
          <Card className="hover:bg-accent transition-colors cursor-pointer group">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Ver suscripciones</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
