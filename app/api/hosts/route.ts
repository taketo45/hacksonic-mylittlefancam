import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as hostQueries from '@/src/db/queries';

/**
 * GET /api/hosts
 * 主催者一覧を取得するAPI
 */
export async function GET(req: NextRequest) {
  try {
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
    
    // 主催者一覧を取得
    const hosts = await hostQueries.getHosts();
    
    return NextResponse.json({ hosts });
  } catch (error) {
    console.error('主催者一覧取得エラー:', error);
    
    return NextResponse.json(
      { error: '主催者一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 