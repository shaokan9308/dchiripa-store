'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Package, Download, CreditCard, Clock, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

interface Stats {
  purchases: number
  downloads: number
  subscription: 'active' | 'inactive' | 'past_due' | null
  spent: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    purchases: 0,
    downloads: 0,
    subscription: null,
    spent: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentPurchases, setRecentPurchases] = useState<Array<{ id: string; product: { images: string[]; name: string; slug: string }; amount: number; currency: string; createdAt: string }>>([])
  const [recentDownloads, setRecentDownloads] = useState<Array<{ id: string; product: { name: string; slug: string }; createdAt: string }>>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, purchasesRes, downloadsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/purchases?limit=5'),
        fetch('/api/dashboard/downloads?limit=5'),
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (purchasesRes.ok) setRecentPurchases((await purchasesRes.json()).purchases)
      if (downloadsRes.ok) setRecentDownloads((await downloadsRes.json()).downloads)
    } catch {
      // Failed to fetch dashboard data
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de tu cuenta y actividad reciente</p>
        </div>
        <Link href="/productos">
          <Button>
            Explorar catálogo
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Compras totales"
          value={stats.purchases}
          icon={Package}
          href="/dashboard/compras"
        />
        <StatCard
          title="Descargas"
          value={stats.downloads}
          icon={Download}
          href="/dashboard/descargas"
        />
        <StatCard
          title="Invertido"
          value={formatPrice(stats.spent)}
          icon={CreditCard}
          href="/dashboard/compras"
        />
        <StatCard
          title="Suscripción"
          value={
            stats.subscription === 'active' ? 'Activa' :
            stats.subscription === 'past_due' ? 'Pendiente' : 'Inactiva'
          }
          icon={CreditCard}
          variant={stats.subscription === 'active' ? 'success' : stats.subscription === 'past_due' ? 'warning' : 'default'}
          href="/dashboard/suscripcion"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Últimas compras</CardTitle>
            <Link href="/dashboard/compras" className="text-sm text-primary hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent>
            {recentPurchases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4 opacity-50" aria-hidden="true" />
                <p>No hay compras aún</p>
                <Link href="/productos" className="text-primary hover:underline mt-2 inline-block">
                  Explorar productos
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {purchase.product.images[0] ? (
                          <Image src={purchase.product.images[0]} alt={purchase.product.name} width={48} height={48} className="h-12 w-12 rounded object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{purchase.product.name}</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(purchase.amount)} · {new Date(purchase.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Link href={`/productos/${purchase.product.slug}`} className="text-sm text-primary hover:underline">
                      Ver
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Descargas recientes</CardTitle>
            <Link href="/dashboard/descargas" className="text-sm text-primary hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent>
            {recentDownloads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Download className="mx-auto h-12 w-12 mb-4 opacity-50" aria-hidden="true" />
                <p>No hay descargas aún</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentDownloads.map((download) => (
                  <div key={download.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      <Download className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{download.product.name}</p>
                        <p className="text-sm text-muted-foreground">{new Date(download.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Link href={`/productos/${download.product.slug}`} className="text-sm text-primary hover:underline">
                      Ver
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  variant = 'default',
}: {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  href: string
  variant?: 'default' | 'success' | 'warning'
}) {
  const iconColors = {
    default: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-warning',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${iconColors[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <Link href={href} className="text-sm text-primary hover:underline mt-2 inline-block">
          Ver detalles →
        </Link>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="mt-4 h-8 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-6 w-48 bg-muted rounded mb-4" />
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-12 bg-muted rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}