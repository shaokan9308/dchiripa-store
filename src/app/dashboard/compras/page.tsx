'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Download, Package, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface Purchase {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: string
  product: {
    id: string
    name: string
    slug: string
    images: string[]
  }
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  const fetchPurchases = async (page = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/purchases?page=${page}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setPurchases(data.purchases)
        setPagination(data.pagination)
      }
    } catch {
      // Failed to fetch purchases
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPurchases()
  }, [])

  const statusVariants: Record<string, 'default' | 'success' | 'destructive' | 'secondary'> = {
    completed: 'success',
    pending: 'secondary',
    failed: 'destructive',
    refunded: 'default',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis compras</h1>
        <p className="text-muted-foreground">Historial de todas tus compras realizadas</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <PurchaseSkeleton key={i} />
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" aria-hidden="true" />
            <h3 className="text-lg font-medium mb-2">No tienes compras aún</h3>
            <p className="text-muted-foreground mb-6">Cuando compres un archivo, aparecerá aquí</p>
            <Link href="/productos">
              <Button>Explorar catálogo</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Link href={`/productos/${purchase.product.slug}`} className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {purchase.product.images[0] ? (
                          <Image src={purchase.product.images[0]} alt={purchase.product.name} width={48} height={48} className="h-12 w-12 rounded object-cover" />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{purchase.product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(purchase.createdAt)} · {formatPrice(purchase.amount, purchase.currency)}
                        </p>
                      </div>
                    </Link>

                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <Badge variant={statusVariants[purchase.status] || 'default'}>
                        {purchase.status === 'completed' && 'Completada'}
                        {purchase.status === 'pending' && 'Pendiente'}
                        {purchase.status === 'failed' && 'Fallida'}
                        {purchase.status === 'refunded' && 'Reembolsada'}
                      </Badge>

                      <div className="flex gap-2">
                        <Link href={`/productos/${purchase.product.slug}`}>
                          <Button variant="outline" size="sm">
                            Ver producto
                          </Button>
                        </Link>
                        {purchase.status === 'completed' && (
                          <Button variant="outline" size="sm" onClick={() => window.location.href = `/api/download/${purchase.product.id}`}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPurchases(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages} ({pagination.total} total)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPurchases(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Siguiente
                <RefreshCw className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PurchaseSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="h-16 w-16 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-3 w-32 bg-muted rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-24 bg-muted rounded" />
            <div className="h-8 w-24 bg-muted rounded" />
            <div className="h-8 w-24 bg-muted rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}