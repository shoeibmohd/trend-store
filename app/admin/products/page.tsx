import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminProductsClient from '@/components/admin/AdminProductsClient'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const admin = await getAdminFromCookies()
  if (!admin) redirect('/admin/login')

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <AdminLayout>
      <AdminProductsClient products={products} />
    </AdminLayout>
  )
}
