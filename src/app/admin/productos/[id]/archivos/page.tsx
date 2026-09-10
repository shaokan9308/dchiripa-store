'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Trash2, File, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface FileItem {
  key: string
  size: number
  lastModified?: Date
}

interface UploadProgress {
  file: File
  status: 'uploading' | 'success' | 'error'
  key?: string
  error?: string
}

export default function ProductFilesPage() {
  const params = useParams()
  const productId = params.id as string
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const uploadFileServer = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`/api/admin/products/${productId}/files`, {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al subir')
    return data.key
  }

  const handleFiles = async (fileList: FileList | File[]) => {
    const newUploads: UploadProgress[] = Array.from(fileList).map(file => ({
      file,
      status: 'uploading' as const,
    }))

    setUploads(prev => [...prev, ...newUploads])

    for (let i = 0; i < newUploads.length; i++) {
      const file = newUploads[i].file
      const uploadIndex = uploads.length + i

      try {
        const key = await uploadFileServer(file)
        setUploads(prev => prev.map((u, idx) =>
          idx === uploadIndex ? { ...u, status: 'success' as const, key: key || undefined } : u
        ))
      } catch (err: any) {
        setUploads(prev => prev.map((u, idx) =>
          idx === uploadIndex ? { ...u, status: 'error' as const, error: err.message } : u
        ))
      }
    }

    await fetchFiles()

    setTimeout(() => {
      setUploads(prev => prev.filter(u => u.status === 'uploading'))
    }, 3000)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
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
      toast({ title: 'Archivo eliminado' })
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' })
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const getFileIcon = (key: string) => {
    const ext = key.split('.').pop()?.toLowerCase()
    const iconColors: Record<string, string> = {
      psd: 'text-blue-600',
      ai: 'text-orange-600',
      fig: 'text-purple-600',
      sketch: 'text-yellow-600',
      xd: 'text-pink-600',
      pdf: 'text-red-600',
      zip: 'text-gray-600',
    }
    return iconColors[ext || ''] || 'text-muted-foreground'
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Archivos del Producto</h1>
        <p className="text-muted-foreground">Sube y gestiona los archivos descargables.</p>
      </div>

      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className={`rounded-full bg-primary/10 p-4 mb-4 transition-colors ${isDragOver ? 'bg-primary/20' : ''}`}>
            <Upload className={`h-8 w-8 transition-colors ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <p className="text-lg font-medium mb-1">
            {isDragOver ? 'Suelta los archivos aqui' : 'Arrastra archivos aqui'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            o haz clic para seleccionar
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleInputChange}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Seleccionar archivos
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Formatos: PSD, AI, FIG, PDF, ZIP, etc.
          </p>
        </CardContent>
      </Card>

      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subidas en progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploads.map((upload, idx) => (
                <div
                  key={`${upload.file.name}-${idx}`}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className={`h-5 w-5 shrink-0 ${upload.status === 'success' ? 'text-green-600' : upload.status === 'error' ? 'text-red-600' : 'text-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{upload.file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(upload.file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {upload.status === 'uploading' && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {upload.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {upload.status === 'error' && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs">{upload.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <File className="h-12 w-12 mb-4 opacity-50" />
              <p>No hay archivos subidos.</p>
              <p className="text-sm">Arrastra archivos o haz clic en "Seleccionar archivos" para comenzar.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.key}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <File className={`h-5 w-5 shrink-0 ${getFileIcon(file.key)}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.key.split('/').pop()}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {file.key} · {formatSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.key)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
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
