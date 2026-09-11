'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-bold mb-2">Algo salio mal</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
      </p>
      <Button onClick={reset} variant="outline">Intentar de nuevo</Button>
    </div>
  )
}
