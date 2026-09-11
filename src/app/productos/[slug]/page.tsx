'use client'

import { useParams } from 'next/navigation'
import { Download, Check, Star, FileCode, Layers, Archive } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice, formatDate } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  images: string[]
  tags: string[]
  fileKeys: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setProduct(data.product)
        }
      } catch {
        toast({ title: 'Error', description: 'No se pudo cargar el producto', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  useEffect(() => {
    if (!session || !product) return
    const checkAccess = async () => {
      try {
        const res = await fetch(`/api/download/${product.id}`, { method: 'HEAD' })
        setHasAccess(res.ok)
      } catch {
        setHasAccess(false)
      }
    }
    checkAccess()
  }, [session, product])

  if (loading) {
    return <ProductSkeleton />
  }

  if (!product) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold">Producto no encontrado</h2>
        <Button variant="outline" onClick={() => router.push('/productos')} className="mt-4">
          Volver al catálogo
        </Button>
      </div>
    )
  }

  const handlePurchase = async () => {
    if (!session) {
      router.push(`/auth/login?redirect=/productos/${slug}`)
      return
    }

    setBuying(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          mode: 'payment',
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast({ title: 'Error', description: data.error || 'No se pudo iniciar el pago', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' })
    } finally {
      setBuying(false)
    }
  }

  const handleDownload = async () => {
    if (!session) {
      router.push(`/auth/login?redirect=/productos/${slug}`)
      return
    }

    try {
      window.location.href = `/api/download/${product.id}`
    } catch {
      toast({ title: 'Error', description: 'Error al descargar', variant: 'destructive' })
    }
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Button variant="ghost" size="sm" className="h-auto p-0" onClick={() => router.push('/productos')}>
            Catálogo
          </Button>
          <span>/</span>
          <span className="font-medium">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={product.images[0] || '/placeholder-product.jpg'}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    className="relative h-20 w-20 flex-shrink-0 rounded overflow-hidden border-2 transition-colors"
                    style={{ borderColor: i === 0 ? 'hsl(var(--primary))' : 'transparent' }}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info & Purchase */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {product.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
              <p className="mt-4 text-lg text-muted-foreground">{product.description}</p>
            </div>

            <Separator />

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold">{formatPrice(product.price, product.currency)}</span>
              <span className="text-muted-foreground">Compra única</span>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Qué incluye</h3>
              <ul className="space-y-2">
                {[
                  { icon: FileCode, text: `${product.fileKeys.length} archivo(s) editable(s)` },
                  { icon: Layers, text: 'Capas organizadas y nombradas' },
                  { icon: Archive, text: 'Formatos: PSD, AI, Figma, etc.' },
                  { icon: Check, text: 'Licencia comercial incluida' },
                  { icon: Download, text: 'Descarga instantánea tras compra' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <item.icon className="h-5 w-5 text-primary" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div className="space-y-3">
              {hasAccess ? (
                <Button className="w-full" size="lg" onClick={handleDownload}>
                  <Download className="mr-2 h-5 w-5" />
                  Descargar archivo
                </Button>
              ) : (
                <Button className="w-full" size="lg" onClick={handlePurchase} disabled={buying}>
                  {buying ? 'Procesando...' : 'Comprar ahora'}
                </Button>
              )}

              <p className="text-center text-sm text-muted-foreground">
                {session
                  ? hasAccess
                    ? 'Ya tienes acceso a este archivo'
                    : 'La descarga estará disponible en tu dashboard tras la compra'
                  : 'Inicia sesión para comprar y descargar'}
              </p>
            </div>
          </div>
        </div>

        {/* Details tabs */}
        <div className="mt-16">
          <ProductDetailsTabs product={product} />
        </div>
      </div>
    </div>
  )
}

function ProductDetailsTabs({ product }: { product: Product }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Detalles del producto</h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Fecha de publicación</dt>
          <dd className="font-medium">{formatDate(product.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Última actualización</dt>
          <dd className="font-medium">{formatDate(product.updatedAt)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Archivos incluidos</dt>
          <dd className="font-medium">{product.fileKeys.length}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Licencia</dt>
          <dd className="font-medium text-green-600">Comercial ilimitada</dd>
        </div>
      </dl>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="aspect-square w-full rounded-lg bg-muted animate-pulse" />
      <div className="space-y-6">
        <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
        <div className="h-12 w-full bg-muted animate-pulse rounded" />
        <div className="h-12 w-full bg-muted animate-pulse rounded" />
      </div>
    </div>
  )
}
