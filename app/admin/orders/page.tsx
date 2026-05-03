import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminOrdersClient from '@/components/admin/AdminOrdersClient'

export default async function AdminOrdersPage() {
  const admin = await getAdminFromCookies()
  if (!admin) redirect('/admin/login')

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <AdminLayout>
      <AdminOrdersClient orders={orders} />
    </AdminLayout>
  )
}
