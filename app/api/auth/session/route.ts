import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json()
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // セッションを設定
    const { data: { session }, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error) {
      console.error('Session setting error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ session })
  } catch (error: any) {
    console.error('Session API error:', error)
    return NextResponse.json(
      { error: 'セッションの設定に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // セッションを削除
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Session deletion error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Session deletion API error:', error)
    return NextResponse.json(
      { error: 'セッションの削除に失敗しました' },
      { status: 500 }
    )
  }
} 