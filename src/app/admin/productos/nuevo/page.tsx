import ProductForm from '../[id]/product-form'

export default function NewProductPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Producto</h1>
        <p className="text-muted-foreground">Agrega un nuevo producto al catálogo.</p>
      </div>
      <ProductForm />
    </div>
  )
}
