import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { purchases: true, downloads: true, subscriptions: true } },
      subscriptions: { select: { status: true } },
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">Lista de todos los usuarios registrados.</p>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{user.name || 'Sin nombre'}</CardTitle>
                <div className="flex gap-2">
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
