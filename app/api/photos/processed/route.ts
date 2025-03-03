import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/photos/processed
 * 加工済み写真一覧を取得するAPI
 */
export async function GET(req: NextRequest) {
  try {
    // クエリパラメータからイベントIDとイベント枠IDを取得
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const eventSlotId = searchParams.get('eventSlotId');
    
    console.log('加工済み写真一覧取得パラメータ:', { eventId, eventSlotId });
    
    // Supabaseクライアントを作成
    // ハッカソンMVP用に一時的にサービスロールキーを使用
    const supabase = createClient(true); // サービスロールキーを使用
    
    let path = 'processed';
    
    // パスの構築
    if (eventId && eventId !== 'null' && eventId !== '' && 
        eventSlotId && eventSlotId !== 'null' && eventSlotId !== '') {
      path = `processed/${eventId}/${eventSlotId}`;
    } else if (eventId && eventId !== 'null' && eventId !== '') {
      path = `processed/${eventId}`;
    }
    
    console.log('加工済み写真一覧取得パス:', path);
    
    try {
      // Storageから写真一覧を取得
      const { data, error } = await supabase
        .storage
        .from('photos')
        .list(path, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        console.error('加工済み写真一覧取得エラー:', error);
        return NextResponse.json(
          { error: `加工済み写真一覧の取得に失敗しました: ${error.message}` },
          { status: 500 }
        );
      }
      
      if (!data || data.length === 0) {
        return NextResponse.json([]);
      }
      
      // 写真のURLを取得
      const photos = data.map(item => {
        const filePath = path ? `${path}/${item.name}` : item.name;
        const { data: { publicUrl } } = supabase
          .storage
          .from('photos')
          .getPublicUrl(filePath);
        
        return {
          name: item.name,
          url: publicUrl,
          size: item.metadata?.size,
          created: item.created_at,
          path: filePath
        };
      });
      
      return NextResponse.json(photos);
    } catch (listError) {
      console.error('加工済み写真一覧取得中の例外:', listError);
      // フォルダが存在しない場合は空配列を返す
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('加工済み写真一覧取得例外:', error);
    
    return NextResponse.json(
      { error: '加工済み写真一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/photos/processed
 * 加工済み写真をアップロードするAPI
 */
export async function POST(req: NextRequest) {
  try {
    // リクエストからJSONデータを取得
    const data = await req.json();
    const { imageData, originalPhotoId, processedInfo } = data;
    
    if (!imageData) {
      return NextResponse.json(
        { error: '画像データが必要です' },
        { status: 400 }
      );
    }
    
    // Base64データからバイナリデータに変換
    const base64Data = imageData.split(',')[1];
    const binaryData = Buffer.from(base64Data, 'base64');
    
    // ファイル名を生成（一意のIDを使用）
    const fileName = `${Date.now()}-processed-${uuidv4()}.jpg`;
    
    // フォルダパスの構築
    const folderPath = 'processed';
    
    console.log('加工済み写真アップロードパス:', `${folderPath}/${fileName}`);
    
    // Supabaseクライアントを作成
    // ハッカソンMVP用に一時的にサービスロールキーを使用
    const supabase = createClient(true); // サービスロールキーを使用
    
    try {
      // フォルダが存在するか確認し、存在しない場合は作成
      try {
        await supabase.storage.from('photos').list(folderPath);
      } catch (folderError) {
        console.log('フォルダが存在しないため作成します:', folderPath);
        // フォルダが存在しない場合は空ファイルをアップロードしてフォルダを作成
        await supabase.storage.from('photos').upload(`${folderPath}/.keep`, new Blob(['']));
      }
      
      // Storageにアップロード
      const { data: uploadData, error } = await supabase
        .storage
        .from('photos')
        .upload(`${folderPath}/${fileName}`, binaryData, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('加工済み写真アップロードエラー:', error);
        return NextResponse.json(
          { error: `加工済み写真のアップロードに失敗しました: ${error.message}` },
          { status: 500 }
        );
      }
      
      // アップロードされたファイルの公開URLを取得
      const { data: { publicUrl } } = supabase
        .storage
        .from('photos')
        .getPublicUrl(`${folderPath}/${fileName}`);
      
      // 成功レスポンス
      return NextResponse.json({ 
        success: true, 
        file: {
          name: fileName,
          url: publicUrl,
          path: uploadData.path,
          originalPhotoId,
          processedInfo
        }
      }, { status: 201 });
    } catch (uploadError) {
      console.error('加工済み写真アップロード処理中の例外:', uploadError);
      return NextResponse.json(
        { error: `加工済み写真アップロード処理中にエラーが発生しました: ${uploadError instanceof Error ? uploadError.message : '不明なエラー'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('加工済み写真アップロード例外:', error);
    
    return NextResponse.json(
      { error: '加工済み写真のアップロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 