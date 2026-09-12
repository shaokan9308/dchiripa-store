'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, CreditCard, Download, Settings, LogOut, ChevronLeft, ChevronRight, Menu, X, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authClient } from '@/lib/auth-client'
import { useUserRole } from '@/hooks/use-user-role'
import { signOutAndRedirect } from '@/lib/sign-out'

const navigation = [
  { name: 'Resumen', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mis compras', href: '/dashboard/compras', icon: Package },
  { name: 'Descargas', href: '/dashboard/descargas', icon: Download },
  { name: 'Suscripción', href: '/dashboard/suscripcion', icon: CreditCard },
  { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
]

const adminNavigation = [
  { name: 'Panel Admin', href: '/admin', icon: Shield },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = authClient.useSession()
  const { isAdmin } = useUserRole()

  const handleSignOut = () => {
    signOutAndRedirect()
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform border-r bg-card transition-transform duration-200 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b lg:justify-center">
            <Link href="/dashboard" className="text-xl font-bold">
              Dchiripa Store
            </Link>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-4" aria-label="Main navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px]',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              )
            })}
            {isAdmin && (
              <>
                <div className="my-2 border-t" />
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px]',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  )
                })}
              </>
            )}
          </nav>

          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3" size="sm">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                    <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="text-left flex-1 truncate">
                    <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      <button
        className="fixed bottom-4 right-4 z-40 lg:hidden rounded-full bg-primary p-3 shadow-lg text-primary-foreground"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
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