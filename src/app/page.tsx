import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Download, Shield, Zap, PenTool, Monitor, Film, Check } from 'lucide-react'
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

async function getUniqueFormats() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { tags: true },
    })

    const formatSet = new Set<string>()
    for (const product of products) {
      for (const tag of product.tags) {
        if (['PSD', 'AI', 'Figma', 'Sketch', 'After Effects', 'XD', 'Canva'].includes(tag)) {
          formatSet.add(tag)
        }
      }
    }

    return Array.from(formatSet)
  } catch {
    return []
  }
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(price / 100)
}

const categoryCopy: Record<string, { emoji: string; tagline: string }> = {
  'Branding': { emoji: '🎨', tagline: 'Templates de identidad visual que hacen lucir tu marca profesional desde el dia uno' },
  'Social Media': { emoji: '📱', tagline: 'Publicaciones que detienen el scroll. Editables en Canva y Figma' },
  'UI/UX': { emoji: '🖥️', tagline: 'UI Kits y wireframes para interfaces que los usuarios aman' },
  'Mockups': { emoji: '📦', tagline: 'Presenta tus disenos como productos terminados. Realismo que impresiona' },
  'Ilustracion': { emoji: '✏️', tagline: 'Ilustraciones vectoriales listas para usar en cualquier proyecto' },
  'Tipografia': { emoji: '🔤', tagline: 'Fuentes y composiciones tipograficas que dan personalidad a tus disenos' },
  'Iconos': { emoji: '🔹', tagline: 'Sets de iconos consistentes para interfaces y presentaciones' },
  'Fondos': { emoji: '🌈', tagline: 'Texturas, gradientes y patrones que elevan cualquier diseno' },
}

const features = [
  {
    icon: Monitor,
    title: 'Photoshop & Illustrator',
    description: 'Archivos PSD y AI completamente editables. Capas organizadas, listos para personalizar.',
  },
  {
    icon: PenTool,
    title: 'Figma & Sketch',
    description: 'Componentes y estilos de diseno modernos. Compatibles con los flujos de trabajo mas actuales.',
  },
  {
    icon: Film,
    title: 'After Effects & mas',
    description: 'Plantillas de video, animaciones y motion graphics para contenido que destaca.',
  },
  {
    icon: Download,
    title: 'Descargas ilimitadas',
    description: 'Suscribete y accede a todo el catalogo sin limites. Descarga cuando quieras.',
  },
  {
    icon: Shield,
    title: 'Licencia comercial',
    description: 'Usa los archivos en proyectos personales y comerciales. Sin restricciones.',
  },
  {
    icon: Zap,
    title: 'Actualizaciones semanales',
    description: 'Nuevos archivos cada semana, sin costo extra. Tu catalogo siempre crece.',
  },
]

export default async function HomePage() {
  const [products, categories, formats] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getUniqueFormats(),
  ])

  const heroProduct = products[0]
  const gridProducts = products.slice(1, 5)

  return (
    <div className="flex flex-col">
      {/* Hero — product showcase */}
      <section aria-label="Presentacion" className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 py-16 lg:grid-cols-2 lg:gap-12 lg:py-24">
            {/* Left: copy */}
            <div className="flex flex-col justify-center">
              {formats.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {formats.map((format) => (
                    <Badge key={format} variant="secondary" className="text-xs font-medium">
                      {format}
                    </Badge>
                  ))}
                </div>
              )}
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl" style={{ textWrap: 'balance', letterSpacing: '-0.02em' }}>
                Archivos editables para creativos que van rapido
              </h1>
              <p className="mt-4 max-w-lg text-muted-foreground">
                Suscripcion mensual o compra individual. Licencia comercial incluida. Acceso inmediato a todo el catalogo.
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

            {/* Right: hero product + grid */}
            {heroProduct && (
              <div className="relative">
                {/* Main featured product */}
                <Link
                  href={`/productos/${heroProduct.slug}`}
                  className="group relative block overflow-hidden rounded-xl bg-muted"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={heroProduct.images[0] || '/placeholder-product.jpg'}
                      alt={heroProduct.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <p className="text-lg font-semibold text-white">{heroProduct.name}</p>
                    <p className="text-sm text-white/80">{formatPrice(heroProduct.price, heroProduct.currency)}</p>
                  </div>
                </Link>

                {/* Small grid below */}
                {gridProducts.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {gridProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/productos/${product.slug}`}
                        className="group relative overflow-hidden rounded-lg bg-muted transition-all hover:shadow-md"
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={product.images[0] || '/placeholder-product.jpg'}
                            alt={product.name}
                            fill
                            sizes="150px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="text-xs font-medium text-white truncate">{product.name}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features — visual list */}
      <section aria-label="Herramientas incluidas" className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-4">Compatible con las herramientas que usas</h2>
              <p className="text-muted-foreground mb-8">Archivos listos para tus proyectos. Sin conversiones, sin complicaciones.</p>
              <div className="space-y-6">
                {features.slice(0, 3).map((feature) => (
                  <div key={feature.title} className="flex gap-4 items-start">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Ventajas de la suscripcion</h3>
              <div className="space-y-4">
                {features.slice(3).map((feature) => (
                  <div key={feature.title} className="flex gap-4 items-start">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/precios">
                  <Button variant="outline" className="gap-2">
                    Ver planes y precios
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories — visual grid with emotional copy */}
      <section aria-label="Categorias populares" className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col gap-2 mb-10">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Explora por categoria</h2>
            <p className="text-muted-foreground">Encuentra exactamente lo que tu proyecto necesita</p>
          </div>
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => {
                const copy = categoryCopy[category.name] || { emoji: '📁', tagline: `${category.count} archivos disponibles` }
                return (
                  <Link
                    key={category.name}
                    href={`/productos?tag=${encodeURIComponent(category.name)}`}
                    className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50"
                  >
                    <span className="text-3xl mb-3 block">{copy.emoji}</span>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{copy.tagline}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Explorar <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Crea categorias desde el panel de administracion</p>
          )}
        </div>
      </section>

      {/* How it works — simple steps */}
      <section aria-label="Como funciona" className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Como funciona</h2>
            <p className="mt-2 text-muted-foreground">Tres pasos para empezar a crear</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '1', title: 'Explora', description: 'Busca entre miles de archivos editables por categoria, herramienta o estilo.' },
              { step: '2', title: 'Elige', description: 'Compra individualmente o suscribete para acceso ilimitado a todo el catalogo.' },
              { step: '3', title: 'Crea', description: 'Descarga los archivos y empieza a personalizar en tu herramienta favorita.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
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
