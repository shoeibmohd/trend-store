import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { formatPrice, formatDate, STATUS_COLORS, type OrderStatus } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const admin = await getAdminFromCookies()
  if (!admin) redirect('/admin/login')

  const [totalOrders, pendingOrders, processingOrders, totalRevenue, recentOrders, totalProducts, activeProducts] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { notIn: ['CANCELLED'] } } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
  ])

  const stats = [
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: '📦',
      color: 'bg-blue-50 border-blue-100',
      textColor: 'text-blue-600',
      href: '/admin/orders',
    },
    {
      label: 'Pending Orders',
      value: pendingOrders,
      icon: '⏳',
      color: 'bg-yellow-50 border-yellow-100',
      textColor: 'text-yellow-600',
      href: '/admin/orders?status=PENDING',
      badge: pendingOrders > 0,
    },
    {
      label: 'Processing',
      value: processingOrders,
      icon: '🔄',
      color: 'bg-purple-50 border-purple-100',
      textColor: 'text-purple-600',
      href: '/admin/orders?status=PROCESSING',
    },
    {
      label: 'Total Revenue',
      value: formatPrice(totalRevenue._sum.totalAmount || 0),
      icon: '💰',
      color: 'bg-green-50 border-green-100',
      textColor: 'text-green-600',
      href: '/admin/orders',
      isRevenue: true,
    },
  ]

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-950">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="block">
            <div className={`bg-white border rounded-xl p-5 hover:shadow-md transition-shadow ${stat.color}`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                {stat.badge && (
                  <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    NEW
                  </span>
                )}
              </div>
              <div className={`font-bold ${stat.isRevenue ? 'text-lg' : 'text-3xl'} ${stat.textColor}`}>
                {stat.value}
              </div>
              <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-dark-950">Recent Orders</h2>
              <Link href="/admin/orders" className="text-gold-400 hover:text-gold-500 text-sm font-medium">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">No orders yet</div>
              ) : (
                recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders?id=${order.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-dark-950 text-sm">{order.customerName}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{order.emirate} · {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className={`status-badge ${STATUS_COLORS[order.status as OrderStatus]}`}>
                        {order.status}
                      </span>
                      <span className="font-bold text-dark-950 text-sm">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Links & Stats */}
        <div className="space-y-6">
          {/* Products Overview */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-dark-950 mb-4">Products</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Total Products</span>
                <span className="font-bold text-dark-950">{totalProducts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Active</span>
                <span className="font-bold text-green-600">{activeProducts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Inactive</span>
                <span className="font-bold text-gray-400">{totalProducts - activeProducts}</span>
              </div>
            </div>
            <Link
              href="/admin/products"
              className="mt-6 w-full btn-gold text-xs py-2.5 block text-center rounded-lg"
            >
              Manage Products
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-dark-950 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/admin/products?action=new"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 hover:text-dark-950"
              >
                <span className="text-lg">➕</span>
                Add New Product
              </Link>
              <Link
                href="/admin/orders?status=PENDING"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 hover:text-dark-950"
              >
                <span className="text-lg">⏳</span>
                View Pending Orders
                {pendingOrders > 0 && (
                  <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingOrders}
                  </span>
                )}
              </Link>
              <a
                href="/"
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 hover:text-dark-950"
              >
                <span className="text-lg">🌐</span>
                View Store
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
