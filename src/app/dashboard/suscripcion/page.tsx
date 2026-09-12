'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Check, X, Loader2, Shield, Download, Infinity, ArrowUpRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatPrice } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Subscription {
  id: string
  status: string
  stripePriceId: string | null
  stripeCurrentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  isManual?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stripeData?: any
}

interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

const PLANS = {
  monthly: {
    name: 'Mensual',
    price: 1900, // 19€
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_monthly',
    features: [
      'Descargas ilimitadas',
      'Acceso a todo el catálogo',
      'Licencia comercial',
      'Soporte prioritario',
      'Nuevos archivos cada semana',
    ],
  },
  yearly: {
    name: 'Anual',
    price: 19000, // 190€ (2 meses gratis)
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_yearly',
    features: [
      'Todo lo del plan mensual',
      '2 meses gratis',
      'Acceso anticipado a novedades',
      'Soporte dedicado',
    ],
  },
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [managing, setManaging] = useState(false)
  const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/dashboard/subscription')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data.subscription)
      }
    } catch {
      // Failed to fetch subscription
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [])

  useEffect(() => {
    if (!subscription || !['active', 'trialing'].includes(subscription.status)) return

    const calculateCountdown = () => {
      const now = new Date().getTime()
      const end = new Date(subscription.stripeCurrentPeriodEnd).getTime()
      const diff = end - now

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })
        return
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        total: diff,
      })
    }

    calculateCountdown()
    const interval = setInterval(calculateCountdown, 1000)
    return () => clearInterval(interval)
  }, [subscription])

  const handleManageSubscription = async () => {
    setManaging(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo abrir el portal', variant: 'destructive' })
    } finally {
      setManaging(false)
    }
  }

  const handleSubscribe = async (priceId: string) => {
    try {
      const plan = priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY ? 'yearly' : 'monthly'
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, mode: 'subscription' }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo iniciar el checkout', variant: 'destructive' })
    }
  }

  if (loading) {
    return <SubscriptionSkeleton />
  }

  const isActive = subscription && ['active', 'trialing'].includes(subscription.status)
  const isPastDue = subscription?.status === 'past_due'
  const willCancel = subscription?.cancelAtPeriodEnd

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi suscripción</h1>
        <p className="text-muted-foreground">Gestiona tu plan y facturación</p>
      </div>

      {/* Current Plan */}
      <Card className={isActive ? 'border-l-4 border-l-success' : isPastDue ? 'border-l-4 border-l-warning' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {isActive ? 'Suscripción activa' : isPastDue ? 'Pago pendiente' : 'Sin suscripción activa'}
              </CardTitle>
              <p className="text-muted-foreground">
                {isActive && subscription && (
                  <>
                    Renueva el {formatDate(subscription.stripeCurrentPeriodEnd)}
                    {willCancel && ' · Se cancelará al finalizar el período'}
                  </>
                )}
                {isPastDue && 'Por favor actualiza tu método de pago'}
              </p>
            </div>
            <Badge variant={isActive ? 'success' : isPastDue ? 'destructive' : 'secondary'}>
              {isActive ? 'Activa' : isPastDue ? 'Pendiente' : 'Inactiva'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isActive && subscription && (
            <div className="space-y-4">
              {/* Countdown Timer */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted border">
                <Clock className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Tiempo restante</p>
                  <div className="flex gap-4 mt-1">
                    {[
                      { value: countdown.days, label: 'dias' },
                      { value: countdown.hours, label: 'horas' },
                      { value: countdown.minutes, label: 'min' },
                      { value: countdown.seconds, label: 'seg' },
                    ].map(({ value, label }) => (
                      <div key={label} className="text-center">
                        <span className="text-2xl font-bold tabular-nums">{String(value).padStart(2, '0')}</span>
                        <span className="block text-xs text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {subscription.isManual && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Manual
                  </Badge>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Plan actual</p>
                  <p className="font-semibold">
                    {subscription.isManual ? 'Manual' : subscription.stripePriceId?.includes('yearly') ? 'Anual' : 'Mensual'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Próximo pago</p>
                  <p className="font-semibold">{formatDate(subscription.stripeCurrentPeriodEnd)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Metodo de pago</p>
                  <p className="font-semibold">
                    {subscription.isManual ? 'Activo manualmente' : subscription.stripeData?.default_payment_method?.card?.brand || 'Tarjeta'}
                    {' '}
                    {!subscription.isManual && subscription.stripeData?.default_payment_method?.card?.last4 && (
                      <span>---- {subscription.stripeData.default_payment_method.card.last4}</span>
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-4">
                {!subscription.isManual && (
                  <Button variant="outline" onClick={handleManageSubscription} disabled={managing}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Gestionar en Stripe
                  </Button>
                )}
                {willCancel && (
                  <Button variant="secondary" onClick={handleManageSubscription} disabled={managing}>
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Reactivar suscripción
                  </Button>
                )}
              </div>
            </div>
          )}

          {!isActive && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-center py-4">
                No tienes una suscripción activa. Elige un plan para acceder a descargas ilimitadas.
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                {Object.entries(PLANS).map(([key, plan]) => (
                  <Card key={key} className="relative">
                    {key === 'yearly' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge variant="secondary" className="px-3 py-1">
                          <span className="mr-1">🎁</span>
                          2 meses gratis
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                        <span className="text-muted-foreground">/mes</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="h-5 w-5 text-success shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => handleSubscribe(plan.priceId)}
                        variant={key === 'yearly' ? 'default' : 'outline'}
                      >
                        {key === 'yearly' ? 'Suscribirse (Mejor valor)' : 'Suscribirse mensualmente'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Beneficios de la suscripción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Benefit icon={Download} title="Descargas ilimitadas" desc="Sin límites diarios ni mensuales" />
            <Benefit icon={Infinity} title="Catálogo completo" desc="Acceso a todos los archivos actuales y futuros" />
            <Benefit icon={Shield} title="Licencia comercial" desc="Usa en proyectos de clientes sin restricciones" />
            <Benefit icon={ArrowUpRight} title="Novedades semanales" desc="Nuevos archivos añadidos cada semana" />
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de facturación</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            El historial de facturas está disponible en el <Button variant="link" className="p-0" onClick={handleManageSubscription}>portal de Stripe</Button>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function Benefit({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}

function SubscriptionSkeleton() {
  return (
    <div className="space-y-8 max-w-4xl animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}