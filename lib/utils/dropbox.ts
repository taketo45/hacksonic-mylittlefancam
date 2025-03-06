import { Dropbox } from 'dropbox';
import fetch from 'isomorphic-fetch';
import { v4 as uuidv4 } from 'uuid';

// Dropboxクライアントの初期化
const dropbox = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch,
});

/**
 * Dropboxに写真をアップロードする関数
 * @param file アップロードするファイル（Buffer）
 * @param path 保存先のパス
 * @returns アップロード結果
 */
export async function uploadToDropbox(file: Buffer, path: string): Promise<string> {
  try {
    // パスが/で始まっていない場合は追加
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // ファイルをアップロード
    const response = await dropbox.filesUpload({
      path,
      contents: file,
      mode: { '.tag': 'overwrite' },
      autorename: true,
    });
    
    // 共有リンクを作成
    const shareResponse = await dropbox.sharingCreateSharedLink({
      path: response.result.path_display || '',
    });
    
    // 共有URLを返す
    return shareResponse.result.url;
  } catch (error) {
    console.error('Dropboxへのアップロードに失敗しました:', error);
    throw error;
  }
}

/**
 * Dropboxから写真をダウンロードする関数
 * @param path ファイルのパス
 * @returns ダウンロードしたファイルのBuffer
 */
export async function downloadFromDropbox(path: string): Promise<Buffer> {
  try {
    // パスが/で始まっていない場合は追加
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // ファイルをダウンロード
    const response = await dropbox.filesDownload({ path });
    
    // @ts-ignore - filesDownloadのレスポンス型定義が不完全なため
    const fileBuffer = response.result.fileBinary;
    
    return fileBuffer;
  } catch (error) {
    console.error('Dropboxからのダウンロードに失敗しました:', error);
    throw error;
  }
}

/**
 * Dropboxのフォルダ内のファイル一覧を取得する関数
 * @param folderPath フォルダのパス
 * @returns ファイル一覧
 */
export async function listDropboxFolder(folderPath: string = '') {
  try {
    // パスが/で始まっていない場合は追加
    if (folderPath && !folderPath.startsWith('/')) {
      folderPath = '/' + folderPath;
    }
    
    // フォルダ内のファイル一覧を取得
    const response = await dropbox.filesListFolder({
      path: folderPath,
      recursive: false,
    });
    
    return response.result.entries;
  } catch (error) {
    console.error('Dropboxフォルダの一覧取得に失敗しました:', error);
    throw error;
  }
}

/**
 * Dropboxのファイルを削除する関数
 * @param path ファイルのパス
 * @returns 削除結果
 */
export async function deleteFromDropbox(path: string): Promise<boolean> {
  try {
    // パスが/で始まっていない場合は追加
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // ファイルを削除
    await dropbox.filesDelete({ path });
    
    return true;
  } catch (error) {
    console.error('Dropboxからの削除に失敗しました:', error);
    return false;
  }
}

/**
 * Dropboxにフォルダを作成する関数
 * @param path フォルダのパス
 * @returns 作成結果
 */
export async function createDropboxFolder(path: string): Promise<boolean> {
  try {
    // パスが/で始まっていない場合は追加
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // フォルダを作成
    await dropbox.filesCreateFolderV2({ path });
    
    return true;
  } catch (error) {
    console.error('Dropboxフォルダの作成に失敗しました:', error);
    return false;
  }
}

/**
 * イベント用のDropboxフォルダを作成する関数
 * @param eventId イベントID
 * @returns フォルダパス
 */
export async function createEventFolder(eventId: string): Promise<string> {
  try {
    const folderPath = `/events/${eventId}`;
    
    // フォルダを作成
    await createDropboxFolder(folderPath);
    
    return folderPath;
  } catch (error) {
    console.error('イベントフォルダの作成に失敗しました:', error);
    throw error;
  }
}

/**
 * イベントにファイルをアップロードする関数
 * @param eventId イベントID
 * @param file アップロードするファイル（Buffer）
 * @param fileName ファイル名
 * @returns アップロード結果
 */
export async function uploadEventPhoto(eventId: string, file: Buffer, fileName: string): Promise<string> {
  try {
    // ファイル名が重複しないようにUUIDを追加
    const uniqueFileName = `${uuidv4()}_${fileName}`;
    const filePath = `/events/${eventId}/${uniqueFileName}`;
    
    // ファイルをアップロード
    return await uploadToDropbox(file, filePath);
  } catch (error) {
    console.error('イベント写真のアップロードに失敗しました:', error);
    throw error;
  }
} 