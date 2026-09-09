import { Suspense } from 'react'
import ProductsClient from './products-client'

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-12">Cargando productos...</div>}>
      <ProductsClient />
    </Suspense>
  )
}