'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  title: string
  price: number
  category: string
  images: string
  variants: string
}

export default function ProductCard({ product }: { product: Product }) {
  const images: string[] = JSON.parse(product.images || '[]')
  const firstImage = images[0] || null

  return (
    <Link href={`/product/${product.id}`} className="group product-card block">
      <div className="relative overflow-hidden rounded-xl bg-gray-50 aspect-[3/4]">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={product.title}
            fill
            className="object-cover product-card-image"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-dark-950/80 text-gold-400 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            {product.category}
          </span>
        </div>

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-dark-950/0 group-hover:bg-dark-950/20 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <span className="bg-gold-400 text-dark-950 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            View Product
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 px-1">
        <h3 className="text-dark-950 font-semibold text-sm leading-tight group-hover:text-gold-400 transition-colors line-clamp-2">
          {product.title}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-dark-950 font-bold text-base">
            {formatPrice(product.price)}
          </span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3 h-3 text-gold-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
