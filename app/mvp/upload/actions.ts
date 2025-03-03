'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SAMPLE_USER_ID, SAMPLE_EVENT_ID, SAMPLE_EVENT_DATE, SAMPLE_EVENT_SLOT } from './constants'

/**
 * 写真をアップロードするサーバーアクション
 * @param formData フォームデータ
 * @returns アップロード結果
 */
export async function uploadPhoto(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) {
    return { success: false, error: 'ファイルが選択されていません' }
  }
  
  try {
    const supabase = createClient(true) // サービスロールキーを使用
    
    // フォルダパスを作成（イベント日付/イベントID/イベント枠/ユーザーID）
    const folderPath = `${SAMPLE_EVENT_DATE}/${SAMPLE_EVENT_ID}/${SAMPLE_EVENT_SLOT}/${SAMPLE_USER_ID}`
    
    // ファイル名を一意にするためにタイムスタンプを追加
    const timestamp = new Date().getTime()
    const fileName = `${timestamp}-${file.name}`
    
    // フォルダが存在するか確認し、存在しない場合は作成
    try {
      await supabase.storage.from('photos').list(folderPath)
    } catch (folderError) {
      console.log('フォルダが存在しないため作成します:', folderPath)
      // フォルダが存在しない場合は空ファイルをアップロードしてフォルダを作成
      await supabase.storage.from('photos').upload(`${folderPath}/.keep`, new Blob(['']))
    }
    
    // ファイルをアップロード
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(`${folderPath}/${fileName}`, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) {
      console.error('アップロードエラー:', error)
      return { success: false, error: `アップロードエラー: ${error.message}` }
    }
    
    // アップロードされたファイルの公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(`${folderPath}/${fileName}`)
    
    // メタデータをデータベースに保存（オプション）
    // 実際のアプリケーションでは、ここでファイルメタデータをデータベースに保存する
    
    // ページを再検証して最新の写真リストを表示
    revalidatePath('/mvp/upload')
    
    return { 
      success: true, 
      file: {
        name: fileName,
        url: publicUrl,
        path: data.path
      }
    }
  } catch (error) {
    console.error('アップロード処理エラー:', error)
    return { success: false, error: '写真のアップロード中にエラーが発生しました' }
  }
} 