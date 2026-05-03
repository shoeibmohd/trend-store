'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { formatPrice, EMIRATES, type CartItem } from '@/lib/utils'

interface OrderSuccess {
  id: string
  totalAmount: number
}

export default function CheckoutClient() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<OrderSuccess | null>(null)

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    emirate: 'Dubai',
    notes: '',
  })

  useEffect(() => {
    setMounted(true)
    try {
      const stored = JSON.parse(localStorage.getItem('cart') || '[]')
      setCart(stored)
    } catch {
      setCart([])
    }
  }, [])

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      setError('Your cart is empty. Please add items before checking out.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: cart,
          totalAmount: total,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to place order')
      }

      const order = await response.json()
      setSuccess({ id: order.id, totalAmount: order.totalAmount })
      localStorage.setItem('cart', '[]')
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-dark-950 mb-3">Order Placed!</h1>
          <p className="text-gray-500 mb-2">Thank you for your order. We will contact you shortly to confirm delivery details.</p>
          <div className="bg-gold-50 border border-gold-200 rounded-xl p-6 my-8 text-left">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-sm">Order ID:</span>
              <span className="font-mono font-bold text-dark-950 text-sm">{success.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-sm">Total Amount:</span>
              <span className="font-bold text-gold-500 text-lg">{formatPrice(success.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Status:</span>
              <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs font-semibold px-3 py-1 rounded-full">Pending Confirmation</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-gold">
              Continue Shopping
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971501234567'}?text=${encodeURIComponent(`Hi! I just placed an order #${success.id.slice(-8).toUpperCase()} on TrendHub UAE. Total: AED ${success.totalAmount.toFixed(2)}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 text-sm uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contact via WhatsApp
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark-950 mb-3">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add some items before checking out</p>
          <Link href="/" className="btn-gold">Browse Products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-dark-950 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-gold-400 text-xs font-semibold uppercase tracking-[3px] mb-2">Final Step</p>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-dark-950 text-lg mb-6 flex items-center gap-2">
                  <span className="w-7 h-7 bg-gold-400 text-dark-950 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  Customer Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Full Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={form.customerName}
                      onChange={handleChange}
                      required
                      placeholder="Ahmed Al Rashid"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">Mobile Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="+971 50 123 4567"
                      pattern="^[\+]?[0-9\s\-\(\)]{8,20}$"
                      className="input-field"
                    />
                    <p className="text-xs text-gray-400 mt-1">UAE format: +971 5X XXX XXXX</p>
                  </div>

                  <div>
                    <label className="label">WhatsApp Number</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={form.whatsapp}
                      onChange={handleChange}
                      placeholder="If different from mobile"
                      className="input-field"
                    />
                    <p className="text-xs text-gray-400 mt-1">Leave blank if same as mobile</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-dark-950 text-lg mb-6 flex items-center gap-2">
                  <span className="w-7 h-7 bg-gold-400 text-dark-950 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  Delivery Address
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="label">Street Address *</label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="Villa/Apartment number, Street name, Building name..."
                      className="input-field resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Jumeirah, Al Ain"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="label">Emirate *</label>
                      <select
                        name="emirate"
                        value={form.emirate}
                        onChange={handleChange}
                        required
                        className="input-field"
                      >
                        {EMIRATES.map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Order Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Any special instructions for your order or delivery..."
                      className="input-field resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h2 className="font-bold text-dark-950 text-lg mb-6 flex items-center gap-2">
                  <span className="w-7 h-7 bg-gold-400 text-dark-950 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4">
                  {cart.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.title} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full bg-gray-100" />
                        )}
                        <span className="absolute -top-1 -right-1 bg-dark-950 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-dark-950 truncate">{item.title}</p>
                        <div className="text-xs text-gray-400">
                          {[item.selectedColor, item.selectedSize, item.selectedMaterial].filter(Boolean).join(' · ')}
                        </div>
                        <p className="text-xs font-bold text-gold-500 mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Delivery</span>
                    <span className="text-green-600">TBD</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t">
                    <span>Total</span>
                    <span className="text-gold-500">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-sm uppercase tracking-wide transition-all duration-200 ${
                    loading
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gold-400 hover:bg-gold-500 text-dark-950'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      Place Order
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  By placing an order, you agree to our terms and conditions. Cash on delivery available.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
