import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * イベント一覧を取得するAPI
 * @param req リクエスト
 * @returns レスポンス
 */
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // ユーザーのロール情報を取得
    const { data: userRoles, error: roleError } = await supabase
      .from('user_role_tbl')
      .select(`
        role_id,
        role_mst!inner (
          role_name
        )
      `)
      .eq('user_id', session.user.id)

    if (roleError) {
      throw roleError
    }

    const roleNames = userRoles?.map(role => role.role_mst.role_name) || []
    const isAuthorized = roleNames.some(name => ['organizer', 'admin'].includes(name))

    if (!isAuthorized) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // イベント一覧を取得
    const { data: events, error } = await supabase
      .from('event_tbl')
      .select(`
        event_id,
        event_name,
        event_status,
        created_at,
        updated_at,
        host_event_tbl (
          host_id,
          event_role
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

/**
 * 新規イベントを作成するAPI
 * @param req リクエスト
 * @returns レスポンス
 */
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // ユーザーのロール情報を取得
    const { data: userRoles, error: roleError } = await supabase
      .from('user_role_tbl')
      .select(`
        role_id,
        role_mst!inner (
          role_name
        )
      `)
      .eq('user_id', session.user.id)

    if (roleError) {
      throw roleError
    }

    const roleNames = userRoles?.map(role => role.role_mst.role_name) || []
    const isAuthorized = roleNames.some(name => ['organizer', 'admin'].includes(name))

    if (!isAuthorized) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await request.json()
    
    // イベントを作成
    const { data: eventData, error: eventError } = await supabase
      .from('event_tbl')
      .insert([{
        event_name: body.eventName,
        event_status: body.eventStatus || '準備中'
      }])
      .select()
      .single()

    if (eventError) {
      throw eventError
    }

    // host_event_tblにも登録
    const { error: hostEventError } = await supabase
      .from('host_event_tbl')
      .insert([{
        host_id: session.user.id,
        event_id: eventData.event_id,
        event_role: 'owner'
      }])

    if (hostEventError) {
      throw hostEventError
    }

    return NextResponse.json(eventData)
  } catch (error) {
    console.error('Error creating event:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 