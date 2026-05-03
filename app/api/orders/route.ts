import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { sendOrderNotification } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const orders = await prisma.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('GET /api/orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerName, phone, whatsapp, address, city, emirate, items, totalAmount, notes } = body

    if (!customerName || !phone || !address || !city || !emirate || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        phone,
        whatsapp: whatsapp || null,
        address,
        city,
        emirate,
        items: typeof items === 'string' ? items : JSON.stringify(items),
        totalAmount: parseFloat(totalAmount),
        notes: notes || null,
        status: 'PENDING',
      },
    })

    // Send email notification (non-blocking)
    sendOrderNotification({
      orderId: order.id,
      customerName: order.customerName,
      phone: order.phone,
      whatsapp: order.whatsapp,
      address: order.address,
      city: order.city,
      emirate: order.emirate,
      items: JSON.parse(order.items),
      totalAmount: order.totalAmount,
      notes: order.notes,
    }).catch(console.error)

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('POST /api/orders error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
