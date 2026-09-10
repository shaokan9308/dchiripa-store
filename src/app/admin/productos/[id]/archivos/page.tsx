'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Trash2, File, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface FileItem {
  key: string
  size: number
  lastModified?: Date
}

export default function ProductFilesPage() {
  const params = useParams()
  const productId = params.id as string
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/files`)
      if (res.ok) {
        const data = await res.json()
        setFiles(data.files || [])
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    console.log('[UPLOAD] File:', file.name, 'Size:', file.size, 'Type:', file.type)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/admin/products/${productId}/files`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'No se pudo subir el archivo', variant: 'destructive' })
      } else {
        toast({ title: 'Archivo subido', description: file.name })
        await fetchFiles()
      }
    } catch (err) {
      console.error('[UPLOAD CLIENT ERROR]', err)
      toast({ title: 'Error', description: 'Error de conexión al subir', variant: 'destructive' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (key: string) => {
    if (!confirm('¿Eliminar este archivo?')) return
    try {
      await fetch(`/api/admin/products/${productId}/files?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      })
      await fetchFiles()
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' })
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Archivos del Producto</h1>
        <p className="text-muted-foreground">Sube y gestiona los archivos descargables.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subir archivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Seleccionar archivo
            </Button>
            {uploading && <span className="text-sm text-muted-foreground">Subiendo...</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Archivos ({files.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay archivos subidos.</p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.key}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{file.key.split('/').pop()}</p>
                      <p className="text-xs text-muted-foreground">{file.key} · {formatSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.key)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
