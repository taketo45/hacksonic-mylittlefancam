import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as eventQueries from '@/src/db/queries';

/**
 * GET /api/events/[id]/slots
 * イベントに紐づくイベント枠一覧を取得するAPI
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // イベントIDを取得
    const eventId = params.id;
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'イベントIDが必要です' },
        { status: 400 }
      );
    }
    
    // Supabaseクライアントを作成
    const supabase = createClient();
    
    // セッションを取得して認証チェック
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    // イベントを取得して主催者かどうかを確認
    const event = await eventQueries.getEventById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      );
    }
    
    // イベント枠一覧を取得
    const eventSlots = await eventQueries.getEventSlotsByEventId(eventId);
    
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
 * POST /api/events/[id]/slots
 * イベント枠を作成するAPI
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // イベントIDを取得
    const eventId = params.id;
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'イベントIDが必要です' },
        { status: 400 }
      );
    }
    
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
    
    // セッションを取得して認証チェック
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    // イベントを取得して主催者かどうかを確認
    const event = await eventQueries.getEventById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      );
    }
    
    // イベント枠を作成
    const eventSlot = await eventQueries.createEventSlot({
      eventId,
      eventSlotName: body.eventSlotName,
      eventDate: body.eventDate,
      eventTime: body.eventTime,
      facilityName: body.facilityName,
      facilityAddress: body.facilityAddress,
      facilityPhone: body.facilityPhone,
      eventSlotDetail: body.eventSlotDetail,
      photographerId: body.photographerId,
      basePrice: body.basePrice,
      eventSlotStatus: body.eventSlotStatus || '準備中',
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