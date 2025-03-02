import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/photos
 * アップロードされた写真一覧を取得するAPI
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
    
    // Storageから写真一覧を取得
    const { data: photos, error } = await supabase
      .storage
      .from('photos')
      .list('');
    
    if (error) {
      throw error;
    }
    
    // 各写真の公開URLを取得
    const photosWithUrls = photos.map(photo => {
      const { data: { publicUrl } } = supabase
        .storage
        .from('photos')
        .getPublicUrl(photo.name);
      
      return {
        ...photo,
        url: publicUrl
      };
    });
    
    return NextResponse.json({ photos: photosWithUrls });
  } catch (error) {
    console.error('写真一覧取得エラー:', error);
    
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
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが必要です' },
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
    
    // ファイル名を生成（一意のIDを使用）
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    // Storageにアップロード
    const { data, error } = await supabase
      .storage
      .from('photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      throw error;
    }
    
    // アップロードされたファイルの公開URLを取得
    const { data: { publicUrl } } = supabase
      .storage
      .from('photos')
      .getPublicUrl(fileName);
    
    return NextResponse.json({ 
      success: true, 
      file: {
        name: fileName,
        url: publicUrl,
        path: data.path
      }
    }, { status: 201 });
  } catch (error) {
    console.error('写真アップロードエラー:', error);
    
    return NextResponse.json(
      { error: '写真のアップロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 