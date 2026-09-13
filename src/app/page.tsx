import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Download, Layers, Shield, Star, Zap, Users, MessageCircle, Palette, PenTool, Monitor, Film } from 'lucide-react'
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

async function getProductCount() {
  try {
    return await prisma.product.count({ where: { isActive: true } })
  } catch {
    return 0
  }
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(price / 100)
}

const categoryCopy: Record<string, { emoji: string; tagline: string }> = {
  'Branding': { emoji: '🎨', tagline: 'Templates de identidad visual que hacen lucir tu marca profesional desde el dia uno' },
  'Social Media': { emoji: '📱', tagline: 'Publicaciones que detienen el scroll. Editables en Canva y Figma' },
  'UI/UX': { emoji: '🖥️', tagline: 'UI Kits y wireframes para interfaces que los usuarios aman' },
  'Mockups': { emoji: '📦', tagline: 'Presenta tus diseños como productos terminados. Realismo que impresiona' },
  'Ilustracion': { emoji: '✏️', tagline: 'Ilustraciones vectoriales listas para usar en cualquier proyecto' },
  'Tipografia': { emoji: '🔤', tagline: 'Fuentes y composiciones tipograficas que dan personalidad a tus diseños' },
  'Iconos': { emoji: '🔹', tagline: 'Sets de iconos consistentes para interfaces y presentaciones' },
  'Fondos': { emoji: '🌈', tagline: 'Texturas, gradientes y patrones que elevan cualquier diseño' },
}

const features = [
  {
    icon: Monitor,
    title: 'Photoshop & Illustrator',
    description: 'Acceso a archivos PSD y AI completamente editables. Capas organizadas, listos para personalizar.',
  },
  {
    icon: PenTool,
    title: 'Figma & Sketch',
    description: 'Componentes y estilos de diseño modernos. Compatibles con los flujos de trabajo mas actuales.',
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

const testimonials = [
  {
    quote: 'La suscripcion me ha ahorrado cientos de horas. Los UI Kits son de una calidad increible.',
    author: 'Ana Martinez',
    role: 'UI Designer Freelance',
    platform: 'Behance',
    avatar: 'AM',
  },
  {
    quote: 'Los mockups de branding son mi recurso favorito. Presentaciones profesionales en minutos.',
    author: 'Carlos Mendez',
    role: 'Director Creativo',
    platform: 'Instagram',
    avatar: 'CM',
  },
  {
    quote: 'Mejor inversion del ano. Acceso instantaneo a archivos que uso en cada proyecto de cliente.',
    author: 'Laura Puerto',
    role: 'Disenadora Grafica',
    platform: 'Dribbble',
    avatar: 'LP',
  },
]

const communityMembers = [
  { name: 'Pedro R.', message: 'Acabo de descargar un UI Kit increible para mi nuevo proyecto' },
  { name: 'Sofia L.', message: 'Las plantillas de After Effects son perfectas para mis videos' },
  { name: 'Miguel A.', message: 'Alguien ha probado los templates de Figma? Estan genial' },
]

export default async function HomePage() {
  const [products, categories, productCount] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getProductCount(),
  ])

  const displayCount = productCount > 0 ? productCount : 2500

  return (
    <div className="flex flex-col">
      {/* Hero — big number + product showcase */}
      <section aria-label="Presentacion" className="relative border-b bg-muted/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 py-16 lg:grid-cols-2 lg:gap-12 lg:py-24">
            {/* Left: copy + big number */}
            <div className="flex flex-col justify-center">
              <div className="mb-6">
                <span className="text-6xl font-bold tracking-tight text-primary sm:text-7xl lg:text-8xl" style={{ letterSpacing: '-0.03em' }}>
                  {displayCount.toLocaleString('es-ES')}+
                </span>
                <p className="mt-1 text-lg text-muted-foreground">archivos editables premium</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {['PSD', 'AI', 'Figma', 'Sketch', 'After Effects', 'XD'].map((format) => (
                  <Badge key={format} variant="secondary" className="text-xs font-medium">
                    {format}
                  </Badge>
                ))}
              </div>
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

            {/* Right: featured products */}
            {products.length > 0 && (
              <>
                {/* Mobile: horizontal scroll strip */}
                <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden">
                  {products.slice(0, 4).map((product) => (
                    <Link
                      key={product.id}
                      href={`/productos/${product.slug}`}
                      className="group relative shrink-0 w-48 overflow-hidden rounded-lg border bg-muted transition-all hover:shadow-lg"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={product.images[0] || '/placeholder-product.jpg'}
                          alt={product.name}
                          fill
                          sizes="192px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(product.price, product.currency)}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Desktop: grid */}
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
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features — specific tools */}
      <section aria-label=" Herramientas incluidas" className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col gap-2 mb-10">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Todo lo que necesitas, en un solo lugar</h2>
            <p className="text-muted-foreground">Archivos compatibles con las herramientas que ya usas</p>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-3 rounded-lg border p-5 transition-all hover:border-primary/50 hover:bg-primary/5">
                <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/productos">
              <Button variant="outline" className="gap-2">
                Explorar todo el catalogo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories — visual grid with emotional copy */}
      <section aria-label="Categorias populares" className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col gap-2 mb-10">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Explora por categoria</h2>
            <p className="text-muted-foreground">Encuentra exactamente lo que tu proyecto necesita</p>
          </div>
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => {
                const copy = categoryCopy[category.name] || { emoji: '📁', tagline: `${category.count} archivos disponibles para tu proximo proyecto` }
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

      {/* Mid-page CTA */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-muted-foreground mb-4">Ya sabes lo que ofrecemos. Ahora mira los archivos.</p>
          <Link href="/productos">
            <Button size="lg" className="gap-2">
              Explorar catalogo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials — with avatars and platform */}
      <section aria-label="Testimonios" className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col gap-2 mb-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Lo que dicen nuestros creativos</h2>
            <p className="text-muted-foreground">Miles de disenadores confian en Dchiripa Store</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <figure key={i} className="flex flex-col gap-4 rounded-lg border p-6">
                <div className="flex gap-0.5" role="img" aria-label="5 de 5 estrellas">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-muted-foreground leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role} &middot; {testimonial.platform}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Community — Discord/Telegram style */}
      <section aria-label="Comunidad" className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 w-fit text-xs">
                <Users className="mr-1.5 h-3 w-3" />
                +500 miembros activos
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-4">
                Unete a nuestra comunidad
              </h2>
              <p className="text-muted-foreground mb-6">
                Conecta con otros disenadores, comparte tu trabajo y obtiene inspiracion diaria. Chat activo 24/7.
              </p>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-8">
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat en tiempo real
                </span>
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Recursos exclusivos
                </span>
                <span className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Feedback de diseño
                </span>
              </div>
              <Link href="https://discord.gg/tu-servidor" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2">
                  Unirse al Discord
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                127 miembros en linea
              </div>
              {communityMembers.map((member, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
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
