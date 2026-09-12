'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff, Chrome, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { authClient } from '@/lib/auth-client'
import { toast } from '@/hooks/use-toast'

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get('redirect') || '/dashboard'
  const redirect = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/dashboard'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const passwordChecks = useMemo(() => ({
    length: password.length >= 8,
    match: password.length > 0 && password === confirmPassword,
  }), [password, confirmPassword])

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const fieldError = (field: string) => {
    if (!touched[field]) return null
    switch (field) {
      case 'email': return email.length > 0 && !emailValid ? 'Ingresa un email valido' : null
      case 'password': return password.length > 0 && password.length < 8 ? 'Minimo 8 caracteres' : null
      case 'confirmPassword': return confirmPassword.length > 0 && !passwordChecks.match ? 'Las contrasenas no coinciden' : null
      default: return null
    }
  }

  const handleBlur = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Las contraseñas no coinciden', variant: 'destructive' })
      return
    }

    if (password.length < 8) {
      toast({ title: 'Error', description: 'La contraseña debe tener al menos 8 caracteres', variant: 'destructive' })
      return
    }

    setLoading(true)

    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: redirect,
      })

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: '¡Cuenta creada!', description: 'Revisa tu email para verificar tu cuenta' })
        router.push('/auth/login')
      }
    } catch {
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'github' | 'google') => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: redirect,
      })
    } catch {
      toast({ title: 'Error', description: `Error con ${provider}`, variant: 'destructive' })
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>Únete a Dchiripa Store y accede a miles de recursos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button variant="outline" onClick={() => handleOAuth('google')} className="gap-2">
              <Chrome className="h-4 w-4" />
              Continuar con Google
            </Button>
          </div>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              o con email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`pl-10 ${fieldError('email') ? 'border-destructive' : ''}`}
                  required
                  autoComplete="email"
                />
              </div>
              {fieldError('email') && <p className="text-xs text-destructive">{fieldError('email')}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`pl-10 pr-10 ${fieldError('password') ? 'border-destructive' : ''}`}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex gap-2 text-xs">
                  <span className={`flex items-center gap-1 ${passwordChecks.length ? 'text-success' : 'text-muted-foreground'}`}>
                    {passwordChecks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    8+ caracteres
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repite tu contrasena"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`pl-10 ${fieldError('confirmPassword') ? 'border-destructive' : ''}`}
                  required
                  autoComplete="new-password"
                />
              </div>
              {confirmPassword.length > 0 && (
                <span className={`flex items-center gap-1 text-xs ${passwordChecks.match ? 'text-success' : 'text-destructive'}`}>
                  {passwordChecks.match ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {passwordChecks.match ? 'Las contrasenas coinciden' : 'Las contrasenas no coinciden'}
                </span>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" required className="mt-1 rounded border-input" />
              <Label htmlFor="terms" className="text-sm text-muted-foreground">
                Acepto los <Link href="/terminos" className="text-primary hover:underline">términos</Link> y la <Link href="/privacidad" className="text-primary hover:underline">política de privacidad</Link>
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}