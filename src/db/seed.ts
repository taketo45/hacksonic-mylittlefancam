import { db } from './index';
import { 
  organizationMst, 
  hostTbl, 
  hostDetailTbl, 
  eventTbl, 
  eventSlotTbl, 
  hostEventTbl, 
  facilityMst, 
  userTbl,
  photographerTbl
} from './schema';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

/**
 * パスワードをハッシュ化する関数
 * @param password ハッシュ化するパスワード
 * @returns ハッシュ化されたパスワード
 */
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * データベースにテストデータを投入する関数
 */
export async function seedDatabase() {
  try {
    console.log('データベースシードを開始します...');

    // データベース接続チェック
    if (!db) {
      throw new Error('データベース接続が初期化されていません');
    }

    // 組織データの作成
    const organizationId = uuidv4();
    const [organization] = await db.insert(organizationMst).values({
      organizationId,
      organizationName: 'サンプル保育園',
      organizationAddress: '東京都渋谷区〇〇1-2-3',
      organizationContact: '03-1234-5678',
      organizationType: '保育園',
      department: '管理部',
    }).returning();

    console.log('組織データを作成しました:', organization.organizationName);

    // 主催者データの作成
    const hostId = uuidv4();
    const hashedHostPassword = await hashPassword('admin123');
    const [host] = await db.insert(hostTbl).values({
      hostId,
      name: '山田太郎',
      email: 'host@example.com',
      password: hashedHostPassword,
      accountStatus: '有効',
    }).returning();

    console.log('主催者データを作成しました:', host.name);

    // 主催者詳細データの作成
    await db.insert(hostDetailTbl).values({
      hostId,
      address: '東京都新宿区〇〇4-5-6',
      phoneNumber: '090-1234-5678',
      organizationId,
    });

    console.log('主催者詳細データを作成しました');

    // 組織と主催者の関連データの作成
    await db.insert(hostDetailTbl).values({
      hostId,
      organizationId,
    });

    // イベントデータの作成
    const eventId = uuidv4();
    const [event] = await db.insert(eventTbl).values({
      eventId,
      eventName: '春の遠足',
      eventStatus: '公開中',
    }).returning();

    console.log('イベントデータを作成しました:', event.eventName);

    // 主催者とイベントの関連データの作成
    await db.insert(hostEventTbl).values({
      hostId,
      eventId,
      eventRole: '主催者',
    });

    // 施設データの作成
    const facilityId = uuidv4();
    const [facility] = await db.insert(facilityMst).values({
      facilityId,
      facilityName: '〇〇公園',
      facilityAddress: '東京都世田谷区〇〇7-8-9',
      facilityPhone: '03-9876-5432',
    }).returning();

    console.log('施設データを作成しました:', facility.facilityName);

    // イベント枠データの作成
    const eventSlotId = uuidv4();
    const [eventSlot] = await db.insert(eventSlotTbl).values({
      eventSlotId,
      eventId,
      eventSlotName: '午前の部',
      eventDate: '2023-04-15',
      eventTime: '10:00:00',
      facilityId,
      eventSlotDetail: '午前中は公園で遊びます',
      eventSlotStatus: '公開中',
      ticketUrl: `https://example.com/events/${eventId}/slots/${eventSlotId}`,
    }).returning();

    console.log('イベント枠データを作成しました:', eventSlot.eventSlotName);

    // ユーザーデータの作成
    const userId1 = uuidv4();
    const hashedUserPassword1 = await hashPassword('user123');
    const [user1] = await db.insert(userTbl).values({
      userId: userId1,
      name: '佐藤花子',
      email: 'user1@example.com',
      password: hashedUserPassword1,
      accountStatus: '有効',
    }).returning();

    console.log('ユーザーデータを作成しました:', user1.name);

    const userId2 = uuidv4();
    const hashedUserPassword2 = await hashPassword('user456');
    const [user2] = await db.insert(userTbl).values({
      userId: userId2,
      name: '鈴木一郎',
      email: 'user2@example.com',
      password: hashedUserPassword2,
      accountStatus: '有効',
    }).returning();

    console.log('ユーザーデータを作成しました:', user2.name);

    // 撮影者データの作成
    const photographerId = uuidv4();
    const hashedPhotographerPassword = await hashPassword('photo123');
    const [photographer] = await db.insert(photographerTbl).values({
      photographerId,
      name: '田中写真家',
      email: 'photographer@example.com',
      password: hashedPhotographerPassword,
      accountStatus: '有効',
    }).returning();

    console.log('撮影者データを作成しました:', photographer.name);

    console.log('データベースシードが完了しました。');
  } catch (error) {
    console.error('シード中にエラーが発生しました:', error);
    throw error;
  }
}

// コマンドラインから直接実行された場合、シードを実行
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('シードが正常に完了しました。');
      process.exit(0);
    })
    .catch((error) => {
      console.error('シード中にエラーが発生しました:', error);
      process.exit(1);
    });
} 