import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  try {
    await requireAdmin()
  } catch {
    redirect('/auth/login')
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { purchases: true, downloads: true } } },
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Gestiona el catálogo de productos.</p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <Badge variant={product.isActive ? 'default' : 'secondary'}>
                  {product.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Precio: €{(product.price / 100).toFixed(2)}</p>
                <p>Archivos: {product.fileKeys.length}</p>
                <p>Compras: {product._count.purchases} · Descargas: {product._count.downloads}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/productos/${product.id}`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                </Link>
                <Link href={`/admin/productos/${product.id}/archivos`}>
                  <Button variant="outline" size="sm">
                    Archivos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
