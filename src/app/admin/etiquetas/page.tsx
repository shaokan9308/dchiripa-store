'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Tag, Pencil, Trash2, Save, X, Loader2 } from 'lucide-react'

interface TagInfo {
  name: string
  count: number
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTags()
  }, [])

  async function fetchTags() {
    try {
      const res = await fetch('/api/admin/tags')
      if (res.ok) {
        const data = await res.json()
        setTags(data)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  async function handleRename(oldName: string) {
    if (!editValue.trim() || editValue === oldName) {
      setEditingTag(null)
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName: editValue.trim() }),
      })

      if (res.ok) {
        toast({ title: 'Etiqueta renombrada' })
        await fetchTags()
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' })
    } finally {
      setSaving(false)
      setEditingTag(null)
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`¿Eliminar la etiqueta "${name}" de todos los productos?`)) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (res.ok) {
        toast({ title: 'Etiqueta eliminada' })
        await fetchTags()
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Cargando etiquetas...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Etiquetas</h1>
        <p className="text-muted-foreground">Gestiona las etiquetas de los productos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Etiquetas ({tags.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay etiquetas. Asigna etiquetas a tus productos desde el editor.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {tags.map((tag) => (
                <div
                  key={tag.name}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                >
                  {editingTag === tag.name ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(tag.name)
                          if (e.key === 'Escape') setEditingTag(null)
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRename(tag.name)}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingTag(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{tag.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {tag.count} {tag.count === 1 ? 'producto' : 'productos'}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingTag(tag.name)
                            setEditValue(tag.name)
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(tag.name)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
