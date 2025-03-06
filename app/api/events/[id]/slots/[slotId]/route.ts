import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as queries from '@/lib/db/queries';

/**
 * GET /api/events/[id]/slots/[slotId]
 * イベント枠の詳細を取得するAPI
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; slotId: string } }
) {
  try {
    // パラメータを取得
    const eventId = params.id;
    const eventSlotId = params.slotId;
    
    if (!eventId || !eventSlotId) {
      return NextResponse.json(
        { error: 'イベントIDとイベント枠IDが必要です' },
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
    const event = await queries.eventQueries.getEventById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      );
    }
    
    // イベント枠を取得
    const eventSlot = await queries.eventQueries.getEventSlotById(eventSlotId);
    
    if (!eventSlot) {
      return NextResponse.json(
        { error: 'イベント枠が見つかりません' },
        { status: 404 }
      );
    }
    
    // イベント枠が指定されたイベントに属しているか確認
    if (eventSlot.eventId !== eventId) {
      return NextResponse.json(
        { error: 'このイベント枠は指定されたイベントに属していません' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ eventSlot });
  } catch (error) {
    console.error('イベント枠取得エラー:', error);
    
    return NextResponse.json(
      { error: 'イベント枠の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/events/[id]/slots/[slotId]
 * イベント枠を更新するAPI
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; slotId: string } }
) {
  try {
    // パラメータを取得
    const eventId = params.id;
    const eventSlotId = params.slotId;
    
    if (!eventId || !eventSlotId) {
      return NextResponse.json(
        { error: 'イベントIDとイベント枠IDが必要です' },
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
    const event = await queries.eventQueries.getEventById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      );
    }
    
    // イベント枠を取得
    const eventSlot = await queries.eventQueries.getEventSlotById(eventSlotId);
    
    if (!eventSlot) {
      return NextResponse.json(
        { error: 'イベント枠が見つかりません' },
        { status: 404 }
      );
    }
    
    // イベント枠が指定されたイベントに属しているか確認
    if (eventSlot.eventId !== eventId) {
      return NextResponse.json(
        { error: 'このイベント枠は指定されたイベントに属していません' },
        { status: 400 }
      );
    }
    
    // イベント枠を更新
    const updatedEventSlot = await queries.eventQueries.updateEventSlot(eventSlotId, {
      eventSlotName: body.eventSlotName,
      eventDate: body.eventDate,
      eventTime: body.eventTime,
      facilityName: body.facilityName,
      facilityAddress: body.facilityAddress,
      facilityPhone: body.facilityPhone,
      eventSlotDetail: body.eventSlotDetail,
      photographerId: body.photographerId,
      basePrice: body.basePrice,
      eventSlotStatus: body.eventSlotStatus,
    });
    
    return NextResponse.json({ eventSlot: updatedEventSlot });
  } catch (error) {
    console.error('イベント枠更新エラー:', error);
    
    return NextResponse.json(
      { error: 'イベント枠の更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[id]/slots/[slotId]
 * イベント枠を削除するAPI
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; slotId: string } }
) {
  try {
    // パラメータを取得
    const eventId = params.id;
    const eventSlotId = params.slotId;
    
    if (!eventId || !eventSlotId) {
      return NextResponse.json(
        { error: 'イベントIDとイベント枠IDが必要です' },
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
    const event = await queries.eventQueries.getEventById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      );
    }
    
    // イベント枠を取得
    const eventSlot = await queries.eventQueries.getEventSlotById(eventSlotId);
    
    if (!eventSlot) {
      return NextResponse.json(
        { error: 'イベント枠が見つかりません' },
        { status: 404 }
      );
    }
    
    // イベント枠が指定されたイベントに属しているか確認
    if (eventSlot.eventId !== eventId) {
      return NextResponse.json(
        { error: 'このイベント枠は指定されたイベントに属していません' },
        { status: 400 }
      );
    }
    
    // イベント枠を削除（ステータスをキャンセルに変更）
    await queries.eventQueries.updateEventSlot(eventSlotId, {
      eventSlotStatus: 'キャンセル',
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('イベント枠削除エラー:', error);
    
    return NextResponse.json(
      { error: 'イベント枠の削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 