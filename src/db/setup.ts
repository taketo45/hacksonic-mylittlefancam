import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * データベースのマイグレーションを実行する関数
 * 
 * この関数は、Drizzleのマイグレーションを実行し、データベーススキーマを最新の状態に更新します。
 * 開発環境やCI/CD環境で使用することを想定しています。
 */
export async function runMigrations() {
  // 環境変数からデータベース接続URLを取得
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL環境変数が設定されていません。');
  }

  // マイグレーション用のクライアントを作成
  // マイグレーション時は接続数を1に制限
  const migrationClient = postgres(connectionString, { max: 1 });
  
  // Drizzleインスタンスを作成
  const db = drizzle(migrationClient, { schema });
  
  try {
    console.log('データベースマイグレーションを開始します...');
    
    // マイグレーションを実行
    // drizzleディレクトリ内のマイグレーションファイルを使用
    await migrate(db, { migrationsFolder: 'drizzle' });
    
    console.log('データベースマイグレーションが完了しました。');
  } catch (error) {
    console.error('マイグレーション中にエラーが発生しました:', error);
    throw error;
  } finally {
    // マイグレーション完了後にクライアントを終了
    await migrationClient.end();
  }
}

/**
 * データベース接続をテストする関数
 * 
 * この関数は、データベースへの接続が正常に行えるかをテストします。
 * アプリケーションの起動時やヘルスチェックで使用することを想定しています。
 */
export async function testConnection() {
  // 環境変数からデータベース接続URLを取得
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL環境変数が設定されていません。');
  }

  // テスト用のクライアントを作成
  const testClient = postgres(connectionString);
  
  try {
    console.log('データベース接続をテストしています...');
    
    // 簡単なクエリを実行してデータベース接続をテスト
    const result = await testClient.query('SELECT NOW()');
    
    console.log('データベース接続テスト成功:', result[0].now);
    return true;
  } catch (error) {
    console.error('データベース接続テスト失敗:', error);
    return false;
  } finally {
    // テスト完了後にクライアントを終了
    await testClient.end();
  }
}

// コマンドラインから直接実行された場合、マイグレーションを実行
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('マイグレーションが正常に完了しました。');
      process.exit(0);
    })
    .catch((error) => {
      console.error('マイグレーション中にエラーが発生しました:', error);
      process.exit(1);
    });
} 