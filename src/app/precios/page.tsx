'use client'

import { Check, X, Download, Infinity, Shield, Sparkles, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Gratis',
    price: 0,
    priceId: null,
    description: 'Para probar la plataforma',
    features: [
      { name: 'Explorar catálogo completo', included: true },
      { name: 'Compras individuales', included: true },
      { name: 'Licencia comercial en compras', included: true },
      { name: 'Descargas ilimitadas', included: false },
      { name: 'Acceso a todo el catálogo', included: false },
      { name: 'Novedades semanales', included: false },
      { name: 'Soporte prioritario', included: false },
    ],
    cta: 'Crear cuenta gratis',
    variant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Mensual',
    price: 1900,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_monthly',
    description: 'Flexibilidad total, cancela cuando quieras',
    features: [
      { name: 'Explorar catálogo completo', included: true },
      { name: 'Compras individuales', included: true },
      { name: 'Licencia comercial en compras', included: true },
      { name: 'Descargas ilimitadas', included: true },
      { name: 'Acceso a todo el catálogo', included: true },
      { name: 'Novedades semanales', included: true },
      { name: 'Soporte prioritario', included: true },
    ],
    cta: 'Suscribirse mensualmente',
    variant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Anual',
    price: 19000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_yearly',
    description: 'Mejor valor - 2 meses gratis',
    features: [
      { name: 'Explorar catálogo completo', included: true },
      { name: 'Compras individuales', included: true },
      { name: 'Licencia comercial en compras', included: true },
      { name: 'Descargas ilimitadas', included: true },
      { name: 'Acceso a todo el catálogo', included: true },
      { name: 'Novedades semanales', included: true },
      { name: 'Soporte prioritario', included: true },
      { name: 'Acceso anticipado a novedades', included: true },
      { name: 'Soporte dedicado', included: true },
    ],
    cta: 'Suscribirse anualmente (ahorra 38€)',
    variant: 'default' as const,
    popular: true,
  },
]

export default function PricingPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Facturación mensual o anual · Cancela cuando quieras
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Precios simples y transparentes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tu workflow. Sin sorpresas, sin permanencia.
          </p>
        </div>

        {/* Plans */}
        <div className="grid gap-8 lg:grid-cols-3 mb-20">
          {PLANS.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular ? 'border-primary shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="px-3 py-1">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Más popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? 'Gratis' : formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && <span className="text-muted-foreground">/mes</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-success shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground line-through'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  size="lg"
                  variant={plan.variant}
                  onClick={() => plan.priceId ? window.location.href = `/auth/register?plan=${plan.priceId}` : window.location.href = '/auth/register'}
                  disabled={!plan.priceId}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-10">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            {[
              {
                q: '¿Puedo cancelar mi suscripción en cualquier momento?',
                a: 'Sí, puedes cancelar tu suscripción en cualquier momento desde tu dashboard o el portal de Stripe. Tendrás acceso hasta el final del período pagado.',
              },
              {
                q: '¿Qué pasa con mis archivos si cancelo la suscripción?',
                a: 'Los archivos que hayas comprado individualmente son tuyos para siempre. Solo pierdes el acceso a las descargas ilimitadas del catálogo de suscripción.',
              },
              {
                q: '¿Qué métodos de pago aceptan?',
                a: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express) y PayPal a través de Stripe. Todos los pagos son seguros y encriptados.',
              },
              {
                q: '¿Ofrecen facturas para empresas?',
                a: 'Sí, automáticamente generamos facturas con IVA para cada pago. Puedes descargarlas desde el portal de facturación de Stripe.',
              },
              {
                q: '¿Hay descuentos para estudiantes o equipos?',
                a: 'Actualmente no tenemos programa de descuentos, pero planeamos lanzarlo pronto. Contacta con nosotros si tienes un caso especial.',
              },
            ].map((faq, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <h3 className="font-medium flex-1">{faq.q}</h3>
                    <p className="text-muted-foreground flex-1">{faq.a}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            ¿Listo para acelerar tus proyectos?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a miles de creativos que ya usan Dchiripa Store. Empieza gratis y actualiza cuando quieras.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Crear cuenta gratis
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/productos">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Ver catálogo primero
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}