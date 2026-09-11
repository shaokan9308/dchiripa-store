'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface User {
  id: string
  name: string | null
  email: string
}

interface Props {
  users: User[]
}

export default function ManualSubscriptionForm({ users }: Props) {
  const [selectedUser, setSelectedUser] = useState('')
  const [months, setMonths] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) {
      toast({ title: 'Error', description: 'Selecciona un usuario', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/subscriptions/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser, months }),
      })

      const data = await res.json()
      if (data.ok) {
        toast({ title: 'Suscripcion activada', description: `Suscripcion activa por ${months} mes(es)` })
        setSelectedUser('')
        setSearch('')
        window.location.reload()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Error de conexion', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Activar suscripcion manual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Buscar usuario</Label>
            <Input
              placeholder="Email o nombre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && filteredUsers.length > 0 && !selectedUser && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {filteredUsers.slice(0, 10).map(user => (
                  <button
                    key={user.id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-accent text-sm border-b last:border-0"
                    onClick={() => {
                      setSelectedUser(user.id)
                      setSearch(user.email)
                    }}
                  >
                    <span className="font-medium">{user.name || 'Sin nombre'}</span>
                    <span className="text-muted-foreground ml-2">{user.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Duracion</Label>
            <div className="flex gap-2 flex-wrap">
              {[1,2,3,6,12].map(m => (
                <Button
                  key={m}
                  type="button"
                  variant={months === m ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMonths(m)}
                >
                  {m} mes{m > 1 ? 'es' : ''}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{months * 30} dias de acceso</p>
          </div>

          <Button type="submit" disabled={loading || !selectedUser}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Activar suscripcion
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
