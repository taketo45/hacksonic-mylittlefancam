import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

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