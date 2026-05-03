'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface CategoryFilterProps {
  categories: string[]
  activeCategory?: string
}

export default function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const router = useRouter()

  const handleCategoryChange = (category: string | null) => {
    if (category) {
      router.push(`/?category=${encodeURIComponent(category)}#products`)
    } else {
      router.push('/#products')
    }
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-8">
      <button
        onClick={() => handleCategoryChange(null)}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          !activeCategory
            ? 'bg-dark-950 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleCategoryChange(cat)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeCategory === cat
              ? 'bg-gold-400 text-dark-950'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
