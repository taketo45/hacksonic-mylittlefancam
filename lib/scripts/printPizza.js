// @ts-check
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

// 環境変数を読み込む
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Epson Connect API設定
const EPSON_HOST = process.env.EPSON_HOST || 'api.epsonconnect.com';
const EPSON_API_VERSION = '1';
const EPSON_CLIENT_ID = process.env.EPSON_CLIENT_ID || '';
const EPSON_CLIENT_SECRET = process.env.EPSON_CLIENT_SECRET || '';
const EPSON_DEVICE = process.env.EPSON_DEVICE || '';
const EPSON_PRINT_MODE = process.env.EPSON_PRINT_MODE || 'photo';
const EPSON_DEFAULT_MEDIA_SIZE = process.env.EPSON_DEFAULT_MEDIA_SIZE || 'ms_l';
const EPSON_DEFAULT_MEDIA_TYPE = process.env.EPSON_DEFAULT_MEDIA_TYPE || 'mt_photopaper';

// 環境変数の確認
console.log('環境変数:');
console.log('EPSON_HOST:', EPSON_HOST);
console.log('EPSON_CLIENT_ID:', EPSON_CLIENT_ID ? '設定済み' : '未設定');
console.log('EPSON_CLIENT_SECRET:', EPSON_CLIENT_SECRET ? '設定済み' : '未設定');
console.log('EPSON_DEVICE:', EPSON_DEVICE || '未設定');
console.log('EPSON_PRINT_MODE:', EPSON_PRINT_MODE);
console.log('EPSON_DEFAULT_MEDIA_SIZE:', EPSON_DEFAULT_MEDIA_SIZE);
console.log('EPSON_DEFAULT_MEDIA_TYPE:', EPSON_DEFAULT_MEDIA_TYPE);

// APIリクエスト用のユーティリティ関数
async function makeRequest(url, options) {
  try {
    const response = await axios(options);
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('リクエスト失敗:', error.message);
    if (error.response) {
      console.error('ステータス:', error.response.status);
      console.error('データ:', error.response.data);
    }
    throw error;
  }
}

// 認証トークンを取得する関数
async function getAuthToken() {
  try {
    // Basic認証用のトークンを生成
    const auth = Buffer.from(`${EPSON_CLIENT_ID}:${EPSON_CLIENT_SECRET}`).toString('base64');
    
    // 認証リクエストのパラメータ
    const params = new URLSearchParams({
      grant_type: 'password',
      username: EPSON_DEVICE,
      password: ''
    });

    // 認証リクエスト
    const options = {
      method: 'POST',
      url: `https://${EPSON_HOST}/api/${EPSON_API_VERSION}/printing/oauth2/auth/token?subject=printer`,
      headers: {
        'Host': EPSON_HOST,
        'Accept': 'application/json;charset=utf-8',
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      },
      data: params.toString()
    };

    console.log('認証URL:', options.url);
    const result = await makeRequest(options.url, options);
    console.log('認証成功:', result.data);
    
    return {
      token: result.data.access_token,
      printerId: result.data.subject_id
    };
  } catch (error) {
    console.error('認証エラー:', error.message);
    throw error;
  }
}

// 印刷ジョブを作成する関数
async function createPrintJob(token, printerId, printSettings) {
  try {
    const jobUrl = `https://${EPSON_HOST}/api/${EPSON_API_VERSION}/printing/printers/${printerId}/jobs`;
    console.log('印刷ジョブ作成URL:', jobUrl);
    
    const options = {
      method: 'POST',
      url: jobUrl,
      headers: {
        'Host': EPSON_HOST,
        'Accept': 'application/json;charset=utf-8',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json;charset=utf-8'
      },
      data: {
        job_name: 'PizzaPrint',
        print_mode: EPSON_PRINT_MODE,
        print_setting: {
          media_size: printSettings.paper_size,
          media_type: printSettings.media_type,
          borderless: printSettings.borderless,
          print_quality: printSettings.quality,
          source: 'auto',
          color_mode: 'color',
          reverse_order: false,
          copies: printSettings.copies,
          collate: true
        }
      }
    };
    
    const result = await makeRequest(jobUrl, options);
    console.log('印刷ジョブ作成結果:', result.data);
    
    return result.data;
  } catch (error) {
    console.error('印刷ジョブ作成エラー:', error.message);
    throw error;
  }
}

// ファイルをアップロードする関数
async function uploadPrintFile(uploadUri, imageBuffer) {
  try {
    const fileName = '1.jpg'; // Epsonの仕様に合わせてファイル名を設定
    const uploadUrl = `${uploadUri}&File=${fileName}`;
    console.log('ファイルアップロードURL:', uploadUrl);
    
    const options = {
      method: 'POST',
      url: uploadUrl,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': imageBuffer.length.toString()
      },
      data: imageBuffer
    };
    
    const response = await axios(options);
    console.log('ファイルアップロード結果:', response.status, response.statusText);
    return response.status === 200;
  } catch (error) {
    console.error('ファイルアップロードエラー:', error.message);
    throw error;
  }
}

// ジョブステータスを取得する関数
async function getJobStatus(token, printerId, jobId) {
  try {
    const statusUrl = `https://${EPSON_HOST}/api/${EPSON_API_VERSION}/printing/printers/${printerId}/jobs/${jobId}`;
    console.log('ジョブステータス取得URL:', statusUrl);
    
    const options = {
      method: 'GET',
      url: statusUrl,
      headers: {
        'Host': EPSON_HOST,
        'Accept': 'application/json;charset=utf-8',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const result = await makeRequest(statusUrl, options);
    console.log('ジョブステータス:', result.data);
    return result.data;
  } catch (error) {
    console.error('ジョブステータス取得エラー:', error.message);
    return { error: error.message };
  }
}

// 印刷ジョブを実行する関数
async function executePrint(token, printerId, jobId) {
  try {
    const printUrl = `https://${EPSON_HOST}/api/${EPSON_API_VERSION}/printing/printers/${printerId}/jobs/${jobId}/print`;
    console.log('印刷実行URL:', printUrl);
    
    const options = {
      method: 'POST',
      url: printUrl,
      headers: {
        'Host': EPSON_HOST,
        'Accept': 'application/json;charset=utf-8',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
      }
    };
    
    const result = await makeRequest(printUrl, options);
    console.log('印刷実行結果:', result.data);
    return result.data;
  } catch (error) {
    console.error('印刷実行エラー:', error.message);
    return { error: error.message };
  }
}

/**
 * ピザの写真をL判用紙に印刷するスクリプト
 */
async function main() {
  try {
    console.log('ピザの写真を印刷します...');
    
    // 印刷設定
    const printSettings = {
      paper_size: EPSON_DEFAULT_MEDIA_SIZE,  // L判サイズ
      media_type: EPSON_DEFAULT_MEDIA_TYPE,  // 写真用紙
      quality: 'high',  // 高品質
      borderless: true,  // フチなし印刷
      copies: 1,  // 1部
    };
    
    // 画像ファイルの読み込み
    const imagePath = path.resolve(__dirname, '../test/test_samples/pizza.jpg');
    console.log('画像ファイルのパス:', imagePath);
    
    const imageBuffer = await fs.readFile(imagePath);
    console.log('画像サイズ:', imageBuffer.length, 'バイト');
    console.log('印刷設定:', JSON.stringify(printSettings, null, 2));
    
    // 認証トークンを取得
    console.log('認証トークンを取得しています...');
    const { token, printerId } = await getAuthToken();
    
    // 印刷ジョブを作成
    const jobData = await createPrintJob(token, printerId, printSettings);
    
    if (jobData.code) {
      throw new Error(`印刷ジョブの作成に失敗しました: ${JSON.stringify(jobData)}`);
    }
    
    // ファイルアップロード
    const uploadSuccess = await uploadPrintFile(jobData.upload_uri, imageBuffer);
    
    if (!uploadSuccess) {
      throw new Error('ファイルのアップロードに失敗しました');
    }
    
    // アップロード後に少し待機（3秒）
    console.log('ファイル処理のために3秒待機します...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // アップロード後のジョブステータスを確認
    console.log('アップロード後のジョブステータスを確認します...');
    const jobStatus = await getJobStatus(token, printerId, jobData.id);
    
    // ジョブが存在する場合のみ印刷を実行
    let printStatus;
    if (jobStatus && !jobStatus.code) {
      console.log('印刷を実行します...');
      printStatus = await executePrint(token, printerId, jobData.id);
      
      // 印刷実行後に少し待機（2秒）
      console.log('印刷処理のために2秒待機します...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 印刷後のジョブステータスを確認
      console.log('印刷後のジョブステータスを確認します...');
      const finalStatus = await getJobStatus(token, printerId, jobData.id);
      console.log('最終ジョブステータス:', finalStatus);
    } else {
      console.log('ジョブが見つからないため、印刷実行をスキップします');
    }
    
    console.log('印刷が完了しました。');
    console.log('印刷ジョブID:', jobData.id);
    console.log('印刷ステータス:', printStatus ? JSON.stringify(printStatus) : 'undefined');
  } catch (error) {
    console.error('印刷中にエラーが発生しました:', error.message);
    if (error.cause) {
      console.error('原因:', error.cause.message);
    }
  }
}

// スクリプトを実行
main(); 