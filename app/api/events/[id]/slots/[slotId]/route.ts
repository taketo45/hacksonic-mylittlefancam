import { NextRequest, NextResponse } from 'next/server';
import { eventQueries } from '@/src/db/queries';
import { createClient } from '@/lib/supabase/server';

/**
 * 特定のイベント枠を取得するAPI
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; slotId: string } }
) {
  try {
    const { id, slotId } = params;
    
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
    const eventSlot = await eventQueries.getEventSlotById(slotId);
    
    if (!eventSlot) {
      return NextResponse.json(
        { error: 'イベント枠が見つかりませんでした' },
        { status: 404 }
      );
    }
    
    // イベント枠が指定されたイベントに属しているかチェック
    if (eventSlot.eventId !== id) {
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
 * イベント枠を更新するAPI
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; slotId: string } }
) {
  try {
    const { id, slotId } = params;
    
    // リクエストボディを取得
    const body = await req.json();
    
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
        { error: 'このイベントを更新する権限がありません' },
        { status: 403 }
      );
    }
    
    // イベント枠を取得
    const eventSlot = await eventQueries.getEventSlotById(slotId);
    
    if (!eventSlot) {
      return NextResponse.json(
        { error: 'イベント枠が見つかりませんでした' },
        { status: 404 }
      );
    }
    
    // イベント枠が指定されたイベントに属しているかチェック
    if (eventSlot.eventId !== id) {
      return NextResponse.json(
        { error: 'このイベント枠は指定されたイベントに属していません' },
        { status: 400 }
      );
    }
    
    // イベント枠を更新
    const updatedEventSlot = await eventQueries.updateEventSlot(slotId, {
      eventSlotName: body.eventSlotName,
      eventDate: body.eventDate,
      eventTime: body.eventTime,
      facilityId: body.facilityId,
      geoCode: body.geoCode,
      eventSlotDetail: body.eventSlotDetail,
      eventSlotStatus: body.eventSlotStatus,
      ticketUrl: body.ticketUrl,
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
 * イベント枠を削除するAPI
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; slotId: string } }
) {
  try {
    const { id, slotId } = params;
    
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
        { error: 'このイベントを削除する権限がありません' },
        { status: 403 }
      );
    }
    
    // イベント枠を取得
    const eventSlot = await eventQueries.getEventSlotById(slotId);
    
    if (!eventSlot) {
      return NextResponse.json(
        { error: 'イベント枠が見つかりませんでした' },
        { status: 404 }
      );
    }
    
    // イベント枠が指定されたイベントに属しているかチェック
    if (eventSlot.eventId !== id) {
      return NextResponse.json(
        { error: 'このイベント枠は指定されたイベントに属していません' },
        { status: 400 }
      );
    }
    
    // イベント枠を削除
    // 注意: 実際の実装では、関連するデータも削除する必要があります
    // ここでは簡略化のため、イベント枠のステータスを「キャンセル」に変更するだけにしています
    const deletedEventSlot = await eventQueries.updateEventSlot(slotId, {
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