'use client'

import Link from 'next/link'
import { ShoppingBag, Download, Crown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    description: string
    price: number
    currency: string
    images: string[]
    tags: string[]
    accessType: string
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [buying, setBuying] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    if (!session || product.accessType !== 'subscription') return
    fetch('/api/dashboard/subscription')
      .then(r => r.json())
      .then(data => {
        const sub = data.subscription
        setHasSubscription(sub && ['active', 'trialing'].includes(sub.status))
      })
      .catch(() => {})
  }, [session, product.accessType])

  const handlePurchase = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      router.push(`/auth/login?redirect=/productos/${product.slug}`)
      return
    }

    if (product.accessType === 'subscription') {
      if (hasSubscription) {
        window.location.href = `/api/download/${product.id}`
      } else {
        router.push('/dashboard/suscripcion')
      }
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
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
    } finally {
      setBuying(false)
    }
  }

  const imageUrl = product.images[0] || '/placeholder-product.jpg'
  const isSubscription = product.accessType === 'subscription'

  return (
    <Card className="flex flex-col h-full group">
      <Link href={`/productos/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.jpg' }}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {isSubscription && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-primary text-primary-foreground">
                <Crown className="h-3 w-3 mr-1" />
                Suscripcion
              </Badge>
            </div>
          )}
          {product.tags.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Link>

      <CardContent className="flex-1 flex flex-col p-4">
        <Link href={`/productos/${product.slug}`}>
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="mt-3">
          {isSubscription ? (
            <span className="text-sm font-medium text-primary">Acceso con suscripcion</span>
          ) : (
            <span className="text-lg font-bold">{formatPrice(product.price, product.currency)}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handlePurchase}
          disabled={buying}
          size="sm"
          variant={isSubscription && hasSubscription ? 'default' : isSubscription ? 'outline' : 'default'}
        >
          {buying ? (
            <>
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Procesando...
            </>
          ) : isSubscription ? (
            hasSubscription ? (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </>
            ) : (
              <>
                <Crown className="mr-2 h-4 w-4" />
                Suscribirse
              </>
            )
          ) : (
            <>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Comprar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}