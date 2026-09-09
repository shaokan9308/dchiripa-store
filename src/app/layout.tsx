import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Dchiripa Store - Archivos editables para creativos',
  description: 'Marketplace de archivos editables (PSD, AI, Figma, plantillas) para diseñadores y creativos. Suscripción mensual o compra individual.',
  keywords: ['archivos editables', 'PSD', 'AI', 'Figma', 'plantillas', 'diseño', 'creativos', 'marketplace'],
  authors: [{ name: 'Dchiripa Store' }],
  openGraph: {
    title: 'Dchiripa Store - Archivos editables para creativos',
    description: 'Marketplace de archivos editables para diseñadores',
    type: 'website',
    locale: 'es_ES',
    siteName: 'Dchiripa Store',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-8 px-4">
            <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
              <p>© 2024 Dchiripa Store. Todos los derechos reservados.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}