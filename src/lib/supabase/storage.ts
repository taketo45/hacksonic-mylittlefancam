import { supabase, getServiceSupabase } from './client';
import { v4 as uuidv4 } from 'uuid';

/**
 * 写真をアップロードする関数
 * @param file アップロードするファイル
 * @param bucket バケット名
 * @param folder フォルダ名
 * @returns アップロードされたファイルのURL
 */
export async function uploadPhoto(file: File, bucket: string = 'photos', folder: string = 'original'): Promise<string> {
  try {
    // ファイル名を生成（UUID + 元のファイル拡張子）
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    
    // ファイルをアップロード
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      throw error;
    }
    
    // アップロードされたファイルの公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('写真のアップロードに失敗しました:', error);
    throw error;
  }
}

/**
 * 写真をダウンロードする関数
 * @param url 写真のURL
 * @returns ダウンロードされたファイルのBlobとファイル名
 */
export async function downloadPhoto(url: string): Promise<{ blob: Blob, fileName: string }> {
  try {
    // URLからパスを抽出
    const path = url.split('/').pop();
    
    if (!path) {
      throw new Error('無効なURLです。');
    }
    
    // ファイルをダウンロード
    const response = await fetch(url);
    const blob = await response.blob();
    
    return { blob, fileName: path };
  } catch (error) {
    console.error('写真のダウンロードに失敗しました:', error);
    throw error;
  }
}

/**
 * 写真を削除する関数（管理者権限が必要）
 * @param url 削除する写真のURL
 * @param bucket バケット名
 * @returns 削除結果
 */
export async function deletePhoto(url: string, bucket: string = 'photos'): Promise<boolean> {
  try {
    // URLからパスを抽出
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf(bucket) + 1).join('/');
    
    // 管理者権限でファイルを削除
    const serviceClient = getServiceSupabase();
    const { error } = await serviceClient.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('写真の削除に失敗しました:', error);
    return false;
  }
}

/**
 * 写真のURLを一時的な署名付きURLに変換する関数
 * @param url 元のURL
 * @param bucket バケット名
 * @param expiresIn 有効期限（秒）
 * @returns 署名付きURL
 */
export async function getSignedUrl(url: string, bucket: string = 'photos', expiresIn: number = 60): Promise<string> {
  try {
    // URLからパスを抽出
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf(bucket) + 1).join('/');
    
    // 署名付きURLを取得
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);
    
    if (error) {
      throw error;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('署名付きURLの取得に失敗しました:', error);
    throw error;
  }
} 