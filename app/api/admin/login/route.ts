import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = await signToken({ id: admin.id, email: admin.email, name: admin.name })

    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    })

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('POST /api/admin/login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
