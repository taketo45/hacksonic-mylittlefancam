import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/photos
 * アップロードされた写真一覧を取得するAPI
 */
export async function GET(req: NextRequest) {
  try {
    // クエリパラメータからイベントIDとイベント枠IDを取得
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const eventSlotId = searchParams.get('eventSlotId');
    const facesOnly = searchParams.get('facesOnly') === 'true'; // 顔写真のみを取得するかどうか
    
    console.log('写真一覧取得パラメータ:', { eventId, eventSlotId, facesOnly });
    
    // Supabaseクライアントを作成
    // ハッカソンMVP用に一時的にサービスロールキーを使用
    const supabase = createClient(true); // サービスロールキーを使用
    
    let path = '';
    
    // パスの構築
    if (eventId && eventId !== 'null' && eventId !== '' && 
        eventSlotId && eventSlotId !== 'null' && eventSlotId !== '') {
      path = `${eventId}/${eventSlotId}`;
    } else if (eventId && eventId !== 'null' && eventId !== '') {
      path = eventId;
    } else {
      // イベント情報がない場合は一時フォルダを参照
      path = 'temp';
    }
    
    console.log('写真一覧取得パス:', path);
    
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
        console.error('写真一覧取得エラー:', error);
        return NextResponse.json(
          { error: `写真一覧の取得に失敗しました: ${error.message}` },
          { status: 500 }
        );
      }
      
      if (!data || data.length === 0) {
        return NextResponse.json([]);
      }
      
      // 写真のURLを取得
      let photos = data.map(item => {
        const filePath = path ? `${path}/${item.name}` : item.name;
        const { data: { publicUrl } } = supabase
          .storage
          .from('photos')
          .getPublicUrl(filePath);
        
        return {
          id: item.id || uuidv4(),
          name: item.name,
          url: publicUrl,
          size: item.metadata?.size,
          created: item.created_at,
          path: filePath,
          // 顔検出情報を追加（実際のアプリでは、データベースから取得するか、画像解析サービスを使用）
          hasFaces: Math.random() > 0.3, // 70%の確率で顔ありとする（デモ用）
          faceCount: Math.floor(Math.random() * 4) + 1 // 1〜4人の顔（デモ用）
        };
      });
      
      // facesOnlyパラメータが指定されている場合、顔が含まれている写真のみをフィルタリング
      if (facesOnly) {
        console.log('顔写真のみをフィルタリングします');
        photos = photos.filter(photo => photo.hasFaces);
      }
      
      return NextResponse.json(photos);
    } catch (listError) {
      console.error('写真一覧取得中の例外:', listError);
      // フォルダが存在しない場合は空配列を返す
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('写真一覧取得例外:', error);
    
    return NextResponse.json(
      { error: '写真一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/photos
 * 写真をアップロードするAPI
 */
export async function POST(req: NextRequest) {
  try {
    // リクエストからフォームデータを取得
    const formData = await req.formData();
    
    // フォームデータの詳細なデバッグ
    const formDataEntries = [...formData.entries()].map(([key, value]) => {
      if (value instanceof File) {
        return [key, `File: ${value.name} (${value.size} bytes)`];
      }
      return [key, value];
    });
    
    console.log('受信したフォームデータ:', formDataEntries);
    
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;
    const eventSlotId = formData.get('eventSlotId') as string;
    
    console.log('アップロード情報 (詳細):', { 
      fileExists: !!file, 
      fileName: file?.name,
      fileSize: file?.size,
      eventId: eventId || 'なし',
      eventSlotId: eventSlotId || 'なし',
      eventIdType: typeof eventId,
      eventSlotIdType: typeof eventSlotId,
      eventIdEmpty: eventId === '',
      eventSlotIdEmpty: eventSlotId === '',
      eventIdNull: eventId === 'null',
      eventSlotIdNull: eventSlotId === 'null'
    });
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが必要です' },
        { status: 400 }
      );
    }
    
    // ファイル名を生成（一意のIDを使用）
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${file.name}`;
    
    // フォルダパスの構築
    // nullチェックを強化
    let folderPath = 'temp'; // デフォルトは一時フォルダ
    
    if (eventId && eventId !== 'null' && eventId !== '' && 
        eventSlotId && eventSlotId !== 'null' && eventSlotId !== '') {
      folderPath = `${eventId}/${eventSlotId}`;
    } else if (eventId && eventId !== 'null' && eventId !== '') {
      folderPath = eventId;
    }
    
    console.log('アップロードパス (詳細):', {
      folderPath,
      fullPath: `${folderPath}/${fileName}`
    });
    
    // Supabaseクライアントを作成
    // ハッカソンMVP用に一時的にサービスロールキーを使用
    const supabase = createClient(true); // サービスロールキーを使用
    
    // Storageにアップロード
    console.log('Supabaseアップロード開始:', `${folderPath}/${fileName}`);
    
    try {
      // フォルダが存在するか確認し、存在しない場合は作成
      try {
        await supabase.storage.from('photos').list(folderPath);
      } catch (folderError) {
        console.log('フォルダが存在しないため作成します:', folderPath);
        // フォルダが存在しない場合は空ファイルをアップロードしてフォルダを作成
        await supabase.storage.from('photos').upload(`${folderPath}/.keep`, new Blob(['']));
      }
      
      // 実際のファイルをアップロード
      const { data, error } = await supabase
        .storage
        .from('photos')
        .upload(`${folderPath}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true  // 既存ファイルを上書き
        });
      
      if (error) {
        console.error('Supabaseアップロードエラー詳細:', JSON.stringify(error, null, 2));
        return NextResponse.json(
          { error: `アップロードエラー: ${error.message}` },
          { status: 500 }
        );
      }
      
      console.log('Supabaseアップロード成功:', data);
      
      // アップロードされたファイルの公開URLを取得
      const { data: { publicUrl } } = supabase
        .storage
        .from('photos')
        .getPublicUrl(`${folderPath}/${fileName}`);
      
      console.log('生成された公開URL:', publicUrl);
      
      // 成功レスポンス
      return NextResponse.json({ 
        success: true, 
        file: {
          name: fileName,
          url: publicUrl,
          path: data.path
        }
      }, { status: 201 });
    } catch (uploadError) {
      console.error('アップロード処理中の例外:', uploadError);
      return NextResponse.json(
        { error: `アップロード処理中にエラーが発生しました: ${uploadError instanceof Error ? uploadError.message : '不明なエラー'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('写真アップロード例外 (詳細):', error);
    
    return NextResponse.json(
      { error: '写真のアップロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 