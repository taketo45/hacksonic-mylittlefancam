import { 
  resizeImage, 
  addWatermark, 
  blurImage, 
  reduceQuality, 
  createSampleImage 
} from '../../lib/utils/photoProcessing';

// モック用のBlobを作成する関数
function createMockBlob(width: number, height: number): Promise<Blob> {
  // キャンバスを作成してモック画像を生成
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // 単色の背景を描画
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, width, height);
    
    // テキストを描画
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Test Image', 20, 40);
  }
  
  // Blobに変換して返す
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        throw new Error('Blobの作成に失敗しました');
      }
    });
  });
}

// テスト用のグローバルモック
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Image要素のモック
class MockImage {
  public width: number;
  public height: number;
  public onload: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  private _src: string = '';
  
  constructor(width: number = 1000, height: number = 800) {
    this.width = width;
    this.height = height;
  }
  
  set src(value: string) {
    this._src = value;
    // srcがセットされたら自動的にonloadを呼び出す
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
  
  get src(): string {
    return this._src;
  }
}

// グローバルのImage要素をモック
global.Image = MockImage as any;

// Canvasのモック
const mockCanvasContext = {
  drawImage: jest.fn(),
  fillRect: jest.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  font: '',
  textAlign: '',
  textBaseline: '',
  fillText: jest.fn(),
  strokeText: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  filter: '',
};

const mockCanvas = {
  getContext: jest.fn().mockReturnValue(mockCanvasContext),
  width: 0,
  height: 0,
  toBlob: jest.fn().mockImplementation((callback) => {
    const mockBlob = new Blob(['mock-image-data'], { type: 'image/jpeg' });
    callback(mockBlob);
  }),
};

// document.createElementのモック
document.createElement = jest.fn().mockImplementation((tagName) => {
  if (tagName === 'canvas') {
    return mockCanvas;
  }
  return {};
});

describe('写真処理ユーティリティのテスト', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
  });
  
  test('resizeImage: 画像を正しくリサイズできること', async () => {
    // モックBlobを作成
    const mockBlob = new Blob(['mock-image-data'], { type: 'image/jpeg' });
    
    // リサイズ処理を実行
    const result = await resizeImage(mockBlob, 800, 600);
    
    // モックの呼び出しを検証
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(mockCanvasContext.drawImage).toHaveBeenCalled();
    expect(mockCanvas.toBlob).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    
    // 結果を検証
    expect(result).toBeInstanceOf(Blob);
  });
  
  test('addWatermark: 画像にウォーターマークを追加できること', async () => {
    // モックBlobを作成
    const mockBlob = new Blob(['mock-image-data'], { type: 'image/jpeg' });
    
    // ウォーターマーク追加処理を実行
    const result = await addWatermark(mockBlob, 'テストウォーターマーク');
    
    // モックの呼び出しを検証
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(mockCanvasContext.drawImage).toHaveBeenCalled();
    expect(mockCanvasContext.fillText).toHaveBeenCalled();
    expect(mockCanvasContext.strokeText).toHaveBeenCalled();
    expect(mockCanvas.toBlob).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    
    // 結果を検証
    expect(result).toBeInstanceOf(Blob);
  });
  
  test('blurImage: 画像をぼかし処理できること', async () => {
    // モックBlobを作成
    const mockBlob = new Blob(['mock-image-data'], { type: 'image/jpeg' });
    
    // ぼかし処理を実行
    const result = await blurImage(mockBlob, 10);
    
    // モックの呼び出しを検証
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(mockCanvasContext.drawImage).toHaveBeenCalled();
    expect(mockCanvas.toBlob).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    
    // 結果を検証
    expect(result).toBeInstanceOf(Blob);
  });
  
  test('reduceQuality: 画像の品質を下げられること', async () => {
    // モックBlobを作成
    const mockBlob = new Blob(['mock-image-data'], { type: 'image/jpeg' });
    
    // 品質低下処理を実行
    const result = await reduceQuality(mockBlob, 0.5);
    
    // モックの呼び出しを検証
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(mockCanvasContext.drawImage).toHaveBeenCalled();
    expect(mockCanvas.toBlob).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    
    // 結果を検証
    expect(result).toBeInstanceOf(Blob);
  });
  
  test('createSampleImage: サンプル画像を作成できること', async () => {
    // モックBlobを作成
    const mockBlob = new Blob(['mock-image-data'], { type: 'image/jpeg' });
    
    // サンプル画像作成処理を実行
    const result = await createSampleImage(mockBlob);
    
    // 結果を検証
    expect(result).toBeInstanceOf(Blob);
  });
}); 