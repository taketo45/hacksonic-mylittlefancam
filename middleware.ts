import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 未認証ユーザーをログインページにリダイレクト
  if (!session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // ユーザーのロール情報を取得
  const { data: userRoles } = await supabase
    .from('user_role_tbl')
    .select(`
      role_id,
      role_mst!inner (
        role_name
      )
    `)
    .eq('user_id', session.user.id)

  const roleNames = userRoles?.map(role => role.role_mst.role_name) || []
  console.log('Middleware checking roles:', roleNames)

  // 管理者画面へのアクセス制御
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!roleNames.includes('admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // ダッシュボードへのアクセス制御
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // 基本的なダッシュボードアクセス権限チェック
    if (!roleNames.some(name => ['user', 'organizer', 'photographer', 'admin'].includes(name))) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // イベント管理へのアクセス制御
    if (request.nextUrl.pathname.startsWith('/dashboard/events')) {
      if (!roleNames.some(name => ['organizer', 'admin'].includes(name))) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // 写真アップロードへのアクセス制御
    if (request.nextUrl.pathname.startsWith('/dashboard/photos/upload')) {
      if (!roleNames.some(name => ['photographer', 'organizer', 'admin'].includes(name))) {
        return NextResponse.redirect(new URL('/dashboard/photos', request.url))
      }
    }

    // 印刷管理へのアクセス制御
    if (request.nextUrl.pathname.startsWith('/dashboard/print')) {
      if (!roleNames.some(name => ['organizer', 'admin'].includes(name))) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // その他のページは認証済みユーザーなら全てアクセス可能
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/dashboard/events/:path*',
    '/dashboard/photos/:path*',
    '/dashboard/edit/:path*',
    '/dashboard/oshi-wipe/:path*',
    '/dashboard/cart/:path*',
    '/dashboard/purchases/:path*',
    '/dashboard/print/:path*',
  ],
} 