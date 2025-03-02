import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // デバッグ情報
  console.log('Middleware - Request URL:', request.nextUrl.pathname);
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  
  // デバッグ情報
  console.log('Middleware - Session exists:', !!session);

  // ルートページへのアクセスの場合、ダッシュボードにリダイレクト
  if (request.nextUrl.pathname === '/' && session) {
    console.log('Middleware - Redirecting from root to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ダッシュボードへのアクセスは認証が必要
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    console.log('Middleware - No session, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ログイン済みの場合、ログインページとサインアップページにアクセスするとダッシュボードにリダイレクト
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && session) {
    console.log('Middleware - Session exists, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/signup'],
} 