import { 
  uploadToDropbox, 
  downloadFromDropbox, 
  listDropboxFolder, 
  deleteFromDropbox, 
  createDropboxFolder, 
  createEventFolder, 
  uploadEventPhoto 
} from '../../lib/utils/dropbox';
import { Dropbox } from 'dropbox';
import { v4 as uuidv4 } from 'uuid';
import 'isomorphic-fetch';

// Dropboxのモック
jest.mock('dropbox', () => {
  const mockDropbox = {
    filesUpload: jest.fn().mockResolvedValue({
      result: {
        id: 'id:123456789',
        name: 'test-file.jpg',
        path_display: '/test/test-file.jpg',
      },
    }),
    sharingCreateSharedLink: jest.fn().mockResolvedValue({
      result: {
        url: 'https://www.dropbox.com/s/abc123/test-file.jpg',
      },
    }),
    filesDownload: jest.fn().mockResolvedValue({
      result: {
        fileBinary: Buffer.from('mock-file-data'),
        name: 'test-file.jpg',
      },
    }),
    filesListFolder: jest.fn().mockResolvedValue({
      result: {
        entries: [
          {
            '.tag': 'file',
            id: 'id:123456789',
            name: 'test-file.jpg',
            path_display: '/test/test-file.jpg',
          },
          {
            '.tag': 'folder',
            id: 'id:987654321',
            name: 'test-folder',
            path_display: '/test/test-folder',
          },
        ],
      },
    }),
    filesDelete: jest.fn().mockResolvedValue({
      result: {
        id: 'id:123456789',
        name: 'test-file.jpg',
        path_display: '/test/test-file.jpg',
      },
    }),
    filesCreateFolderV2: jest.fn().mockResolvedValue({
      result: {
        metadata: {
          id: 'id:987654321',
          name: 'test-folder',
          path_display: '/test/test-folder',
        },
      },
    }),
  };

  return {
    Dropbox: jest.fn().mockImplementation(() => mockDropbox),
  };
});

// uuidのモック
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid'),
}));

describe('Dropbox連携ユーティリティのテスト', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
  });
  
  test('uploadToDropbox: ファイルをアップロードできること', async () => {
    // モックデータを作成
    const fileData = Buffer.from('mock-file-data');
    const path = 'test/test-file.jpg';
    
    // アップロード処理を実行
    const result = await uploadToDropbox(fileData, path);
    
    // 結果を検証
    expect(result).toBe('https://www.dropbox.com/s/abc123/test-file.jpg');
    
    // Dropboxのメソッドが正しく呼ばれたか検証
    const dropboxInstance = new Dropbox({});
    expect(dropboxInstance.filesUpload).toHaveBeenCalledWith({
      path: '/test/test-file.jpg',
      contents: fileData,
      mode: { '.tag': 'overwrite' },
      autorename: true,
    });
    expect(dropboxInstance.sharingCreateSharedLink).toHaveBeenCalledWith({
      path: '/test/test-file.jpg',
    });
  });
  
  test('downloadFromDropbox: ファイルをダウンロードできること', async () => {
    // ダウンロード処理を実行
    const result = await downloadFromDropbox('/test/test-file.jpg');
    
    // 結果を検証
    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString()).toBe('mock-file-data');
    
    // Dropboxのメソッドが正しく呼ばれたか検証
    const dropboxInstance = new Dropbox({});
    expect(dropboxInstance.filesDownload).toHaveBeenCalledWith({
      path: '/test/test-file.jpg',
    });
  });
  
  test('listDropboxFolder: フォルダ内のファイル一覧を取得できること', async () => {
    // フォルダ一覧取得処理を実行
    const result = await listDropboxFolder('test');
    
    // 結果を検証
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    if (result) {
      expect(result.length).toBe(2);
      if (result.length >= 2) {
        expect(result[0].name).toBe('test-file.jpg');
        expect(result[1].name).toBe('test-folder');
      }
    }
    
    // Dropboxのメソッドが正しく呼ばれたか検証
    const dropboxInstance = new Dropbox({});
    expect(dropboxInstance.filesListFolder).toHaveBeenCalledWith({
      path: '/test',
      recursive: false,
    });
  });
  
  test('deleteFromDropbox: ファイルを削除できること', async () => {
    // ファイル削除処理を実行
    const result = await deleteFromDropbox('/test/test-file.jpg');
    
    // 結果を検証
    expect(result).toBe(true);
    
    // Dropboxのメソッドが正しく呼ばれたか検証
    const dropboxInstance = new Dropbox({});
    expect(dropboxInstance.filesDelete).toHaveBeenCalledWith({
      path: '/test/test-file.jpg',
    });
  });
  
  test('createDropboxFolder: フォルダを作成できること', async () => {
    // フォルダ作成処理を実行
    const result = await createDropboxFolder('test/test-folder');
    
    // 結果を検証
    expect(result).toBe(true);
    
    // Dropboxのメソッドが正しく呼ばれたか検証
    const dropboxInstance = new Dropbox({});
    expect(dropboxInstance.filesCreateFolderV2).toHaveBeenCalledWith({
      path: '/test/test-folder',
    });
  });
  
  test('createEventFolder: イベント用フォルダを作成できること', async () => {
    // イベントフォルダ作成処理を実行
    const result = await createEventFolder('event-123');
    
    // 結果を検証
    expect(result).toBe('/events/event-123');
    
    // Dropboxのメソッドが正しく呼ばれたか検証
    const dropboxInstance = new Dropbox({});
    expect(dropboxInstance.filesCreateFolderV2).toHaveBeenCalledWith({
      path: '/events/event-123',
    });
  });
  
  test('uploadEventPhoto: イベント写真をアップロードできること', async () => {
    // モックデータを作成
    const eventId = 'event-123';
    const fileData = Buffer.from('mock-file-data');
    const fileName = 'test-photo.jpg';
    
    // イベント写真アップロード処理を実行
    const result = await uploadEventPhoto(eventId, fileData, fileName);
    
    // 結果を検証
    expect(result).toBe('https://www.dropbox.com/s/abc123/test-file.jpg');
    
    // uuidが呼ばれたか検証
    expect(uuidv4).toHaveBeenCalled();
    
    // Dropboxのメソッドが正しく呼ばれたか検証
    const dropboxInstance = new Dropbox({});
    expect(dropboxInstance.filesUpload).toHaveBeenCalled();
    expect(dropboxInstance.sharingCreateSharedLink).toHaveBeenCalled();
  });
}); 