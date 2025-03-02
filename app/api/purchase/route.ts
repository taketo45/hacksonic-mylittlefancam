import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/purchase
 * 写真を購入するAPI
 */
export async function POST(req: NextRequest) {
  try {
    // リクエストからデータを取得
    const data = await req.json();
    const { photoIds, printOptions } = data;
    
    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json(
        { error: '購入する写真IDが必要です' },
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
    
    // 購入情報を生成
    const purchaseId = uuidv4();
    const purchaseDate = new Date().toISOString();
    const totalAmount = photoIds.length * 500; // 1枚500円と仮定
    
    // 購入情報をデータベースに保存する処理は省略
    // 実際のプロジェクトではここでDrizzleを使用してデータベースに保存
    
    // 印刷オプションがある場合の処理
    let printJobId = null;
    if (printOptions && printOptions.enabled) {
      // 印刷ジョブを作成する処理は省略
      // 実際のプロジェクトではここでEpson Connect APIを使用して印刷ジョブを作成
      printJobId = uuidv4();
      
      // ハッカソンMVP用に印刷処理を模擬的に実行
      console.log(`印刷ジョブを作成しました: ${printJobId}`);
      console.log(`印刷対象の写真: ${photoIds.join(', ')}`);
      console.log(`印刷オプション: ${JSON.stringify(printOptions)}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      purchase: {
        id: purchaseId,
        userId,
        photoIds,
        totalAmount,
        purchaseDate,
        printJobId,
        status: 'completed'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('写真購入エラー:', error);
    
    return NextResponse.json(
      { error: '写真の購入中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 