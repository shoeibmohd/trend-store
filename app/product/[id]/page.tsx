import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import StoreLayout from '@/components/store/StoreLayout'
import ProductDetailClient from '@/components/store/ProductDetailClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function ProductPage({ params }: PageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id, isActive: true },
  })

  if (!product) notFound()

  const related = await prisma.product.findMany({
    where: { category: product.category, isActive: true, NOT: { id: product.id } },
    take: 4,
  })

  return (
    <StoreLayout>
      <ProductDetailClient product={product} related={related} />
    </StoreLayout>
  )
}
