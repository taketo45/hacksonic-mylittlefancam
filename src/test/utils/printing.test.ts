import { 
  printPhoto, 
  printMultiplePhotos, 
  checkPrintJobStatus, 
  cancelPrintJob 
} from '../../lib/utils/printing';
import axios from 'axios';
import FormData from 'form-data';

// axiosのモック
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
}));

// FormDataのモック
jest.mock('form-data', () => {
  const mockAppend = jest.fn();
  const mockGetHeaders = jest.fn().mockReturnValue({
    'content-type': 'multipart/form-data; boundary=---boundary',
  });
  
  function MockFormData() {
    return {
      append: mockAppend,
      getHeaders: mockGetHeaders,
    };
  }
  
  MockFormData.prototype.append = mockAppend;
  MockFormData.prototype.getHeaders = mockGetHeaders;
  
  return MockFormData;
});

describe('印刷処理ユーティリティのテスト', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
    
    // 認証トークン取得のモックレスポンス
    (axios.post as jest.Mock).mockImplementation((url) => {
      if (url.includes('/oauth2/auth/token')) {
        return Promise.resolve({
          data: {
            access_token: 'test_access_token',
            refresh_token: 'test_refresh_token',
            expires_in: 3600,
            subject_id: 'test_printer_id',
            subject_type: 'printer',
            token_type: 'bearer',
          },
        });
      } else if (url.includes('/jobs')) {
        return Promise.resolve({
          data: {
            id: 'job_123456789',
            status: 'created',
          },
        });
      } else if (url.includes('/print')) {
        return Promise.resolve({
          data: {
            success: true,
          },
        });
      }
      
      return Promise.resolve({ data: {} });
    });
    
    // 印刷ジョブ状態取得のモックレスポンス
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        id: 'job_123456789',
        status: 'processing',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:01Z',
      },
    });
    
    // 印刷ジョブキャンセルのモックレスポンス
    (axios.delete as jest.Mock).mockResolvedValue({
      data: {
        success: true,
      },
    });
  });
  
  test('printPhoto: 写真を印刷できること', async () => {
    // モックデータを作成
    const printerEmail = 'printer@epsonconnect.com';
    const imageData = Buffer.from('mock-image-data');
    const fileName = 'test-photo.jpg';
    
    // 印刷処理を実行
    const result = await printPhoto(printerEmail, imageData, fileName);
    
    // 結果を検証
    expect(result).toBeDefined();
    expect(result.id).toBe('job_123456789');
    expect(result.status).toBe('processing');
    
    // axiosの呼び出しを検証
    expect(axios.post).toHaveBeenCalledTimes(3); // 認証 + ジョブ作成 + 印刷
    expect(axios.get).toHaveBeenCalledTimes(1); // ジョブ状態取得
    
    // FormDataの呼び出しを検証
    expect(FormData.prototype.append).toHaveBeenCalledWith('file', imageData, expect.objectContaining({
      filename: fileName,
    }));
  });
  
  test('printMultiplePhotos: 複数の写真を印刷できること', async () => {
    // モックデータを作成
    const printerEmail = 'printer@epsonconnect.com';
    const images = [
      { data: Buffer.from('mock-image-data-1'), fileName: 'test-photo-1.jpg' },
      { data: Buffer.from('mock-image-data-2'), fileName: 'test-photo-2.jpg' },
    ];
    
    // 複数印刷処理を実行
    const results = await printMultiplePhotos(printerEmail, images);
    
    // 結果を検証
    expect(results).toBeDefined();
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('job_123456789');
    expect(results[1].id).toBe('job_123456789');
    
    // axiosの呼び出しを検証
    expect(axios.post).toHaveBeenCalledTimes(6); // (認証 + ジョブ作成 + 印刷) × 2
    expect(axios.get).toHaveBeenCalledTimes(2); // ジョブ状態取得 × 2
  });
  
  test('checkPrintJobStatus: 印刷ジョブの状態を確認できること', async () => {
    // 印刷ジョブ状態確認処理を実行
    const result = await checkPrintJobStatus('job_123456789');
    
    // 結果を検証
    expect(result).toBeDefined();
    expect(result.id).toBe('job_123456789');
    expect(result.status).toBe('processing');
    
    // axiosの呼び出しを検証
    expect(axios.post).toHaveBeenCalledTimes(1); // 認証
    expect(axios.get).toHaveBeenCalledTimes(1); // ジョブ状態取得
  });
  
  test('cancelPrintJob: 印刷ジョブをキャンセルできること', async () => {
    // 印刷ジョブキャンセル処理を実行
    const result = await cancelPrintJob('job_123456789');
    
    // 結果を検証
    expect(result).toBe(true);
    
    // axiosの呼び出しを検証
    expect(axios.post).toHaveBeenCalledTimes(1); // 認証
    expect(axios.delete).toHaveBeenCalledTimes(1); // ジョブキャンセル
  });
}); 