'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { formatPrice, formatDate, STATUS_COLORS, ORDER_STATUSES, generateWhatsAppLink, type OrderStatus } from '@/lib/utils'

interface OrderItem {
  productId: string
  title: string
  quantity: number
  price: number
  selectedColor?: string
  selectedSize?: string
  selectedMaterial?: string
}

interface Order {
  id: string
  customerName: string
  phone: string
  whatsapp: string | null
  address: string
  city: string
  emirate: string
  items: string
  totalAmount: number
  status: string
  notes: string | null
  createdAt: Date
}

function OrderDetailModal({ order, onClose, onStatusUpdate }: {
  order: Order
  onClose: () => void
  onStatusUpdate: (id: string, status: string) => void
}) {
  const items: OrderItem[] = JSON.parse(order.items)
  const [updating, setUpdating] = useState(false)

  const handleStatusUpdate = async (status: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) onStatusUpdate(order.id, status)
    } catch {
      alert('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const whatsappContact = generateWhatsAppLink(
    order.phone,
    `Hello ${order.customerName}! Your TrendHub UAE order has been received. We will contact you shortly to confirm delivery.`
  )

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-dark-950 text-lg">Order Details</h2>
            <p className="text-gray-500 text-xs mt-0.5">#{order.id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`status-badge ${STATUS_COLORS[order.status as OrderStatus]}`}>
              {order.status}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-dark-950 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold text-dark-950 text-sm uppercase tracking-widest mb-3">Customer</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Name</span>
                <span className="font-semibold text-dark-950 text-sm">{order.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Phone</span>
                <a href={`tel:${order.phone}`} className="text-gold-400 font-medium text-sm hover:underline">{order.phone}</a>
              </div>
              {order.whatsapp && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">WhatsApp</span>
                  <span className="text-dark-950 text-sm">{order.whatsapp}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Emirate</span>
                <span className="text-dark-950 font-semibold text-sm">{order.emirate}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-gray-500 text-sm flex-shrink-0">Address</span>
                <span className="text-dark-950 text-sm text-right">{order.address}, {order.city}</span>
              </div>
              {order.notes && (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500 text-sm flex-shrink-0">Notes</span>
                  <span className="text-dark-950 text-sm text-right italic">{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-dark-950 text-sm uppercase tracking-widest mb-3">Items</h3>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                  <div>
                    <p className="font-medium text-dark-950 text-sm">{item.title}</p>
                    <div className="flex gap-2 flex-wrap mt-1">
                      <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                      {item.selectedColor && <span className="text-xs text-gray-400">Color: {item.selectedColor}</span>}
                      {item.selectedSize && <span className="text-xs text-gray-400">Size: {item.selectedSize}</span>}
                      {item.selectedMaterial && <span className="text-xs text-gray-400">Material: {item.selectedMaterial}</span>}
                    </div>
                  </div>
                  <span className="font-bold text-dark-950 text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
              <span className="font-bold text-dark-950">Total</span>
              <span className="font-bold text-gold-500 text-xl">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <h3 className="font-semibold text-dark-950 text-sm uppercase tracking-widest mb-3">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={updating || order.status === status}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    order.status === status
                      ? STATUS_COLORS[status as OrderStatus] + ' cursor-default'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex gap-3">
            <a
              href={whatsappContact}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Customer
            </a>
            <a
              href={`tel:${order.phone}`}
              className="flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-3 px-6 rounded-xl text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminOrdersClient({ orders: initialOrders }: { orders: Order[] }) {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState(initialOrders)
  const [filter, setFilter] = useState(searchParams.get('status') || 'ALL')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Open order from URL param
  useEffect(() => {
    const orderId = searchParams.get('id')
    if (orderId) {
      const order = orders.find((o) => o.id === orderId)
      if (order) setSelectedOrder(order)
    }
  }, [searchParams, orders])

  const filteredOrders = filter === 'ALL'
    ? orders
    : orders.filter((o) => o.status === filter)

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length

  const handleStatusUpdate = (id: string, status: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
    if (selectedOrder?.id === id) {
      setSelectedOrder((prev) => prev ? { ...prev, status } : null)
    }
  }

  const statusCounts = ORDER_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length
    return acc
  }, {})

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-950">Orders</h1>
          <p className="text-gray-500 mt-1">
            {orders.length} total orders
            {pendingCount > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'ALL' ? 'bg-dark-950 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          All ({orders.length})
        </button>
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === status
                ? 'bg-dark-950 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {status} ({statusCounts[status] || 0})
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-24 text-center text-gray-400">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Emirate</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      order.status === 'PENDING' ? 'bg-yellow-50/30' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-400">#{order.id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div>
                        <p className="font-medium text-dark-950 text-sm">{order.customerName}</p>
                        <p className="text-gray-400 text-xs">{order.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm hidden md:table-cell">{order.emirate}</td>
                    <td className="px-6 py-4 font-bold text-dark-950 text-sm">{formatPrice(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`status-badge ${STATUS_COLORS[order.status as OrderStatus]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs hidden lg:table-cell">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order) }}
                        className="text-gold-400 hover:text-gold-500 text-xs font-medium"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </>
  )
}
