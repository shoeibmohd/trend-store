'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { formatPrice, type CartItem } from '@/lib/utils'

export default function CartClient() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadCart()
  }, [])

  const loadCart = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('cart') || '[]')
      setCart(stored)
    } catch {
      setCart([])
    }
  }

  const updateQuantity = (index: number, qty: number) => {
    const newCart = [...cart]
    if (qty <= 0) {
      newCart.splice(index, 1)
    } else {
      newCart[index].quantity = qty
    }
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const clearCart = () => {
    setCart([])
    localStorage.setItem('cart', '[]')
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-dark-950 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-gold-400 text-xs font-semibold uppercase tracking-[3px] mb-2">Your Selection</p>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-gray-400 mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {cart.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-dark-950 mb-3">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Discover our trending collection and add items you love</p>
            <Link href="/" className="btn-gold">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="bg-white rounded-xl p-4 flex gap-4 shadow-sm border border-gray-100">
                  {/* Image */}
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill className="object-cover" sizes="96px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-dark-950 text-sm leading-tight truncate">{item.title}</h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      {item.selectedColor && (
                        <span className="text-xs text-gray-500">Color: <span className="text-dark-700 font-medium">{item.selectedColor}</span></span>
                      )}
                      {item.selectedSize && (
                        <span className="text-xs text-gray-500">Size: <span className="text-dark-700 font-medium">{item.selectedSize}</span></span>
                      )}
                      {item.selectedMaterial && (
                        <span className="text-xs text-gray-500">Material: <span className="text-dark-700 font-medium">{item.selectedMaterial}</span></span>
                      )}
                    </div>
                    <p className="text-gold-500 font-bold text-sm mt-1">{formatPrice(item.price)}</p>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:border-gray-300 text-gray-600 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:border-gray-300 text-gray-600 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* Subtotal & Remove */}
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-dark-950 text-sm">{formatPrice(item.price * item.quantity)}</span>
                        <button
                          onClick={() => removeItem(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={clearCart} className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear all items
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h2 className="font-bold text-dark-950 text-lg mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery</span>
                    <span className="text-green-600 font-medium">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-gold-500">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full btn-gold block text-center text-base py-4 rounded-xl"
                >
                  Proceed to Checkout
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>

                <Link href="/" className="block text-center text-gray-400 hover:text-gold-400 text-sm font-medium mt-4 transition-colors">
                  ← Continue Shopping
                </Link>

                {/* Trust badges */}
                <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-3">
                  {[
                    { icon: '🔒', text: 'Secure Checkout' },
                    { icon: '🇦🇪', text: 'UAE Delivery' },
                    { icon: '💳', text: 'Cash on Delivery' },
                    { icon: '↩️', text: 'Easy Returns' },
                  ].map((badge) => (
                    <div key={badge.text} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span>{badge.icon}</span>
                      <span>{badge.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
