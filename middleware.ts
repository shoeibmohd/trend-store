import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    const admin = await verifyToken(token)
    if (!admin) {
      const response = NextResponse.redirect(new URL('/admin/login', req.url))
      response.cookies.delete('admin_token')
      return response
    }
  }

  // Redirect logged-in admin away from login page
  if (pathname === '/admin/login') {
    const token = req.cookies.get('admin_token')?.value
    if (token) {
      const admin = await verifyToken(token)
      if (admin) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
