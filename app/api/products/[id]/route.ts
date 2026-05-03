import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, description, price, category, images, variants, stock, isActive } = body

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(price !== undefined ? { price: parseFloat(price) } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(images !== undefined
          ? { images: typeof images === 'string' ? images : JSON.stringify(images) }
          : {}),
        ...(variants !== undefined
          ? { variants: typeof variants === 'string' ? variants : JSON.stringify(variants) }
          : {}),
        ...(stock !== undefined ? { stock: parseInt(stock) } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('PUT /api/products/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
