import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/photos/processed
 * 加工済み写真一覧を取得するAPI
 */
export async function GET(req: NextRequest) {
  try {
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
    
    // Storageから加工済み写真一覧を取得
    const { data: photos, error } = await supabase
      .storage
      .from('processed-photos')
      .list('');
    
    if (error) {
      throw error;
    }
    
    // 各写真の公開URLを取得
    const photosWithUrls = photos.map(photo => {
      const { data: { publicUrl } } = supabase
        .storage
        .from('processed-photos')
        .getPublicUrl(photo.name);
      
      return {
        ...photo,
        url: publicUrl
      };
    });
    
    return NextResponse.json({ photos: photosWithUrls });
  } catch (error) {
    console.error('加工済み写真一覧取得エラー:', error);
    
    return NextResponse.json(
      { error: '加工済み写真一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/photos/processed
 * 加工済み写真を保存するAPI
 */
export async function POST(req: NextRequest) {
  try {
    // リクエストからデータを取得
    const data = await req.json();
    const { imageData, originalPhotoId, editSettings } = data;
    
    if (!imageData) {
      return NextResponse.json(
        { error: '画像データが必要です' },
        { status: 400 }
      );
    }
    
    // Base64データをバイナリに変換
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
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
    
    // ファイル名を生成（一意のIDを使用）
    const fileName = `${uuidv4()}.jpg`;
    
    // Storageにアップロード
    const { data: uploadData, error } = await supabase
      .storage
      .from('processed-photos')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      throw error;
    }
    
    // アップロードされたファイルの公開URLを取得
    const { data: { publicUrl } } = supabase
      .storage
      .from('processed-photos')
      .getPublicUrl(fileName);
    
    // 加工済み写真情報をデータベースに保存（実際のプロジェクトではDrizzleを使用）
    const processedPhotoId = uuidv4();
    
    // ハッカソンMVP用にユーザーIDを固定値に設定
    const userId = 'demo-user-id';
    
    // 加工済み写真情報をデータベースに保存する処理は省略
    // 実際のプロジェクトではここでDrizzleを使用してデータベースに保存
    
    return NextResponse.json({ 
      success: true, 
      processedPhoto: {
        id: processedPhotoId,
        url: publicUrl,
        path: uploadData.path,
        originalPhotoId,
        editSettings
      }
    }, { status: 201 });
  } catch (error) {
    console.error('加工済み写真保存エラー:', error);
    
    return NextResponse.json(
      { error: '加工済み写真の保存中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 