import { redirect } from 'next/navigation'
import { requireServerAdmin } from '@/lib/session'
import AdminLayoutClient from './layout-client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await requireServerAdmin()
  if (!admin) redirect('/auth/login')

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
