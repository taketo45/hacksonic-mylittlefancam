/**
 * テスト実行用のスクリプト
 * 
 * このスクリプトは、各ユーティリティのテストを実行するためのものです。
 * 実行方法: `npx ts-node src/test/runTests.ts`
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// テスト対象のディレクトリ
const TEST_DIR = path.join(__dirname, 'utils');

// テストファイルの一覧を取得
const testFiles = fs.readdirSync(TEST_DIR)
  .filter((file: string) => file.endsWith('.test.ts'))
  .map((file: string) => path.join(TEST_DIR, file));

console.log('実行するテストファイル:');
testFiles.forEach((file: string) => console.log(`- ${path.basename(file)}`));
console.log('');

// テストを順番に実行
async function runTests(): Promise<void> {
  for (const testFile of testFiles) {
    const testName = path.basename(testFile);
    console.log(`\n===== ${testName} の実行 =====`);
    
    try {
      // Jestを使用してテストを実行
      const jest = spawn('npx', ['jest', testFile, '--verbose'], {
        stdio: 'inherit',
        shell: true,
      });
      
      // プロセスの終了を待機
      await new Promise<void>((resolve, reject) => {
        jest.on('close', (code: number) => {
          if (code === 0) {
            console.log(`✅ ${testName} のテストが成功しました`);
            resolve();
          } else {
            console.error(`❌ ${testName} のテストが失敗しました (終了コード: ${code})`);
            reject(new Error(`テスト失敗: ${testName}`));
          }
        });
      });
    } catch (error) {
      console.error(`テスト実行中にエラーが発生しました: ${error}`);
    }
  }
}

// テストを実行
runTests()
  .then(() => {
    console.log('\n===== すべてのテストが完了しました =====');
  })
  .catch((error: Error) => {
    console.error(`\n❌ テスト実行中にエラーが発生しました: ${error}`);
    process.exit(1);
  }); 