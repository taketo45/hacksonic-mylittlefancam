/**
 * 写真処理のユーティリティ関数
 * 画像の処理、ウォーターマーク追加、ぼかし処理などを行う
 */

/**
 * 画像をリサイズする関数
 * @param imageData 元の画像データ（Blob）
 * @param maxWidth 最大幅
 * @param maxHeight 最大高さ
 * @returns リサイズされた画像データ（Blob）
 */
export async function resizeImage(imageData: Blob, maxWidth: number = 1200, maxHeight: number = 1200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // 画像をロード
      const img = new Image();
      const objectUrl = URL.createObjectURL(imageData);
      
      img.onload = () => {
        // 元のサイズを取得
        const originalWidth = img.width;
        const originalHeight = img.height;
        
        // リサイズ比率を計算
        let ratio = 1;
        if (originalWidth > maxWidth || originalHeight > maxHeight) {
          ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
        }
        
        // 新しいサイズを計算
        const newWidth = Math.floor(originalWidth * ratio);
        const newHeight = Math.floor(originalHeight * ratio);
        
        // キャンバスを作成
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // 画像を描画
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('キャンバスコンテキストの取得に失敗しました。'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // BlobとしてエクスポートしてURLを解放
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('画像のリサイズに失敗しました。'));
          }
        }, 'image/jpeg', 0.9);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('画像の読み込みに失敗しました。'));
      };
      
      img.src = objectUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 画像にウォーターマークを追加する関数
 * @param imageData 元の画像データ（Blob）
 * @param watermarkText ウォーターマークのテキスト
 * @returns ウォーターマーク付きの画像データ（Blob）
 */
export async function addWatermark(imageData: Blob, watermarkText: string = 'SmileShare - サンプル'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // 画像をロード
      const img = new Image();
      const objectUrl = URL.createObjectURL(imageData);
      
      img.onload = () => {
        // キャンバスを作成
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 画像を描画
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('キャンバスコンテキストの取得に失敗しました。'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // ウォーターマークの設定
        ctx.font = `${Math.max(20, Math.floor(img.width / 20))}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 対角線上にウォーターマークを描画
        const diagonal = Math.sqrt(img.width * img.width + img.height * img.height);
        const numRepeats = Math.ceil(diagonal / 300);
        
        for (let i = 0; i < numRepeats; i++) {
          const x = img.width / 2;
          const y = (i * 300) - 150;
          
          // 45度回転
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-Math.PI / 4);
          ctx.fillText(watermarkText, 0, 0);
          ctx.strokeText(watermarkText, 0, 0);
          ctx.restore();
        }
        
        // BlobとしてエクスポートしてURLを解放
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('ウォーターマークの追加に失敗しました。'));
          }
        }, 'image/jpeg', 0.9);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('画像の読み込みに失敗しました。'));
      };
      
      img.src = objectUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 画像をぼかす関数
 * @param imageData 元の画像データ（Blob）
 * @param blurAmount ぼかしの強さ（ピクセル単位）
 * @returns ぼかし処理された画像データ（Blob）
 */
export async function blurImage(imageData: Blob, blurAmount: number = 5): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // 画像をロード
      const img = new Image();
      const objectUrl = URL.createObjectURL(imageData);
      
      img.onload = () => {
        // キャンバスを作成
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 画像を描画
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('キャンバスコンテキストの取得に失敗しました。'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // ぼかしフィルターを適用
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.drawImage(canvas, 0, 0);
        
        // BlobとしてエクスポートしてURLを解放
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('画像のぼかし処理に失敗しました。'));
          }
        }, 'image/jpeg', 0.9);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('画像の読み込みに失敗しました。'));
      };
      
      img.src = objectUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 画像の品質を下げる関数
 * @param imageData 元の画像データ（Blob）
 * @param quality 品質（0.0〜1.0）
 * @returns 品質を下げた画像データ（Blob）
 */
export async function reduceQuality(imageData: Blob, quality: number = 0.5): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // 画像をロード
      const img = new Image();
      const objectUrl = URL.createObjectURL(imageData);
      
      img.onload = () => {
        // キャンバスを作成
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 画像を描画
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('キャンバスコンテキストの取得に失敗しました。'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // 指定した品質でBlobとしてエクスポートしてURLを解放
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('画像の品質低下処理に失敗しました。'));
          }
        }, 'image/jpeg', quality);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('画像の読み込みに失敗しました。'));
      };
      
      img.src = objectUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * サンプル画像を作成する関数（プレビュー用）
 * リサイズ、ウォーターマーク追加、ぼかし、品質低下を組み合わせる
 * @param imageData 元の画像データ（Blob）
 * @returns サンプル画像データ（Blob）
 */
export async function createSampleImage(imageData: Blob): Promise<Blob> {
  try {
    // リサイズ
    const resized = await resizeImage(imageData, 800, 800);
    
    // ウォーターマーク追加
    const watermarked = await addWatermark(resized);
    
    // 品質低下
    const lowQuality = await reduceQuality(watermarked, 0.6);
    
    return lowQuality;
  } catch (error) {
    console.error('サンプル画像の作成に失敗しました:', error);
    throw error;
  }
} 