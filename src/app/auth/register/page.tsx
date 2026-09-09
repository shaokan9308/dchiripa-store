import { Suspense } from 'react'
import { RegisterForm } from './register-form'

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">Cargando...</div>}>
      <RegisterForm />
    </Suspense>
  )
}