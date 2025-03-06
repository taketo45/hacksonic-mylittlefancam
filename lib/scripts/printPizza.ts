import fs from 'fs';
import path from 'path';
import { printPhoto } from '../../lib/utils/printing';

/**
 * ピザの写真をL判用紙に印刷するスクリプト
 */
async function main() {
  try {
    console.log('ピザの写真を印刷します...');
    
    // 環境変数からプリンターのメールアドレスを取得
    const printerEmail = process.env.EPSON_DEVICE || '';
    if (!printerEmail) {
      throw new Error('EPSON_DEVICEが設定されていません。');
    }
    
    // 画像ファイルのパスを指定
    const imagePath = path.resolve(__dirname, '../../src/test/test.samples/pizza.jpg');
    console.log(`画像ファイルのパス: ${imagePath}`);
    
    // 画像ファイルを読み込む
    const imageData = fs.readFileSync(imagePath);
    console.log(`画像サイズ: ${imageData.length} バイト`);
    
    // 印刷設定
    const printSettings = {
      paper_size: 'ms_l', // L判サイズ
      print_mode: 'color',
      media_type: 'mt_photopaper', // 写真用紙
      quality: 'high',
      borderless: true,
      copies: 1
    };
    
    // 印刷を実行
    console.log('印刷を開始します...');
    const result = await printPhoto(printerEmail, imageData, 'pizza.jpg', printSettings);
    
    console.log('印刷が完了しました。');
    console.log('印刷ジョブID:', result.id);
    console.log('印刷ステータス:', result.status);
    
  } catch (error) {
    console.error('印刷中にエラーが発生しました:', error);
  }
}

// スクリプトを実行
main().catch(console.error); 