/* 使用方法
1. このファイルの実行環境にNode.jsをインストール
2. 必要なパッケージのインストール
    npm install dotenv node-fetch
3. このファイルと同じディレクトリに.envファイルを作成
    cp .env.sample .env
4. .envファイルに以下の情報を設定
EPSON_HOST=
EPSON_CLIENT_ID=
EPSON_CLIENT_SECRET=
EPSON_DEVICE=XXXXX@XXX.XXXX.XXX

# 以下は印刷設定のデフォルト値 仕様書参照
EPSON_PRINT_MODE=document／photo
EPSON_DEFAULT_MEDIA_SIZE=ms_a4
EPSON_DEFAULT_MEDIA_TYPE=mt_plainpaper

4. プログラムの実行
    node EpsonPrint.js
*/
// UpdateDate: 2024/02/21
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

// Environment variable validation
const requiredEnvVars = [
    'EPSON_HOST',
    'EPSON_CLIENT_ID',
    'EPSON_CLIENT_SECRET',
    'EPSON_DEVICE'
];

function validateEnvironment() {
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
}

// Configuration from environment variables
const config = {
    host: process.env.EPSON_HOST,
    accept: 'application/json;charset=utf-8',
    clientId: process.env.EPSON_CLIENT_ID,
    secret: process.env.EPSON_CLIENT_SECRET,
    device: process.env.EPSON_DEVICE,
    printMode: process.env.EPSON_PRINT_MODE || 'document',
    defaultMediaSize: process.env.EPSON_DEFAULT_MEDIA_SIZE || 'ms_a4',
    defaultMediaType: process.env.EPSON_DEFAULT_MEDIA_TYPE || 'mt_plainpaper'
};

// Utility function for API calls
async function makeRequest(url, options) {
    try {
        const response = await fetch(url, options);
        const responseData = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(responseData)}`);
        }
        
        return { status: response.status, data: responseData };
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}

// 1. Authentication
async function authenticate() {
    const authUri = `https://${config.host}/api/1/printing/oauth2/auth/token?subject=printer`;
    const auth = Buffer.from(`${config.clientId}:${config.secret}`).toString('base64');
    
    const params = new URLSearchParams({
        grant_type: 'password',
        username: config.device,
        password: ''
    });

    const options = {
        method: 'POST',
        headers: {
            'Host': config.host,
            'Accept': config.accept,
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        body: params.toString()
    };

    console.log('1. Authentication:', authUri);
    const result = await makeRequest(authUri, options);
    return result.data;
}

// 2. Create print job
async function createPrintJob(subjectId, accessToken) {
    const jobUri = `https://${config.host}/api/1/printing/printers/${subjectId}/jobs`;
    
    const data = {
        job_name: 'SampleJob1',
        print_mode: config.printMode,
        print_setting: {
            media_size: config.defaultMediaSize,
            media_type: config.defaultMediaType,
            borderless: false,
            print_quality: 'normal',
            source: 'auto',
            color_mode: 'color',
            reverse_order: false,
            copies: 1,
            collate: true
        }
    };

    const options = {
        method: 'POST',
        headers: {
            'Host': config.host,
            'Accept': config.accept,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    };

    console.log('2. Create print job:', jobUri);
    const result = await makeRequest(jobUri, options);
    return result.data;
}

// 3. Upload print file
async function uploadPrintFile(uploadUri, filePath) {
    const fileContent = await fs.readFile(filePath);
    const fileName = '1' + path.extname(filePath);
    const finalUploadUri = `${uploadUri}&File=${fileName}`;

    const options = {
        method: 'POST',
        headers: {
            'Host': config.host,
            'Accept': config.accept,
            'Content-Length': fileContent.length.toString(),
            'Content-Type': 'application/octet-stream'
        },
        body: fileContent
    };

    console.log('3. Upload print file:', finalUploadUri);
    const response = await fetch(finalUploadUri, options);
    
    if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    return response.status;
}

// 4. Execute print
async function executePrint(subjectId, jobId, accessToken) {
    const printUri = `https://${config.host}/api/1/printing/printers/${subjectId}/jobs/${jobId}/print`;

    const options = {
        method: 'POST',
        headers: {
            'Host': config.host,
            'Accept': config.accept,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=utf-8'
        }
    };

    console.log('4. Execute print:', printUri);
    const result = await makeRequest(printUri, options);
    return result;
}

// Optional: Get print job status
async function getPrintJobStatus(subjectId, jobId, accessToken) {
    const statusUri = `https://${config.host}/api/1/printing/printers/${subjectId}/jobs/${jobId}`;

    const options = {
        method: 'GET',
        headers: {
            'Host': config.host,
            'Accept': config.accept,
            'Authorization': `Bearer ${accessToken}`
        }
    };

    const result = await makeRequest(statusUri, options);
    return result.data;
}

// Main execution
async function main() {
    try {
        // Validate environment variables
        validateEnvironment();

        // 1. Authentication
        const authResult = await authenticate();
        const { subject_id, access_token } = authResult;

        // 2. Create print job
        const jobResult = await createPrintJob(subject_id, access_token);
        const { id: jobId, upload_uri } = jobResult;

        // 3. Upload print file
        // const filePath = './keyboard-shortcuts-macos.pdf';
        const filePath = './sample_photo.jpg';
        await uploadPrintFile(upload_uri, filePath);

        // 4. Execute print
        await executePrint(subject_id, jobId, access_token);
        
        // 5. Get job status (optional)
        const jobStatus = await getPrintJobStatus(subject_id, jobId, access_token);
        console.log('Print job status:', jobStatus);
        
        console.log('Print job completed successfully');
    } catch (error) {
        console.error('Error executing print job:', error);
        process.exit(1);
    }
}

// Run the application
main();