'use client'

import { useState } from 'react'
import { User, Mail, Lock, Bell, Trash2, Loader2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { authClient } from '@/lib/auth-client'
import { toast } from '@/hooks/use-toast'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function SettingsPage() {
  const { data: session } = authClient.useSession()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)

  const [profile, setProfile] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  })

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const [notifications, setNotifications] = useState(() => {
    if (typeof window === 'undefined') return { emailMarketing: true, emailUpdates: true, emailSecurity: true }
    try {
      const saved = localStorage.getItem('dchiripa-notifications')
      return saved ? JSON.parse(saved) : { emailMarketing: true, emailUpdates: true, emailSecurity: true }
    } catch {
      return { emailMarketing: true, emailUpdates: true, emailSecurity: true }
    }
  })

  const handleNotificationsChange = (newNotifications: typeof notifications) => {
    setNotifications(newNotifications)
    localStorage.setItem('dchiripa-notifications', JSON.stringify(newNotifications))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      toast({ title: 'Perfil actualizado', description: 'Los cambios se han guardado correctamente' })
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar el perfil', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.new !== password.confirm) {
      toast({ title: 'Error', description: 'Las contraseñas no coinciden', variant: 'destructive' })
      return
    }
    if (password.new.length < 8) {
      toast({ title: 'Error', description: 'La contraseña debe tener al menos 8 caracteres', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: password.current, newPassword: password.new }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      toast({ title: 'Contraseña actualizada', description: 'Tu contraseña ha sido cambiada correctamente' })
      setPassword({ current: '', new: '', confirm: '' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'No se pudo cambiar la contraseña', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const [deletePassword, setDeletePassword] = useState('')

  const handleDeleteAccount = async () => {
    if (!confirm('Estas seguro? Esta accion no se puede deshacer.')) return
    if (!deletePassword) {
      toast({ title: 'Error', description: 'Ingresa tu contrasena para confirmar', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al eliminar')
      }
      toast({ title: 'Cuenta eliminada', description: 'Tu cuenta ha sido eliminada permanentemente' })
      setTimeout(() => window.location.replace('/auth/login'), 1000)
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'No se pudo eliminar la cuenta', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tu cuenta y preferencias</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="password">Seguridad</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="danger">Eliminar cuenta</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del perfil</CardTitle>
              <CardDescription>Actualiza tu nombre y email visible</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                    <AvatarFallback className="text-2xl">
                      {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{session?.user?.name || 'Usuario'}</p>
                    <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="tu@email.com"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Para cambiar tu email, contacta con soporte
                  </p>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Guardar cambios'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar contraseña</CardTitle>
              <CardDescription>Actualiza tu contraseña para mayor seguridad</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña actual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={password.current}
                    onChange={(e) => setPassword({ ...password, current: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={password.new}
                    onChange={(e) => setPassword({ ...password, new: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={password.confirm}
                    onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Actualizar contraseña'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Autenticación de dos factores (2FA)
              </CardTitle>
              <CardDescription>Añade una capa extra de seguridad a tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                La 2FA estará disponible próximamente. Mientras tanto, usa una contraseña segura y única.
              </p>
              <Button variant="outline" disabled>
                Configurar 2FA
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferencias de email
              </CardTitle>
              <CardDescription>Controla qué emails recibes de Dchiripa Store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-xs text-muted-foreground">
                Estas preferencias se guardan localmente en tu navegador.
              </p>
              <NotificationToggle
                label="Actualizaciones de productos"
                description="Nuevos archivos, categorias y caracteristicas"
                checked={notifications.emailUpdates}
                onChange={(checked) => handleNotificationsChange({ ...notifications, emailUpdates: checked })}
              />
              <NotificationToggle
                label="Ofertas y promociones"
                description="Descuentos, ofertas especiales y lanzamientos"
                checked={notifications.emailMarketing}
                onChange={(checked) => handleNotificationsChange({ ...notifications, emailMarketing: checked })}
              />
              <NotificationToggle
                label="Seguridad y cuenta"
                description="Alertas de inicio de sesión, cambios de contraseña, facturación"
                checked={notifications.emailSecurity}
                onChange={(checked) => setNotifications({ ...notifications, emailSecurity: checked })}
                disabled
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="mt-6">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Eliminar cuenta
              </CardTitle>
              <CardDescription>
                Eliminar tu cuenta permanentemente. Esta acción no se puede deshacer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>Al eliminar tu cuenta:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Se eliminarán todos tus datos personales</li>
                  <li>Perderás acceso a tus compras y descargas</li>
                  <li>Se cancelará tu suscripción activa (si la tienes)</li>
                  <li>No podrás recuperar tu cuenta</li>
                </ul>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="deletePassword">Contrasena actual (requerida)</Label>
                <Input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Tu contrasena actual"
                />
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" required />
                  <span>Entiendo que esta accion es irreversible</span>
                </Label>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Eliminar mi cuenta'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-0">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          checked ? 'bg-primary' : 'bg-muted'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}