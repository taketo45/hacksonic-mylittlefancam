import { NextRequest, NextResponse } from 'next/server';
import { eventQueries } from '@/src/db/queries';
import { createClient } from '@/lib/supabase/server';

/**
 * イベント一覧を取得するAPI
 * @param req リクエスト
 * @returns レスポンス
 */
export async function GET(req: NextRequest) {
  try {
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
    
    // ユーザーが主催者のイベントを取得
    const events = await eventQueries.getEventsByHostId(user.id);
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error('イベント一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'イベント一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * 新規イベントを作成するAPI
 * @param req リクエスト
 * @returns レスポンス
 */
export async function POST(req: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await req.json();
    
    // 必須フィールドの検証
    if (!body.eventName) {
      return NextResponse.json(
        { error: 'イベント名は必須です' },
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
    
    // イベントを作成
    const event = await eventQueries.createEvent({
      hostId: user.id,
      eventName: body.eventName,
      eventStatus: body.eventStatus,
      eventRole: body.eventRole,
    });
    
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('イベント作成エラー:', error);
    return NextResponse.json(
      { error: 'イベントの作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 