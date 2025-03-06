import { db } from './index'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { sql } from 'drizzle-orm'

// 環境変数を読み込む
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '../../.env') })

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * データベースをリセットする関数
 */
export async function resetDatabase() {
  try {
    console.log('データベースのリセットを開始します...')

    // データベース接続チェック
    if (!db) {
      throw new Error('データベース接続が初期化されていません')
    }

    // 既存のユーザーを削除
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    if (usersError) {
      throw usersError
    }

    for (const user of users.users) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
      if (deleteError) {
        console.error(`Failed to delete user ${user.id}:`, deleteError)
      }
    }

    // テーブルの削除
    await db.execute(sql`
      DROP TABLE IF EXISTS "cart_tbl" CASCADE;
      DROP TABLE IF EXISTS "edited_photo_tbl" CASCADE;
      DROP TABLE IF EXISTS "event_slot_tbl" CASCADE;
      DROP TABLE IF EXISTS "event_tbl" CASCADE;
      DROP TABLE IF EXISTS "facility_mst" CASCADE;
      DROP TABLE IF EXISTS "host_detail_tbl" CASCADE;
      DROP TABLE IF EXISTS "host_event_slot_tbl" CASCADE;
      DROP TABLE IF EXISTS "host_event_tbl" CASCADE;
      DROP TABLE IF EXISTS "host_tbl" CASCADE;
      DROP TABLE IF EXISTS "organization_host_tbl" CASCADE;
      DROP TABLE IF EXISTS "organization_mst" CASCADE;
      DROP TABLE IF EXISTS "original_photo_tbl" CASCADE;
      DROP TABLE IF EXISTS "photo_shoot_tbl" CASCADE;
      DROP TABLE IF EXISTS "photographer_assign_tbl" CASCADE;
      DROP TABLE IF EXISTS "photographer_tbl" CASCADE;
      DROP TABLE IF EXISTS "print_management_tbl" CASCADE;
      DROP TABLE IF EXISTS "processed_photo_tbl" CASCADE;
      DROP TABLE IF EXISTS "purchase_tbl" CASCADE;
      DROP TABLE IF EXISTS "role_mst" CASCADE;
      DROP TABLE IF EXISTS "seat_block_tbl" CASCADE;
      DROP TABLE IF EXISTS "user_participation_tbl" CASCADE;
      DROP TABLE IF EXISTS "user_role_tbl" CASCADE;
      DROP TABLE IF EXISTS "user_tbl" CASCADE;
      DROP TYPE IF EXISTS "account_status" CASCADE;
      DROP TYPE IF EXISTS "event_slot_status" CASCADE;
      DROP TYPE IF EXISTS "event_status" CASCADE;
      DROP TYPE IF EXISTS "organization_type" CASCADE;
      DROP TYPE IF EXISTS "print_status" CASCADE;
      DROP SCHEMA IF EXISTS "drizzle" CASCADE;
    `)

    console.log('データベースのリセットが完了しました。')
  } catch (error) {
    console.error('リセット中にエラーが発生しました:', error)
    throw error
  }
}

// コマンドラインから直接実行された場合、リセットを実行
if (process.argv[1] === __filename) {
  resetDatabase()
    .then(() => {
      console.log('データベースのリセットが正常に完了しました。')
      process.exit(0)
    })
    .catch((error) => {
      console.error('リセット中にエラーが発生しました:', error)
      process.exit(1)
    })
} 