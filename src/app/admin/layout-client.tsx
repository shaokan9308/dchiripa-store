'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Users, CreditCard, Tag, ArrowLeft, Menu, X, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOutAndRedirect } from '@/lib/sign-out'

const navigation = [
  { name: 'Resumen', href: '/admin', icon: LayoutDashboard },
  { name: 'Productos', href: '/admin/productos', icon: Package },
  { name: 'Etiquetas', href: '/admin/etiquetas', icon: Tag },
  { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
  { name: 'Suscripciones', href: '/admin/suscripciones', icon: CreditCard },
]

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = () => {
    signOutAndRedirect()
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform border-r bg-card transition-transform duration-200 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href="/admin" className="flex items-center gap-2 text-xl font-bold">
              <Shield className="h-5 w-5 text-primary" />
              Admin Panel
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menu">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-4" aria-label="Navegacion de administracion">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start gap-3" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Volver al sitio
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive"
              size="sm"
              onClick={handleSignOut}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      <button
        className="fixed bottom-4 right-4 z-40 lg:hidden rounded-full bg-primary p-3 shadow-lg text-primary-foreground"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menu de administracion"
      >
        <Menu className="h-6 w-6" />
      </button>

      <main className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
