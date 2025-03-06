// テスト環境のセットアップ
import dotenv from 'dotenv';

// .env.testファイルを読み込む（存在する場合）
dotenv.config({ path: '.env.test' });

// テスト用のモックやグローバル設定をここに記述
global.console.log = jest.fn();
global.console.error = jest.fn();
global.console.warn = jest.fn();

// テスト終了後のクリーンアップ
// afterAllはJestのグローバル関数なので、直接呼び出すとエラーになる場合がある
// 代わりにクリーンアップ関数を定義しておく
export function cleanup(): void {
  // テスト後のクリーンアップ処理があればここに記述
} 