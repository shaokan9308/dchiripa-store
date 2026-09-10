import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/session'
import AdminLayoutClient from './layout-client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireAdmin()
  } catch {
    redirect('/auth/login')
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
