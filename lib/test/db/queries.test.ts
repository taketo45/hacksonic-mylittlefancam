import { 
  organizationQueries, 
  hostQueries, 
  eventQueries, 
  userQueries, 
  photoQueries, 
  purchaseQueries 
} from '../../../lib/db/queries';
import { db } from '../../../lib/db';
import { v4 as uuid } from 'uuid';

// データベースのモック
jest.mock('../../db', () => {
  const mockDb = {
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([]),
    organizationMst: { organizationId: 'organizationId', organizationName: 'organizationName' },
    hostTbl: { hostId: 'hostId', name: 'name' },
    eventTbl: { eventId: 'eventId', eventName: 'eventName' },
    userTbl: { userId: 'userId', name: 'name' },
    originalPhotoTbl: { originalPhotoId: 'originalPhotoId', storageUrl: 'storageUrl' },
    processedPhotoTbl: { processedPhotoId: 'processedPhotoId', processedPhotoUrl: 'processedPhotoUrl' },
    cartTbl: { processedPhotoId: 'processedPhotoId', purchaseId: 'purchaseId' },
    purchaseTbl: { purchaseId: 'purchaseId', userId: 'userId' }
  };
  
  // valuesメソッドをモック
  mockDb.insert = jest.fn().mockImplementation(() => ({
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue([{ id: 'test-id' }])
      })
    })
  }));
  
  return { db: mockDb };
});

// uuidのモック
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid')
}));

describe('データベースクエリのテスト', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
  });
  
  describe('組織クエリのテスト', () => {
    test('createOrganization: 組織を作成できること', async () => {
      // テストデータ
      const data = {
        organizationName: 'テスト組織',
        organizationAddress: 'テスト住所',
        organizationContact: 'test@example.com',
        organizationType: '保育園',
        department: 'テスト部署'
      };
      
      // 組織作成処理を実行
      const result = await organizationQueries.createOrganization(data);
      
      // 結果を検証
      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      
      // DBの呼び出しを検証
      expect(db.insert).toHaveBeenCalled();
      const insertMock = db.insert();
      expect(insertMock.values).toHaveBeenCalledWith({
        organizationId: 'test-uuid',
        ...data
      });
    });
    
    test('getOrganizationById: 組織IDで組織を取得できること', async () => {
      // 組織取得処理を実行
      await organizationQueries.getOrganizationById('test-org-id');
      
      // DBの呼び出しを検証
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
    });
  });
  
  describe('主催者クエリのテスト', () => {
    test('createHost: 主催者を作成できること', async () => {
      // テストデータ
      const data = {
        name: 'テスト主催者',
        email: 'host@example.com',
        password: 'password123',
        accountStatus: 'active'
      };
      
      // 主催者作成処理を実行
      const result = await hostQueries.createHost(data);
      
      // 結果を検証
      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      
      // DBの呼び出しを検証
      expect(db.insert).toHaveBeenCalled();
      const insertMock = db.insert();
      expect(insertMock.values).toHaveBeenCalledWith({
        hostId: 'test-uuid',
        ...data
      });
    });
    
    test('getHostById: 主催者IDで主催者を取得できること', async () => {
      // 主催者取得処理を実行
      await hostQueries.getHostById('test-host-id');
      
      // DBの呼び出しを検証
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
    });
  });
  
  describe('イベントクエリのテスト', () => {
    test('createEvent: イベントを作成できること', async () => {
      // テストデータ
      const data = {
        eventName: 'テストイベント',
        eventStatus: 'active'
      };
      
      // イベント作成処理を実行
      const result = await eventQueries.createEvent(data);
      
      // 結果を検証
      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      
      // DBの呼び出しを検証
      expect(db.insert).toHaveBeenCalled();
      const insertMock = db.insert();
      expect(insertMock.values).toHaveBeenCalledWith({
        eventId: 'test-uuid',
        ...data
      });
    });
    
    test('getEventById: イベントIDでイベントを取得できること', async () => {
      // イベント取得処理を実行
      await eventQueries.getEventById('test-event-id');
      
      // DBの呼び出しを検証
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
    });
  });
  
  describe('ユーザークエリのテスト', () => {
    test('createUser: ユーザーを作成できること', async () => {
      // テストデータ
      const data = {
        name: 'テストユーザー',
        email: 'user@example.com',
        password: 'password123',
        accountStatus: 'active'
      };
      
      // ユーザー作成処理を実行
      const result = await userQueries.createUser(data);
      
      // 結果を検証
      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      
      // DBの呼び出しを検証
      expect(db.insert).toHaveBeenCalled();
      const insertMock = db.insert();
      expect(insertMock.values).toHaveBeenCalledWith({
        userId: 'test-uuid',
        ...data
      });
    });
    
    test('getUserById: ユーザーIDでユーザーを取得できること', async () => {
      // ユーザー取得処理を実行
      await userQueries.getUserById('test-user-id');
      
      // DBの呼び出しを検証
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
    });
  });
  
  describe('写真クエリのテスト', () => {
    test('createOriginalPhoto: オリジナル写真を作成できること', async () => {
      // テストデータ
      const data = {
        shootId: 'test-shoot-id',
        storageUrl: 'https://example.com/photo.jpg',
        userPreference: 'favorite',
        geoCode: '35.6895,139.6917',
        shootDateTime: new Date(),
        isNG: false
      };
      
      // オリジナル写真作成処理を実行
      const result = await photoQueries.createOriginalPhoto(data);
      
      // 結果を検証
      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      
      // DBの呼び出しを検証
      expect(db.insert).toHaveBeenCalled();
      const insertMock = db.insert();
      expect(insertMock.values).toHaveBeenCalledWith(data);
    });
    
    test('getProcessedPhotosByUserId: ユーザーIDで加工済み写真を取得できること', async () => {
      // 加工済み写真取得処理を実行
      await photoQueries.getProcessedPhotosByUserId('test-user-id');
      
      // DBの呼び出しを検証
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
    });
  });
  
  describe('購入クエリのテスト', () => {
    test('addToCart: カートに商品を追加できること', async () => {
      // テストデータ
      const data = {
        processedPhotoId: 'test-photo-id',
        purchaseId: 'test-purchase-id'
      };
      
      // カート追加処理を実行
      const result = await purchaseQueries.addToCart(data);
      
      // 結果を検証
      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      
      // DBの呼び出しを検証
      expect(db.insert).toHaveBeenCalled();
      const insertMock = db.insert();
      expect(insertMock.values).toHaveBeenCalledWith(data);
    });
    
    test('getCartByUserId: ユーザーIDでカート情報を取得できること', async () => {
      // カート情報取得処理を実行
      await purchaseQueries.getCartByUserId('test-user-id');
      
      // DBの呼び出しを検証
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
    });
    
    test('createPurchase: 購入情報を作成できること', async () => {
      // テストデータ
      const data = {
        userId: 'test-user-id',
        editedPhotoId: 'test-photo-id',
        frameCoordinate: '0,0,100,100',
        wipeCoordinate: '0,0,50,50',
        editSettingsJson: '{}',
        processDateTime: new Date(),
        processedPhotoUrl: 'https://example.com/processed.jpg',
        isSold: true,
        isDownloaded: false,
        isPrinted: false
      };
      
      // 購入情報作成処理を実行
      const result = await purchaseQueries.createPurchase(data);
      
      // 結果を検証
      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      
      // DBの呼び出しを検証
      expect(db.insert).toHaveBeenCalled();
      const insertMock = db.insert();
      expect(insertMock.values).toHaveBeenCalledWith({
        purchaseId: 'test-uuid',
        ...data
      });
    });
  });
}); 