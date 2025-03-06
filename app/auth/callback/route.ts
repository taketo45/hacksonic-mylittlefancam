import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { Database } from '@/lib/database.types'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // セッションを交換
    const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth`)
    }

    if (!user) {
      console.error('No user found')
      return NextResponse.redirect(`${requestUrl.origin}/login?error=no_user`)
    }

    try {
      // ユーザーが既に存在するか確認
      const { data: existingUser, error: userError } = await supabase
        .from('user_tbl')
        .select('user_id')
        .eq('auth_user_id', user.id)
        .single()

      if (!existingUser && !userError) {
        // 新規ユーザーの場合、user_tblに登録
        const userId = uuidv4()
        const { error: insertError } = await supabase
          .from('user_tbl')
          .insert({
            user_id: userId,
            auth_user_id: user.id,
            name: user.user_metadata.full_name || 'Unknown',
            email: user.email!,
            password: '', // OAuth認証の場合はパスワード不要
            account_status: '有効',
          })

        if (insertError) {
          console.error('Insert error:', insertError)
          return NextResponse.redirect(`${requestUrl.origin}/login?error=db`)
        }

        // ユーザーロールの割り当て
        const { data: roles } = await supabase
          .from('role_mst')
          .select('role_id')
          .eq('role_name', 'user')
          .single()

        if (roles) {
          await supabase
            .from('user_role_tbl')
            .insert({
              user_id: userId,
              role_id: roles.role_id,
              assigned_by: 'SYSTEM',
              is_primary: true,
            })
        }
      }
    } catch (error) {
      console.error('Database error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=db`)
    }
  }

  // ダッシュボードにリダイレクト
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
} 