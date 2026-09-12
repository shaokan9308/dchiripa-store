'use client'

import { useState, useEffect } from 'react'
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
import { authClient } from '@/lib/auth-client'

export default function ProductsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [tag, setTag] = useState(searchParams.get('tag') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1'))
  const [availableTags, setAvailableTags] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/admin/tags')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAvailableTags(data.map((t: { name: string }) => t.name))
        }
      })
      .catch(() => {})
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (tag) params.set('tag', tag)
    if (sort !== 'newest') params.set('sort', sort)
    router.push(`/productos?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    setTag('')
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
        </div>

        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-search-input
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              aria-label="Buscar productos"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {tag || 'Todas las categorías'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className={tag === '' ? 'bg-accent' : ''}
                onClick={() => setTag('')}
              >
                Todas las categorías
              </DropdownMenuItem>
              {availableTags.map((t) => (
                <DropdownMenuItem
                  key={t}
                  className={tag === t ? 'bg-accent' : ''}
                  onClick={() => setTag(t)}
                >
                  {t}
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
              <DropdownMenuItem className={sort === 'newest' ? 'bg-accent' : ''} onClick={() => setSort('newest')}>Más recientes</DropdownMenuItem>
              <DropdownMenuItem className={sort === 'oldest' ? 'bg-accent' : ''} onClick={() => setSort('oldest')}>Más antiguos</DropdownMenuItem>
              <DropdownMenuItem className={sort === 'price_asc' ? 'bg-accent' : ''} onClick={() => setSort('price_asc')}>Precio: menor a mayor</DropdownMenuItem>
              <DropdownMenuItem className={sort === 'price_desc' ? 'bg-accent' : ''} onClick={() => setSort('price_desc')}>Precio: mayor a menor</DropdownMenuItem>
              <DropdownMenuItem className={sort === 'name' ? 'bg-accent' : ''} onClick={() => setSort('name')}>Nombre A-Z</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {(search || tag || sort !== 'newest') && (
            <Button type="button" variant="ghost" onClick={clearFilters} className="gap-1">
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </form>

        <div className="mt-8">
          <ProductsList
            search={search}
            tag={tag}
            sort={sort}
            page={page}
            setPage={setPage}
          />
        </div>
      </div>
    </div>
  )
}

function ProductsList({
  search,
  tag,
  sort,
  page,
  setPage,
}: {
  search: string
  tag: string
  sort: string
  page: number
  setPage: (page: number) => void
}) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [hasSubscription, setHasSubscription] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search }),
        ...(tag && { tag }),
        ...(sort && { sort }),
      })
      const res = await fetch(`/api/products?${params}`)
      if (!res.ok) throw new Error('Error al cargar productos')
      const data = await res.json()
      setProducts(data.products || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexion')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [search, tag, sort, page])

  useEffect(() => {
    fetch('/api/dashboard/subscription')
      .then(r => r.json())
      .then(data => {
        const sub = data.subscription
        setHasSubscription(sub && ['active', 'trialing'].includes(sub.status))
      })
      .catch(() => {})
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
            <div className="aspect-square bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-destructive mb-2">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchProducts}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">No se encontraron productos</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} hasSubscription={hasSubscription} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Paginación" className="mt-8 flex items-center justify-center gap-2">
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
        </nav>
      )}
    </>
  )
}
