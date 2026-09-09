'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProductCard } from '@/components/product-card'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const categories = [
  'UI Kits',
  'Branding',
  'Ilustraciones',
  'Plantillas Web',
  'Motion Graphics',
  'Mockups',
  'Iconos',
  'Fuentes',
]

export default function ProductsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1'))

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (sort !== 'newest') params.set('sort', sort)
    router.push(`/productos?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setSort('newest')
    router.push('/productos')
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Catálogo de archivos</h1>
            <p className="mt-2 text-muted-foreground">
              Encuentra los recursos perfectos para tu próximo proyecto
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Categoría
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className={category === '' ? 'bg-accent' : ''}
                  onClick={() => setCategory('')}
                >
                  Todas las categorías
                </DropdownMenuItem>
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    className={category === cat.toLowerCase() ? 'bg-accent' : ''}
                    onClick={() => setCategory(cat.toLowerCase())}
                  >
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Ordenar
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSort('newest')}>Más nuevos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSort('price_asc')}>Precio: menor a mayor</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSort('price_desc')}>Precio: mayor a menor</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSort('popular')}>Más populares</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {(search || category) && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </form>
        </div>

        <ProductsList
          search={search}
          category={category}
          sort={sort}
          page={page}
          setPage={setPage}
        />
      </div>
    </div>
  )
}

function ProductsList({
  search,
  category,
  sort,
  page,
  setPage,
}: {
  search: string
  category: string
  sort: string
  page: number
  setPage: (page: number) => void
}) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProducts = async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '12',
      ...(search && { search }),
      ...(category && { category }),
      ...(sort && { sort }),
    })
    const res = await fetch(`/api/products?${params}`)
    const data = await res.json()
    setProducts(data.products)
    setTotalPages(data.pagination.totalPages)
    setLoading(false)
  }

  const key = `${search}-${category}-${sort}-${page}`

  return (
    <div key={key}>
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">No se encontraron productos</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="aspect-square w-full rounded-lg bg-muted animate-pulse" />
      <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
      <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
      <div className="h-6 w-24 rounded bg-muted animate-pulse" />
    </div>
  )
}