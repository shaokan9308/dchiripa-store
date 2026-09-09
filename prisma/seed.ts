import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample products
  const products = [
    {
      name: 'UI Kit Pro - Design System Completo',
      slug: 'ui-kit-pro-design-system',
      description: 'Sistema de diseño completo con 200+ componentes, tokens de diseño, modo oscuro, y documentación en Figma. Incluye React, Vue y HTML vanilla.',
      price: 4900,
      currency: 'eur',
      images: [
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      ],
      fileKeys: ['products/ui-kit-pro/complete-system.fig', 'products/ui-kit-pro/react-components.zip', 'products/ui-kit-pro/design-tokens.json'],
      tags: ['UI Kit', 'Figma', 'React', 'Design System'],
      isActive: true,
    },
    {
      name: 'Branding Kit - Identidad Visual Completa',
      slug: 'branding-kit-identidad-visual',
      description: 'Kit de branding profesional: logo principal + variaciones, paleta de colores, tipografías, patrones, papelería, guía de marca y mockups de presentación.',
      price: 3900,
      currency: 'eur',
      images: [
        'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800',
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      ],
      fileKeys: ['products/branding-kit/logo.ai', 'products/branding-kit/brand-guidelines.indd', 'products/branding-kit/stationery.psd', 'products/branding-kit/mockups.psd'],
      tags: ['Branding', 'Illustrator', 'InDesign', 'Logo'],
      isActive: true,
    },
    {
      name: 'Ilustraciones Isométricas - Pack 50+',
      slug: 'ilustraciones-isometricas-pack',
      description: 'Colección de 50+ ilustraciones isométricas editables para tech, business, finanzas, e-commerce y más. Formatos: AI, SVG, Figma, PNG.',
      price: 2900,
      currency: 'eur',
      images: [
        'https://images.unsplash.com/photo-1558655146-9f40138edfc4?w=800',
      ],
      fileKeys: ['products/iso-pack/illustrations.ai', 'products/iso-pack/illustrations.fig', 'products/iso-pack/svg-files.zip'],
      tags: ['Ilustraciones', 'Isométrico', 'SVG', 'Figma'],
      isActive: true,
    },
    {
      name: 'Plantillas Web - Landing Pages Modernas',
      slug: 'plantillas-web-landing-pages',
      description: '15 landing pages responsivas con Tailwind CSS + Alpine.js. Incluye SaaS, Portfolio, E-commerce, App, Agency, Restaurant y más. Código limpio y documentado.',
      price: 5900,
      currency: 'eur',
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800',
      ],
      fileKeys: ['products/web-templates/saas.zip', 'products/web-templates/portfolio.zip', 'products/web-templates/ecommerce.zip', 'products/web-templates/all-templates.zip'],
      tags: ['Web', 'Tailwind', 'HTML', 'Landing Page'],
      isActive: true,
    },
    {
      name: 'Motion Graphics - Transiciones y Titles Pack',
      slug: 'motion-graphics-transiciones',
      description: 'Pack profesional para After Effects: 100+ transiciones, lower thirds, titles animados, logo reveals y overlays. Fácil personalización con controles deslizantes.',
      price: 4500,
      currency: 'eur',
      images: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      ],
      fileKeys: ['products/motion-pack/transitions.aep', 'products/motion-pack/titles.aep', 'products/motion-pack/presets.ffx'],
      tags: ['Motion', 'After Effects', 'Video', 'Animación'],
      isActive: true,
    },
    {
      name: 'Mockups Premium - Dispositivos y Branding',
      slug: 'mockups-premium-dispositivos',
      description: '200+ mockups fotorrealistas: iPhone, MacBook, iPad, packaging, papelería, apparel, outdoor. Smart objects organizados, alta resolución 4K+.',
      price: 3500,
      currency: 'eur',
      images: [
        'https://images.unsplash.com/photo-1586717791821-3f9f0e0a7c47?w=800',
        'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800',
      ],
      fileKeys: ['products/mockups/phone.psd', 'products/mockups/laptop.psd', 'products/mockups/packaging.psd', 'products/mockups/all-mockups.psd'],
      tags: ['Mockups', 'Photoshop', 'Presentación', 'Smart Objects'],
      isActive: true,
    },
    {
      name: 'Icon System - 1000+ Iconos Vectoriales',
      slug: 'icon-system-1000-iconos',
      description: 'Sistema de iconos coherente: Outline, Fill, Duotone, Sharp. 1000+ iconos en 24px grid. Formatos: SVG, Figma, React, Vue, Flutter, HTML, Font.',
      price: 2400,
      currency: 'eur',
      images: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      ],
      fileKeys: ['products/icons/outline.svg', 'products/icons/fill.svg', 'products/icons/duotone.svg', 'products/icons/react-components.zip', 'products/icons/icon-font.zip'],
      tags: ['Iconos', 'SVG', 'React', 'Sistema'],
      isActive: true,
    },
    {
      name: 'Tipografías Display - Colección Exclusiva',
      slug: 'tipografias-display-coleccion',
      description: '5 familias tipográficas display exclusivas con pesos variables, ligaduras, alternativas estilísticas y soporte multilingüe. OTF, TTF, WOFF2, Variable Fonts.',
      price: 6900,
      currency: 'eur',
      images: [
        'https://images.unsplash.com/photo-1516972810927-80185027ca84?w=800',
      ],
      fileKeys: ['products/fonts/display-family.otf', 'products/fonts/variable-fonts.woff2', 'products/fonts/specimen.pdf'],
      tags: ['Fuentes', 'Tipografía', 'Variable Fonts', 'Display'],
      isActive: true,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    })
    console.log(`✅ Product: ${product.name}`)
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })