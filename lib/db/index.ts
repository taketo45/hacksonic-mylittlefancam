import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { dirname, join } from 'path';

// 環境変数を読み込む
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../../.env') });

// サーバーサイドでのみ実行されるようにする
let db: PostgresJsDatabase<typeof schema> | null = null;

// サーバーサイドでのみデータベース接続を初期化
if (typeof window === 'undefined') {
  // データベース接続URLを環境変数から取得
  const connectionString = process.env.DATABASE_URL || '';

  // クライアントを作成
  const client = postgres(connectionString);
  db = drizzle(client, { schema });
}

export { db }; 