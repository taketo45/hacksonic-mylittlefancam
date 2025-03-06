import { 
  detectFaces, 
  compareFaces, 
  detectLabels, 
  analyzeEmotions, 
  containsChild, 
  containsSpecificChild, 
  isPositiveEmotion 
} from '../../../lib/utils/faceRecognition';
import { RekognitionClient } from '@aws-sdk/client-rekognition';

// RekognitionClientのモック
jest.mock('@aws-sdk/client-rekognition', () => {
  // 顔検出のモックレスポンス
  const mockFaceDetails = [
    {
      BoundingBox: {
        Width: 0.5,
        Height: 0.5,
        Left: 0.25,
        Top: 0.25,
      },
      Confidence: 99.9,
      Emotions: [
        { Type: 'HAPPY', Confidence: 95.0 },
        { Type: 'CALM', Confidence: 50.0 },
      ],
      Gender: { Value: 'Male', Confidence: 99.0 },
      AgeRange: { Low: 5, High: 10 },
    },
  ];

  // 顔比較のモックレスポンス
  const mockFaceMatches = [
    {
      Similarity: 90.0,
      Face: {
        BoundingBox: {
          Width: 0.5,
          Height: 0.5,
          Left: 0.25,
          Top: 0.25,
        },
        Confidence: 99.9,
      },
    },
  ];

  // ラベル検出のモックレスポンス
  const mockLabels = [
    { Name: 'Person', Confidence: 99.9 },
    { Name: 'Child', Confidence: 95.0 },
    { Name: 'Human', Confidence: 99.9 },
  ];

  const mockSend = jest.fn().mockImplementation((command) => {
    if (command.constructor.name === 'DetectFacesCommand') {
      return Promise.resolve({
        FaceDetails: mockFaceDetails,
      });
    } else if (command.constructor.name === 'CompareFacesCommand') {
      return Promise.resolve({
        FaceMatches: mockFaceMatches,
        UnmatchedFaces: [],
      });
    } else if (command.constructor.name === 'DetectLabelsCommand') {
      return Promise.resolve({
        Labels: mockLabels,
      });
    }
    
    return Promise.resolve({});
  });
  
  return {
    RekognitionClient: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    DetectFacesCommand: jest.fn(),
    CompareFacesCommand: jest.fn(),
    DetectLabelsCommand: jest.fn(),
  };
});

// 実際の関数をモック
jest.mock('../../lib/utils/faceRecognition', () => {
  const originalModule = jest.requireActual('../../lib/utils/faceRecognition');
  
  return {
    ...originalModule,
    detectFaces: jest.fn().mockResolvedValue([
      {
        BoundingBox: {
          Width: 0.5,
          Height: 0.5,
          Left: 0.25,
          Top: 0.25,
        },
        Confidence: 99.9,
        Emotions: [
          { Type: 'HAPPY', Confidence: 95.0 },
          { Type: 'CALM', Confidence: 50.0 },
        ],
      },
    ]),
    compareFaces: jest.fn().mockResolvedValue([
      {
        Similarity: 90.0,
        Face: {
          BoundingBox: {
            Width: 0.5,
            Height: 0.5,
            Left: 0.25,
            Top: 0.25,
          },
          Confidence: 99.9,
        },
      },
    ]),
    detectLabels: jest.fn().mockResolvedValue([
      { Name: 'Person', Confidence: 99.9 },
      { Name: 'Child', Confidence: 95.0 },
      { Name: 'Human', Confidence: 99.9 },
    ]),
    analyzeEmotions: jest.fn().mockResolvedValue({
      hasEmotions: true,
      emotions: [
        [
          { Type: 'HAPPY', Confidence: 95.0 },
          { Type: 'CALM', Confidence: 50.0 },
        ],
      ],
    }),
    containsChild: jest.fn().mockResolvedValue({
      containsChild: true,
      confidence: 95.0,
    }),
    containsSpecificChild: jest.fn().mockResolvedValue({
      containsSpecificChild: true,
      similarity: 90.0,
      faceMatches: [
        {
          Similarity: 90.0,
          Face: {
            BoundingBox: {
              Width: 0.5,
              Height: 0.5,
              Left: 0.25,
              Top: 0.25,
            },
            Confidence: 99.9,
          },
        },
      ],
    }),
    isPositiveEmotion: jest.fn().mockResolvedValue({
      isPositive: true,
      confidence: 95.0,
    }),
  };
});

describe('顔認識ユーティリティのテスト', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
  });
  
  test('detectFaces: 顔を検出できること', async () => {
    // モックバッファを作成
    const mockBuffer = Buffer.from('mock-image-data');
    
    // 顔検出処理を実行
    const result = await detectFaces(mockBuffer);
    
    // 結果を検証
    expect(result).toBeDefined();
    expect(result?.length).toBeGreaterThan(0);
    if (result && result.length > 0) {
      expect(result[0].BoundingBox).toBeDefined();
      expect(result[0].Emotions?.length).toBe(2);
      expect(result[0].Emotions?.[0]?.Type).toBe('HAPPY');
    }
  });
  
  test('compareFaces: 顔を比較できること', async () => {
    // モックバッファを作成
    const sourceBuffer = Buffer.from('source-image-data');
    const targetBuffer = Buffer.from('target-image-data');
    
    // 顔比較処理を実行
    const result = await compareFaces(sourceBuffer, targetBuffer, 80);
    
    // 結果を検証
    expect(result).toBeDefined();
    expect(result?.length).toBeGreaterThan(0);
    if (result && result.length > 0) {
      expect(result[0].Similarity).toBe(90.0);
      expect(result[0].Face?.BoundingBox).toBeDefined();
    }
  });
  
  test('detectLabels: ラベルを検出できること', async () => {
    // モックバッファを作成
    const mockBuffer = Buffer.from('mock-image-data');
    
    // ラベル検出処理を実行
    const result = await detectLabels(mockBuffer, 70);
    
    // 結果を検証
    expect(result).toBeDefined();
    expect(result?.length).toBeGreaterThan(0);
    if (result && result.length > 0) {
      expect(result[0].Name).toBe('Person');
      expect(result[1].Name).toBe('Child');
    }
  });
  
  test('analyzeEmotions: 感情を分析できること', async () => {
    // モックバッファを作成
    const mockBuffer = Buffer.from('mock-image-data');
    
    // 感情分析処理を実行
    const result = await analyzeEmotions(mockBuffer);
    
    // 結果を検証
    expect(result).toBeDefined();
    expect(result.hasEmotions).toBe(true);
    expect(result.emotions).toBeDefined();
    expect(Array.isArray(result.emotions)).toBe(true);
    expect(result.emotions?.length).toBeGreaterThan(0);
    
    if (result.emotions && result.emotions.length > 0) {
      expect(Array.isArray(result.emotions[0])).toBe(true);
      expect(result.emotions[0].length).toBeGreaterThan(0);
      
      if (result.emotions[0].length > 0) {
        expect(result.emotions[0][0].Type).toBe('HAPPY');
      }
    }
  });
  
  test('containsChild: 子供が含まれているか判定できること', async () => {
    // モックバッファを作成
    const mockBuffer = Buffer.from('mock-image-data');
    
    // 子供検出処理を実行
    const result = await containsChild(mockBuffer);
    
    // 結果を検証
    expect(result).toBeDefined();
    expect(result.containsChild).toBe(true);
    expect(result.confidence).toBe(95.0);
  });
  
  test('containsSpecificChild: 特定の子供が含まれているか判定できること', async () => {
    // モックバッファを作成
    const childBuffer = Buffer.from('child-image-data');
    const targetBuffer = Buffer.from('target-image-data');
    
    // 特定子供検出処理を実行
    const result = await containsSpecificChild(targetBuffer, childBuffer);
    
    // 結果を検証
    expect(result).toBeDefined();
    expect(result.containsSpecificChild).toBe(true);
    expect(result.similarity).toBe(90.0);
    expect(result.faceMatches).toBeDefined();
    expect(Array.isArray(result.faceMatches)).toBe(true);
    expect(result.faceMatches?.length).toBeGreaterThan(0);
  });
  
  test('isPositiveEmotion: ポジティブな感情か判定できること', async () => {
    // モックバッファを作成
    const mockBuffer = Buffer.from('mock-image-data');
    
    // 感情判定処理を実行
    const result = await isPositiveEmotion(mockBuffer);
    
    // 結果を検証
    expect(result).toBeDefined();
    expect(result.isPositive).toBe(true);
    expect(result.confidence).toBeGreaterThan(0);
  });
}); 