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
  photographerTbl,
  roleMst,
  userRoleTbl
} from './schema';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

// 環境変数を読み込む
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../../.env') });

// 環境変数が正しく設定されているか確認
console.log('Using DATABASE_URL:', process.env.DATABASE_URL);

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Supabaseの認証システムにユーザーを作成する関数
 */
async function createSupabaseUser(email: string, password: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

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

    // ロールデータの作成
    const roles = [
      { roleId: uuidv4(), roleName: 'user', role_key: 'USER', description: '一般ユーザー', isActive: true, isRemovable: false },
      { roleId: uuidv4(), roleName: 'organizer', role_key: 'HOST', description: '主催者', isActive: true, isRemovable: true },
      { roleId: uuidv4(), roleName: 'photographer', role_key: 'PHOTOGRAPHER', description: '撮影者', isActive: true, isRemovable: true },
      { roleId: uuidv4(), roleName: 'admin', role_key: 'SYSTEM_ADMIN', description: 'システム管理者', isActive: true, isRemovable: true },
    ];

    for (const role of roles) {
      await db.insert(roleMst).values(role);
      console.log(`ロール「${role.roleName}」を作成しました`);
    }

    // 主催者データの作成
    const hostEmail = 'host@example.com';
    const hostPassword = 'admin123';
    const hostSupabaseUser = await createSupabaseUser(hostEmail, hostPassword);
    const hostId = uuidv4();
    const hashedHostPassword = await hashPassword(hostPassword);
    const [host] = await db.insert(hostTbl).values({
      hostId,
      auth_user_id: hostSupabaseUser.id,
      name: '山田太郎',
      email: hostEmail,
      password: hashedHostPassword,
      accountStatus: '有効',
    }).returning();

    console.log('主催者データを作成しました:', host.name);

    // 主催者のロール割り当て
    await db.insert(userRoleTbl).values({
      userId: hostSupabaseUser.id,
      roleId: roles[1].roleId, // HOST
      assignedBy: 'SYSTEM',
      isPrimary: true,
    });

    // 主催者詳細データの作成
    await db.insert(hostDetailTbl).values({
      hostId,
      address: '東京都新宿区〇〇4-5-6',
      phoneNumber: '090-1234-5678',
      organizationId,
    });

    console.log('主催者詳細データを作成しました');

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
      facilityName: facility.facilityName,
      facilityAddress: '東京都渋谷区代々木1-1-1',
      facilityPhone: '03-1234-5678',
      eventSlotDetail: '午前中は公園で遊びます',
      eventSlotStatus: '公開中',
    }).returning();

    console.log('イベント枠データを作成しました:', eventSlot.eventSlotName);

    // ユーザーデータの作成
    const user1Email = 'user1@example.com';
    const user1Password = 'user123';
    const user1SupabaseUser = await createSupabaseUser(user1Email, user1Password);
    const userId1 = uuidv4();
    const hashedUserPassword1 = await hashPassword(user1Password);
    const [user1] = await db.insert(userTbl).values({
      userId: userId1,
      auth_user_id: user1SupabaseUser.id,
      name: '佐藤花子',
      email: user1Email,
      password: hashedUserPassword1,
      accountStatus: '有効',
    }).returning();

    console.log('ユーザーデータを作成しました:', user1.name);

    // ユーザー1のロール割り当て
    await db.insert(userRoleTbl).values({
      userId: user1SupabaseUser.id,
      roleId: roles[0].roleId, // USER
      assignedBy: 'SYSTEM',
      isPrimary: true,
    });

    const user2Email = 'user2@example.com';
    const user2Password = 'user456';
    const user2SupabaseUser = await createSupabaseUser(user2Email, user2Password);
    const userId2 = uuidv4();
    const hashedUserPassword2 = await hashPassword(user2Password);
    const [user2] = await db.insert(userTbl).values({
      userId: userId2,
      auth_user_id: user2SupabaseUser.id,
      name: '鈴木一郎',
      email: user2Email,
      password: hashedUserPassword2,
      accountStatus: '有効',
    }).returning();

    console.log('ユーザーデータを作成しました:', user2.name);

    // ユーザー2のロール割り当て
    await db.insert(userRoleTbl).values({
      userId: user2SupabaseUser.id,
      roleId: roles[0].roleId, // USER
      assignedBy: 'SYSTEM',
      isPrimary: true,
    });

    // 撮影者データの作成
    const photographerEmail = 'photographer@example.com';
    const photographerPassword = 'photo123';
    const photographerSupabaseUser = await createSupabaseUser(photographerEmail, photographerPassword);
    const photographerId = uuidv4();
    const hashedPhotographerPassword = await hashPassword(photographerPassword);
    const [photographer] = await db.insert(photographerTbl).values({
      photographerId,
      auth_user_id: photographerSupabaseUser.id,
      name: '田中写真家',
      email: photographerEmail,
      password: hashedPhotographerPassword,
      accountStatus: '有効',
    }).returning();

    console.log('撮影者データを作成しました:', photographer.name);

    // 撮影者のロール割り当て
    await db.insert(userRoleTbl).values({
      userId: photographerSupabaseUser.id,
      roleId: roles[2].roleId, // PHOTOGRAPHER
      assignedBy: 'SYSTEM',
      isPrimary: true,
    });

    // 管理者ユーザーの作成
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    const adminSupabaseUser = await createSupabaseUser(adminEmail, adminPassword);
    const adminId = uuidv4();
    const hashedAdminPassword = await hashPassword(adminPassword);
    const [admin] = await db.insert(userTbl).values({
      userId: adminId,
      auth_user_id: adminSupabaseUser.id,
      name: '管理者',
      email: adminEmail,
      password: hashedAdminPassword,
      accountStatus: '有効',
    }).returning();

    console.log('管理者データを作成しました:', admin.name);

    // 管理者のロール割り当て（ユーザーロールとシステム管理者ロールの両方を付与）
    for (const roleData of [
      {
        userId: adminSupabaseUser.id,
        roleId: roles[0].roleId, // USER
        assignedBy: 'SYSTEM',
        isPrimary: true,
      },
      {
        userId: adminSupabaseUser.id,
        roleId: roles[3].roleId, // SYSTEM_ADMIN
        assignedBy: 'SYSTEM',
        isPrimary: false,
      }
    ]) {
      await db.insert(userRoleTbl).values(roleData);
    }

    console.log('管理者ロールを割り当てました');

    console.log('データベースシードが完了しました。');
  } catch (error) {
    console.error('シード中にエラーが発生しました:', error);
    throw error;
  }
}

// コマンドラインから直接実行された場合、シードを実行
if (process.argv[1] === __filename) {
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