'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { authClient } from '@/lib/auth-client'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
  _count: { purchases: number; downloads: number; subscriptions: number }
  subscriptions: { status: string }[]
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
        toast({ title: 'Rol actualizado', description: `Ahora es ${newRole}` })
      } else {
        toast({ title: 'Error', description: 'No se pudo cambiar el rol', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' })
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Cargando usuarios...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">Gestiona los usuarios y roles.</p>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{user.name || 'Sin nombre'}</CardTitle>
                <div className="flex gap-2 items-center">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                  {user.subscriptions[0] && (
                    <Badge variant={
                      user.subscriptions[0].status === 'active' ? 'default' : 'outline'
                    }>
                      {user.subscriptions[0].status}
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleRole(user.id, user.role)}
                  >
                    {user.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Email: {user.email}</p>
                <p>Registro: {new Date(user.createdAt).toLocaleDateString('es')}</p>
                <p>Compras: {user._count.purchases} · Descargas: {user._count.downloads}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
