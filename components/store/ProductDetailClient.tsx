'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { formatPrice, generateWhatsAppLink, type CartItem } from '@/lib/utils'
import ProductCard from './ProductCard'

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  images: string
  variants: string
  stock: number
}

interface Variants {
  colors: string[]
  sizes: string[]
  materials: string[]
}

export default function ProductDetailClient({
  product,
  related,
}: {
  product: Product
  related: Product[]
}) {
  const images: string[] = JSON.parse(product.images || '[]')
  const variants: Variants = JSON.parse(product.variants || '{}')

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string>(variants.colors?.[0] || '')
  const [selectedSize, setSelectedSize] = useState<string>(variants.sizes?.[0] || '')
  const [selectedMaterial, setSelectedMaterial] = useState<string>(variants.materials?.[0] || '')
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  const addToCart = () => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]')
    const cartItemId = `${product.id}-${selectedColor}-${selectedSize}-${selectedMaterial}`

    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === product.id &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize &&
        item.selectedMaterial === selectedMaterial
    )

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity
    } else {
      cart.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity,
        image: images[0] || '',
        ...(selectedColor ? { selectedColor } : {}),
        ...(selectedSize ? { selectedSize } : {}),
        ...(selectedMaterial ? { selectedMaterial } : {}),
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const whatsappMessage = `Hi! I'm interested in: ${product.title}${selectedColor ? ` (Color: ${selectedColor})` : ''}${selectedSize ? ` (Size: ${selectedSize})` : ''}${selectedMaterial ? ` (Material: ${selectedMaterial})` : ''} - AED ${product.price}`

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971501234567'

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/?category=${product.category}`} className="hover:text-gold-400 transition-colors">{product.category}</Link>
            <span>/</span>
            <span className="text-dark-950 font-medium truncate max-w-[200px]">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
              {images[selectedImage] ? (
                <Image
                  src={images[selectedImage]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-gold-400' : 'border-transparent'
                    }`}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Category */}
            <span className="text-gold-400 text-xs font-semibold uppercase tracking-[3px] mb-3">
              {product.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-dark-950 leading-tight mb-4">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-gold-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-400 text-sm">Premium Quality</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-gray-100">
              <span className="text-4xl font-bold text-dark-950">{formatPrice(product.price)}</span>
              <span className="text-gray-400 text-sm">Incl. VAT</span>
            </div>

            {/* Variants */}
            <div className="space-y-6 mb-8">
              {/* Color */}
              {variants.colors && variants.colors.length > 0 && (
                <div>
                  <label className="label">
                    Color: <span className="text-gold-400 font-semibold">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {variants.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedColor === color
                            ? 'border-gold-400 bg-gold-50 text-dark-950'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size */}
              {variants.sizes && variants.sizes.length > 0 && (
                <div>
                  <label className="label">
                    Size: <span className="text-gold-400 font-semibold">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {variants.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-lg border-2 text-sm font-semibold transition-all ${
                          selectedSize === size
                            ? 'border-gold-400 bg-gold-400 text-dark-950'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Material */}
              {variants.materials && variants.materials.length > 0 && (
                <div>
                  <label className="label">
                    Material: <span className="text-gold-400 font-semibold">{selectedMaterial}</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {variants.materials.map((mat) => (
                      <button
                        key={mat}
                        onClick={() => setSelectedMaterial(mat)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedMaterial === mat
                            ? 'border-gold-400 bg-gold-50 text-dark-950'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="label">Quantity</label>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={addToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-sm uppercase tracking-wide transition-all duration-200 ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-dark-950 hover:bg-dark-800 text-white'
                }`}
              >
                {addedToCart ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>

              <a
                href={generateWhatsAppLink(whatsappNumber, whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white py-4 px-6 rounded-xl font-semibold text-sm uppercase tracking-wide transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Inquire
              </a>
            </div>

            {/* Checkout link */}
            {addedToCart && (
              <Link
                href="/cart"
                className="mt-3 text-center text-gold-400 text-sm font-medium hover:underline"
              >
                View Cart & Checkout →
              </Link>
            )}

            {/* Description */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="font-semibold text-dark-950 mb-3">Product Description</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
            </div>

            {/* Delivery Info */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { icon: '🚚', title: 'Fast Delivery', desc: '2-5 business days' },
                { icon: '🇦🇪', title: 'All Emirates', desc: 'UAE-wide delivery' },
                { icon: '💎', title: 'Authentic', desc: 'Guaranteed genuine' },
                { icon: '↩️', title: 'Easy Returns', desc: '7-day return policy' },
              ].map((info) => (
                <div key={info.title} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                  <span className="text-xl">{info.icon}</span>
                  <div>
                    <p className="font-medium text-dark-950 text-xs">{info.title}</p>
                    <p className="text-gray-500 text-xs">{info.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-24">
            <div className="text-center mb-10">
              <p className="text-gold-400 text-xs font-semibold uppercase tracking-[3px] mb-2">You May Also Like</p>
              <h2 className="text-2xl font-bold text-dark-950">Related Products</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
