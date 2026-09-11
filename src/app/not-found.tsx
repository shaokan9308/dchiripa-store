import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Pagina no encontrada</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        La pagina que buscas no existe o ha sido movida.
      </p>
      <Link href="/">
        <Button variant="outline">Volver al inicio</Button>
      </Link>
    </div>
  )
}
