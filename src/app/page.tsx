import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Download, Layers, Shield, Star, Zap, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'

async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true, name: true, slug: true, price: true, currency: true,
        images: true, tags: true, accessType: true,
      },
    })
    return products
  } catch {
    return []
  }
}

async function getCategories() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { tags: true },
    })

    const tagMap = new Map<string, number>()
    for (const product of products) {
      for (const tag of product.tags) {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
      }
    }

    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  } catch {
    return []
  }
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(price / 100)
}

const features = [
  {
    icon: Layers,
    title: 'Archivos editables',
    description: 'PSD, AI, Figma, Sketch y After Effects. Listos para personalizar.',
  },
  {
    icon: Download,
    title: 'Descargas ilimitadas',
    description: 'Suscribete y accede a todo el catalogo sin limites.',
  },
  {
    icon: Zap,
    title: 'Acceso instantaneo',
    description: 'Compra o suscribete. Los archivos estan disponibles de inmediato.',
  },
  {
    icon: Shield,
    title: 'Licencia comercial',
    description: 'Usa los archivos en proyectos personales y comerciales.',
  },
]

export default async function HomePage() {
  const [products, categories] = await Promise.all([getFeaturedProducts(), getCategories()])

  return (
    <div className="flex flex-col">
      {/* Hero — product showcase */}
      <section aria-label="Presentacion" className="relative border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 py-16 lg:grid-cols-2 lg:gap-12 lg:py-24">
            {/* Left: copy */}
            <div className="flex flex-col justify-center">
              <Badge variant="secondary" className="mb-4 w-fit text-xs">
                <Sparkles className="mr-1.5 h-3 w-3" />
                Suscripcion mensual disponible
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl" style={{ textWrap: 'balance', letterSpacing: '-0.02em' }}>
                Archivos editables para creativos que van rapido
              </h1>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                PSD, AI, Figma, mockups y mas. Suscripcion mensual o compra individual. Licencia comercial incluida.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/productos">
                  <Button size="lg" className="gap-2">
                    Explorar catalogo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/precios">
                  <Button size="lg" variant="ghost">
                    Ver precios
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Download className="h-4 w-4" />
                  Descargas ilimitadas
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4" />
                  Licencia comercial
                </span>
              </div>
            </div>

            {/* Right: featured products */}
            {products.length > 0 && (
              <div className="relative hidden lg:block">
                <div className="grid grid-cols-2 gap-3">
                  {products.slice(0, 4).map((product, i) => (
                    <Link
                      key={product.id}
                      href={`/productos/${product.slug}`}
                      className={`group relative overflow-hidden rounded-lg border bg-muted transition-all hover:shadow-lg ${
                        i === 0 ? 'row-span-2 aspect-[3/4]' : 'aspect-square'
                      }`}
                    >
                      <Image
                        src={product.images[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        fill
                        sizes={i === 0 ? '(max-width: 1024px) 50vw, 33vw' : '(max-width: 1024px) 25vw, 17vw'}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-sm font-medium text-white truncate">{product.name}</p>
                        <p className="text-xs text-white/80">{formatPrice(product.price, product.currency)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features — horizontal layout instead of cards */}
      <section aria-label="Caracteristicas" className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-px lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-2 p-6 lg:p-8">
                <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories — visual grid with hover */}
      <section aria-label="Categorias populares" className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col gap-2 mb-10">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Categorias populares</h2>
            <p className="text-muted-foreground">Encuentra exactamente lo que buscas</p>
          </div>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/productos?tag=${encodeURIComponent(category.name)}`}
                  className="group flex flex-col items-center gap-2 rounded-lg border p-5 text-center transition-all hover:border-primary hover:bg-primary/5"
                >
                  <span className="text-sm font-semibold group-hover:text-primary transition-colors">{category.name}</span>
                  <span className="text-xs text-muted-foreground">{category.count} {category.count === 1 ? 'producto' : 'productos'}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Crea categorias desde el panel de administracion</p>
          )}
          <div className="mt-8 text-center">
            <Link href="/productos" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Ver todo el catalogo <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials — editorial style instead of cards */}
      <section aria-label="Testimonios" className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col gap-2 mb-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Confian en nosotros</h2>
            <p className="text-muted-foreground">Lo que dicen nuestros creativos</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                quote: 'La suscripcion me ha ahorrado cientos de horas. Los UI Kits son de una calidad increible.',
                author: 'Maria Gonzalez',
                role: 'UI Designer freelance',
              },
              {
                quote: 'Los mockups de branding son mi recurso favorito. Presentaciones profesionales en minutos.',
                author: 'Carlos Ruiz',
                role: 'Director creativo',
              },
              {
                quote: 'Mejor inversion del ano. Acceso instantaneo a archivos que uso en cada proyecto de cliente.',
                author: 'Ana Martin',
                role: 'Disenadora grafica',
              },
            ].map((testimonial, i) => (
              <figure key={i} className="flex flex-col gap-4">
                <div className="flex gap-0.5" role="img" aria-label="5 de 5 estrellas">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-muted-foreground leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption>
                  <p className="text-sm font-medium">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section aria-label="Llamada a la accion" className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ letterSpacing: '-0.02em' }}>
            Listo para acelerar tu workflow?
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Unete a miles de creativos que ya usan Dchiripa Store. Cancela cuando quieras.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto gap-2" variant="secondary">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/productos">
              <Button size="lg" className="w-full sm:w-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary/80" variant="outline">
                Ver catalogo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
