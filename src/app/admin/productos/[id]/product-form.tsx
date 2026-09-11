'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, GripVertical, ImageIcon } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  images: string[]
  fileKeys: string[]
  tags: string[]
  isActive: boolean
}

interface UploadState {
  file: File
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  url?: string
}

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploads, setUploads] = useState<UploadState[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product ? (product.price / 100).toString() : '',
    images: product?.images || [],
    tags: product?.tags.join(', ') || '',
    isActive: product?.isActive ?? true,
  })

  const uploadImage = useCallback(async (upload: UploadState): Promise<string | null> => {
    if (!product?.id) return null

    try {
      const presignRes = await fetch('/api/admin/product-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          fileName: upload.file.name,
          contentType: upload.file.type,
        }),
      })

      if (!presignRes.ok) throw new Error('Error al preparar upload')
      const { uploadUrl, publicUrl } = await presignRes.json()

      const xhr = new XMLHttpRequest()
      const url = await new Promise<string>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setUploads(prev => prev.map(u =>
              u.file === upload.file ? { ...u, progress: pct } : u
            ))
          }
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(publicUrl)
          else reject(new Error('Upload failed'))
        }
        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', upload.file.type)
        xhr.send(upload.file)
      })

      return url
    } catch {
      return null
    }
  }, [product?.id])

  const handleFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      toast({ title: 'Error', description: 'Solo se permiten archivos de imagen', variant: 'destructive' })
      return
    }

    const newUploads: UploadState[] = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending' as const,
    }))

    setUploads(prev => [...prev, ...newUploads])

    for (const upload of newUploads) {
      setUploads(prev => prev.map(u =>
        u.file === upload.file ? { ...u, status: 'uploading' } : u
      ))

      const url = await uploadImage(upload)

      if (url) {
        setUploads(prev => prev.map(u =>
          u.file === upload.file ? { ...u, status: 'done', url } : u
        ))
        setForm(f => ({ ...f, images: [...f.images, url] }))
      } else {
        setUploads(prev => prev.map(u =>
          u.file === upload.file ? { ...u, status: 'error' } : u
        ))
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
  }

  const removeImage = async (index: number) => {
    const imageUrl = form.images[index]

    if (product?.id) {
      await fetch('/api/admin/product-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, imageUrl }),
      })
    }

    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }))
  }

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= form.images.length) return
    const arr = [...form.images]
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    setForm(f => ({ ...f, images: arr }))
  }

  const removeUpload = (index: number) => {
    setUploads(prev => {
      const u = prev[index]
      if (u) URL.revokeObjectURL(u.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = product ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Math.round(parseFloat(form.price) * 100),
          tags: form.tags.split(',').filter(Boolean).map(s => s.trim()),
        }),
      })

      if (res.ok) {
        router.push('/admin/productos')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return
    if (!confirm('¿Eliminar este producto?')) return

    const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/productos')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Informacion basica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <textarea
              id="description"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Precio (EUR)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Galeria de imagenes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing images */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {form.images.map((url, i) => (
                <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                  <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => moveImage(i, i - 1)}
                      disabled={i === 0}
                    >
                      <GripVertical className="h-4 w-4 -rotate-45" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => moveImage(i, i + 1)}
                      disabled={i === form.images.length - 1}
                    >
                      <GripVertical className="h-4 w-4 rotate-45" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() => removeImage(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {i === 0 && (
                    <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Arrastra imagenes aqui o <span className="text-primary font-medium">haz clic</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP (max 10MB c/u)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => e.target.files && handleFiles(e.target.files)}
            />
          </div>

          {/* Upload progress */}
          {uploads.filter(u => u.status !== 'done').length > 0 && (
            <div className="space-y-2">
              {uploads.map((u, i) => u.status !== 'done' && (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate flex-1">{u.file.name}</span>
                  {u.status === 'uploading' && (
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${u.progress}%` }}
                      />
                    </div>
                  )}
                  {u.status === 'error' && <span className="text-destructive">Error</span>}
                  <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeUpload(i)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etiquetas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
            <Input
              id="tags"
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="UI Kit, Branding, Figma"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4"
            />
            <span className="text-sm">Producto activo</span>
          </label>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || uploads.some(u => u.status === 'uploading')}>
          {loading ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
        </Button>
        {product && (
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Eliminar
          </Button>
        )}
      </div>
    </form>
  )
}
