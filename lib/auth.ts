import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
const secret = new TextEncoder().encode(JWT_SECRET)

export interface AdminPayload extends JWTPayload {
  id: string
  email: string
  name: string
}

export async function signToken(payload: AdminPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as AdminPayload
  } catch {
    return null
  }
}

export async function getAdminFromCookies(): Promise<AdminPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getAdminFromRequest(req: NextRequest): Promise<AdminPayload | null> {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return null
  return verifyToken(token)
}
