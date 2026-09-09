import Link from 'next/link'
import { ArrowRight, Download, Layers, Shield, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: Layers,
    title: 'Archivos editables profesionales',
    description: 'PSD, AI, Figma, Sketch, plantillas de After Effects y más. Listos para usar y personalizar.',
  },
  {
    icon: Download,
    title: 'Descargas ilimitadas',
    description: 'Con tu suscripción accede a todo el catálogo sin límites. Descarga lo que necesites, cuando lo necesites.',
  },
  {
    icon: Zap,
    title: 'Acceso instantáneo',
    description: 'Compra individual o suscríbete. Los archivos están disponibles inmediatamente tras el pago.',
  },
  {
    icon: Shield,
    title: 'Licencia comercial incluida',
    description: 'Usa los archivos en proyectos personales y comerciales sin preocupaciones legales.',
  },
]

const categories = [
  { name: 'UI Kits', count: 24, icon: LayoutDashboard },
  { name: 'Branding', count: 18, icon: PenTool },
  { name: 'Ilustraciones', count: 32, icon: Image },
  { name: 'Plantillas Web', count: 15, icon: Globe },
  { name: 'Motion Graphics', count: 12, icon: Film },
  { name: 'Mockups', count: 28, icon: Box },
]

import { LayoutDashboard, PenTool, Image, Globe, Film, Box } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 text-sm">
              Nuevo: Suscripción mensual con descargas ilimitadas
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Archivos editables para <span className="text-primary">creativos</span> que quieren ir rápido
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Accede a miles de PSD, AI, Figma, plantillas y mockups profesionales.
              Suscripción mensual o compra individual. Licencia comercial incluida.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/productos">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Explorar catálogo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/precios">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Ver precios
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold tracking-tight">500+</div>
              <div className="text-sm text-muted-foreground">Archivos disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold tracking-tight">50+</div>
              <div className="text-sm text-muted-foreground">Categorías</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold tracking-tight">2.000+</div>
              <div className="text-sm text-muted-foreground">Creativos suscritos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold tracking-tight">98%</div>
              <div className="text-sm text-muted-foreground">Satisfacción</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo que necesitas para tus proyectos
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Herramientas profesionales que te ahorran horas de trabajo
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="h-full">
                <CardHeader>
                  <feature.icon className="mb-4 h-10 w-10 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Categorías populares
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Encuentra exactamente lo que buscas
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/productos?category=${category.name.toLowerCase()}`}
                className="group flex items-center gap-4 rounded-lg border p-6 transition-all hover:border-primary hover:bg-background hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <category.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} archivos</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/productos">
              <Button variant="outline" size="lg">
                Ver todas las categorías
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Confían en nosotros
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Lo que dicen nuestros creativos
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: 'La suscripción me ha ahorrado cientos de horas. Los UI Kits son de una calidad increíble.',
                author: 'María González',
                role: 'UI Designer freelance',
              },
              {
                quote: 'Los mockups de branding son mi recurso favorito. Presentaciones profesionales en minutos.',
                author: 'Carlos Ruiz',
                role: 'Director creativo',
              },
              {
                quote: 'Mejor inversión del año. Acceso instantáneo a archivos que uso en cada proyecto de cliente.',
                author: 'Ana Martín',
                role: 'Diseñadora gráfica',
              },
            ].map((testimonial, i) => (
              <Card key={i} className="h-full">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="mb-6 text-muted-foreground">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            ¿Listo para acelerar tu workflow?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Únete a miles de creativos que ya usan Dchiripa Store. Cancela cuando quieras.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto gap-2" variant="secondary">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/productos">
              <Button size="lg" className="w-full sm:w-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary/80" variant="outline">
                Ver catálogo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}