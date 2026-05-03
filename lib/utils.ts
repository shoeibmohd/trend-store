export function formatPrice(price: number): string {
  return `AED ${price.toFixed(2)}`
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const EMIRATES = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Umm Al Quwain',
  'Fujairah',
] as const

export type Emirate = (typeof EMIRATES)[number]

export const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
}

export const PRODUCT_CATEGORIES = [
  'Bags',
  'Clothing',
  'Accessories',
  'Shoes',
  'Jewelry',
  'Beauty',
  'Home',
  'Other',
] as const

export interface ProductVariants {
  colors: string[]
  sizes: string[]
  materials: string[]
}

export interface CartItem {
  productId: string
  title: string
  price: number
  quantity: number
  image: string
  selectedColor?: string
  selectedSize?: string
  selectedMaterial?: string
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}
