'use client'

import { useEffect, useState } from 'react'
import { Download, RefreshCw, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface Download {
  id: string
  createdAt: string
  product: {
    id: string
    name: string
    slug: string
    images: string[]
  }
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<Download[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  const fetchDownloads = async (page = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/downloads?page=${page}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setDownloads(data.downloads)
        setPagination(data.pagination)
      }
    } catch {
      // Failed to fetch downloads
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDownloads()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis descargas</h1>
        <p className="text-muted-foreground">Historial de todas tus descargas realizadas</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <DownloadSkeleton key={i} />
          ))}
        </div>
      ) : downloads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Download className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">No hay descargas aún</h3>
            <p className="text-muted-foreground mb-6">Tus descargas aparecerán aquí</p>
            <Link href="/dashboard/compras">
              <Button>Ver mis compras</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {downloads.map((download) => (
              <Card key={download.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Link href={`/productos/${download.product.slug}`} className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {download.product.images[0] ? (
                          <img src={download.product.images[0]} alt={download.product.name} className="h-full w-full object-cover" />
                        ) : (
                          <Download className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{download.product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Descargado el {formatDate(download.createdAt)}
                        </p>
                      </div>
                    </Link>

                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex gap-2">
                        <Link href={`/productos/${download.product.slug}`}>
                          <Button variant="outline" size="sm">
                            Ver producto
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/api/download/${download.product.id}`}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Descargar de nuevo
                        </Button>
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
                onClick={() => fetchDownloads(pagination.page - 1)}
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
                onClick={() => fetchDownloads(pagination.page + 1)}
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

function DownloadSkeleton() {
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
            <div className="h-8 w-24 bg-muted rounded" />
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}