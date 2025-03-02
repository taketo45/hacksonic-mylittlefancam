import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/print
 * 写真を印刷するAPI
 */
export async function POST(req: NextRequest) {
  try {
    // リクエストからデータを取得
    const data = await req.json();
    const { photoIds, printOptions } = data;
    
    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json(
        { error: '印刷する写真IDが必要です' },
        { status: 400 }
      );
    }
    
    // Supabaseクライアントを作成
    const supabase = createClient();
    
    // ハッカソンMVP用に認証チェックを省略
    // const { data: { session } } = await supabase.auth.getSession();
    // 
    // if (!session) {
    //   return NextResponse.json(
    //     { error: '認証されていません' },
    //     { status: 401 }
    //   );
    // }
    
    // ハッカソンMVP用にユーザーIDを固定値に設定
    const userId = 'demo-user-id';
    
    // 印刷ジョブを作成
    const printJobId = uuidv4();
    const printDate = new Date().toISOString();
    
    // 印刷情報をデータベースに保存する処理は省略
    // 実際のプロジェクトではここでDrizzleを使用してデータベースに保存
    
    // ハッカソンMVP用に印刷処理を模擬的に実行
    console.log(`印刷ジョブを作成しました: ${printJobId}`);
    console.log(`印刷対象の写真: ${photoIds.join(', ')}`);
    console.log(`印刷オプション: ${JSON.stringify(printOptions)}`);
    
    // 各写真の公開URLを取得
    const photoUrls = await Promise.all(
      photoIds.map(async (photoId) => {
        // 写真IDからファイル名を取得（実際のプロジェクトではDBから取得）
        const fileName = `${photoId}.jpg`;
        
        const { data: { publicUrl } } = supabase
          .storage
          .from('processed-photos')
          .getPublicUrl(fileName);
        
        return {
          id: photoId,
          url: publicUrl
        };
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      printJob: {
        id: printJobId,
        userId,
        photoIds,
        photoUrls,
        printDate,
        status: 'printing'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('写真印刷エラー:', error);
    
    return NextResponse.json(
      { error: '写真の印刷中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 