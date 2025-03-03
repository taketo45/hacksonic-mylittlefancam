import { NextRequest, NextResponse } from 'next/server';
import { eventQueries } from '@/src/db/queries';
import { createClient } from '@/lib/supabase/server';

/**
 * 特定のイベントを取得するAPI
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
    
    return NextResponse.json({ event });
  } catch (error) {
    console.error('イベント取得エラー:', error);
    return NextResponse.json(
      { error: 'イベントの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * イベントを更新するAPI
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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
    
    // イベントを更新
    const updatedEvent = await eventQueries.updateEvent(id, {
      eventName: body.eventName,
      eventStatus: body.eventStatus,
    });
    
    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error('イベント更新エラー:', error);
    return NextResponse.json(
      { error: 'イベントの更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * イベントを削除するAPI
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function DELETE(
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
        { error: 'このイベントを削除する権限がありません' },
        { status: 403 }
      );
    }
    
    // イベントを削除
    // 注意: 実際の実装では、関連するイベント枠やホスト-イベント関連も削除する必要があります
    // ここでは簡略化のため、イベントのステータスを「キャンセル」に変更するだけにしています
    const deletedEvent = await eventQueries.updateEvent(id, {
      eventStatus: 'キャンセル',
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('イベント削除エラー:', error);
    return NextResponse.json(
      { error: 'イベントの削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 