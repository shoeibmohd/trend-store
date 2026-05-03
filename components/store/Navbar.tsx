'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        const count = cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)
        setCartCount(count)
      } catch {
        setCartCount(0)
      }
    }

    updateCart()
    window.addEventListener('storage', updateCart)
    window.addEventListener('cartUpdated', updateCart)

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('storage', updateCart)
      window.removeEventListener('cartUpdated', updateCart)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark-950/95 backdrop-blur-md shadow-lg' : 'bg-dark-950'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-widest text-white">
              TREND<span className="text-gold-400">HUB</span>
            </span>
            <span className="text-xs text-gray-400 font-light tracking-wider uppercase hidden sm:block">
              UAE
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-300 hover:text-gold-400 text-sm font-medium transition-colors tracking-wide">
              Home
            </Link>
            <Link href="/?category=Bags" className="text-gray-300 hover:text-gold-400 text-sm font-medium transition-colors tracking-wide">
              Bags
            </Link>
            <Link href="/?category=Clothing" className="text-gray-300 hover:text-gold-400 text-sm font-medium transition-colors tracking-wide">
              Clothing
            </Link>
            <Link href="/?category=Accessories" className="text-gray-300 hover:text-gold-400 text-sm font-medium transition-colors tracking-wide">
              Accessories
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link href="/cart" className="relative flex items-center gap-2 text-gray-300 hover:text-gold-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-400 text-dark-950 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-gold-400 transition-colors"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-2">
            {['/', '/?category=Bags', '/?category=Clothing', '/?category=Accessories'].map((href, i) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-300 hover:text-gold-400 hover:bg-white/5 rounded-lg text-sm font-medium transition-colors"
              >
                {['Home', 'Bags', 'Clothing', 'Accessories'][i]}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
