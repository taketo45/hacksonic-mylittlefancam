import { RekognitionClient, DetectFacesCommand, CompareFacesCommand, DetectLabelsCommand } from '@aws-sdk/client-rekognition';

// AWS認証情報の設定
const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * 画像から顔を検出し、表情を分析する関数
 * @param imageData 画像データ（Buffer）
 * @returns 検出された顔の情報と表情
 */
export async function detectFaces(imageData: Buffer) {
  try {
    const command = new DetectFacesCommand({
      Image: {
        Bytes: imageData,
      },
      Attributes: ['ALL'],
    });

    const response = await rekognitionClient.send(command);
    return response.FaceDetails;
  } catch (error) {
    console.error('顔検出に失敗しました:', error);
    throw error;
  }
}

/**
 * 2つの画像間で顔を比較する関数
 * @param sourceImageData ソース画像データ（Buffer）
 * @param targetImageData ターゲット画像データ（Buffer）
 * @param similarityThreshold 類似度のしきい値（0-100）
 * @returns 一致した顔の情報
 */
export async function compareFaces(
  sourceImageData: Buffer,
  targetImageData: Buffer,
  similarityThreshold: number = 80
) {
  try {
    const command = new CompareFacesCommand({
      SourceImage: {
        Bytes: sourceImageData,
      },
      TargetImage: {
        Bytes: targetImageData,
      },
      SimilarityThreshold: similarityThreshold,
    });

    const response = await rekognitionClient.send(command);
    return response.FaceMatches;
  } catch (error) {
    console.error('顔比較に失敗しました:', error);
    throw error;
  }
}

/**
 * 画像内のラベル（オブジェクト、シーンなど）を検出する関数
 * @param imageData 画像データ（Buffer）
 * @param minConfidence 最小信頼度（0-100）
 * @returns 検出されたラベルの情報
 */
export async function detectLabels(imageData: Buffer, minConfidence: number = 70) {
  try {
    const command = new DetectLabelsCommand({
      Image: {
        Bytes: imageData,
      },
      MinConfidence: minConfidence,
    });

    const response = await rekognitionClient.send(command);
    return response.Labels;
  } catch (error) {
    console.error('ラベル検出に失敗しました:', error);
    throw error;
  }
}

/**
 * 画像内の人物の表情を分析する関数
 * @param imageData 画像データ（Buffer）
 * @returns 表情の分析結果
 */
export async function analyzeEmotions(imageData: Buffer) {
  try {
    const faceDetails = await detectFaces(imageData);
    
    if (!faceDetails || faceDetails.length === 0) {
      return { hasEmotions: false, emotions: [] };
    }
    
    // 各顔の感情を抽出
    const emotionsData = faceDetails.map(face => {
      const emotions = face?.Emotions || [];
      // 感情を信頼度の高い順にソート
      return emotions.sort((a, b) => (b.Confidence || 0) - (a.Confidence || 0));
    });
    
    return {
      hasEmotions: true,
      emotions: emotionsData,
    };
  } catch (error) {
    console.error('感情分析に失敗しました:', error);
    throw error;
  }
}

/**
 * 画像に子供が含まれているかを判定する関数
 * @param imageData 画像データ（Buffer）
 * @returns 子供が含まれているかどうか
 */
export async function containsChild(imageData: Buffer) {
  try {
    const labels = await detectLabels(imageData);
    
    // 'Child'または'Kid'ラベルを検索
    const childLabels = labels?.filter(
      label => label.Name === 'Child' || label.Name === 'Kid' || label.Name === 'Person'
    );
    
    return {
      containsChild: childLabels && childLabels.length > 0,
      confidence: childLabels && childLabels.length > 0 ? childLabels[0].Confidence : 0,
    };
  } catch (error) {
    console.error('子供の検出に失敗しました:', error);
    throw error;
  }
}

/**
 * 画像に特定の子供が含まれているかを判定する関数
 * @param imageData 画像データ（Buffer）
 * @param childFaceData 子供の顔画像データ（Buffer）
 * @returns 特定の子供が含まれているかどうか
 */
export async function containsSpecificChild(imageData: Buffer, childFaceData: Buffer) {
  try {
    const matches = await compareFaces(childFaceData, imageData, 70);
    
    return {
      containsSpecificChild: matches && matches.length > 0,
      similarity: matches && matches.length > 0 ? matches[0].Similarity : 0,
      faceMatches: matches,
    };
  } catch (error) {
    console.error('特定の子供の検出に失敗しました:', error);
    throw error;
  }
}

/**
 * 画像がポジティブな感情を表しているかを判定する関数
 * @param imageData 画像データ（Buffer）
 * @returns ポジティブな感情かどうか
 */
export async function isPositiveEmotion(imageData: Buffer) {
  try {
    const { emotions } = await analyzeEmotions(imageData);
    
    if (emotions.length === 0) {
      return { isPositive: false, confidence: 0 };
    }
    
    // 各顔の最も強い感情を取得
    const dominantEmotions = emotions.map(emotionList => emotionList[0]);
    
    // ポジティブな感情（HAPPY, SURPRISED）をカウント
    const positiveEmotions = dominantEmotions.filter(
      emotion => emotion.Type === 'HAPPY' || emotion.Type === 'SURPRISED'
    );
    
    // 半数以上の顔がポジティブな感情を示している場合、ポジティブと判定
    const isPositive = positiveEmotions.length >= dominantEmotions.length / 2;
    
    // 平均信頼度を計算
    const avgConfidence = positiveEmotions.reduce((sum, emotion) => sum + (emotion.Confidence || 0), 0) / 
                          (positiveEmotions.length || 1);
    
    return {
      isPositive,
      confidence: avgConfidence,
    };
  } catch (error) {
    console.error('感情判定に失敗しました:', error);
    throw error;
  }
} 