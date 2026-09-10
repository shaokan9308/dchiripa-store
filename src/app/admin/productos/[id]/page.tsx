import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductForm from './product-form'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) notFound()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Editar Producto</h1>
        <p className="text-muted-foreground">Modifica los datos del producto.</p>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
