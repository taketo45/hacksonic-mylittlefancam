import { NextRequest, NextResponse } from 'next/server';
import { eventQueries } from '@/src/db/queries';
import { createClient } from '@/lib/supabase/server';

/**
 * イベント枠一覧を取得するAPI
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Supabaseクライアントを作成
    const supabase = createClient();
    
    // ユーザー情報を取得
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが認証されていません' },
        { status: 401 }
      );
    }
    
    // イベントを取得
    const event = await eventQueries.getEventById(id);
    
    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりませんでした' },
        { status: 404 }
      );
    }
    
    // ユーザーがイベントの主催者かチェック
    const isOrganizer = event.hostEvents.some((he: { hostId: string }) => he.hostId === user.id);
    
    if (!isOrganizer) {
      return NextResponse.json(
        { error: 'このイベントにアクセスする権限がありません' },
        { status: 403 }
      );
    }
    
    // イベント枠を取得
    const eventSlots = await eventQueries.getEventSlotsByEventId(id);
    
    return NextResponse.json({ eventSlots });
  } catch (error) {
    console.error('イベント枠一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'イベント枠一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * 新規イベント枠を作成するAPI
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // リクエストボディを取得
    const body = await req.json();
    
    // 必須フィールドの検証
    if (!body.eventSlotName) {
      return NextResponse.json(
        { error: 'イベント枠名は必須です' },
        { status: 400 }
      );
    }
    
    // Supabaseクライアントを作成
    const supabase = createClient();
    
    // ユーザー情報を取得
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが認証されていません' },
        { status: 401 }
      );
    }
    
    // イベントを取得
    const event = await eventQueries.getEventById(id);
    
    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりませんでした' },
        { status: 404 }
      );
    }
    
    // ユーザーがイベントの主催者かチェック
    const isOrganizer = event.hostEvents.some((he: { hostId: string }) => he.hostId === user.id);
    
    if (!isOrganizer) {
      return NextResponse.json(
        { error: 'このイベントに枠を追加する権限がありません' },
        { status: 403 }
      );
    }
    
    // イベント枠を作成
    const eventSlot = await eventQueries.createEventSlot({
      eventId: id,
      eventSlotName: body.eventSlotName,
      eventDate: body.eventDate,
      eventTime: body.eventTime,
      facilityId: body.facilityId,
      geoCode: body.geoCode,
      eventSlotDetail: body.eventSlotDetail,
      eventSlotStatus: body.eventSlotStatus,
      ticketUrl: body.ticketUrl,
    });
    
    return NextResponse.json({ eventSlot }, { status: 201 });
  } catch (error) {
    console.error('イベント枠作成エラー:', error);
    return NextResponse.json(
      { error: 'イベント枠の作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 