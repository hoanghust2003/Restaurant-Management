import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  if (!token) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(url)
  }

  // Check if user has warehouse access permission
  if (!token.roles?.includes('warehouse_access')) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Authentication failed' }),
      { status: 403, headers: { 'content-type': 'application/json' } }
    )
  }

  return NextResponse.next()
}
