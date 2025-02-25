import axios from 'axios';
import { difyConfig } from '../config';

// テスト環境かどうかを判定
const isDevelopment = process.env.NODE_ENV === 'development';

// Dify APIクライアントの設定
const difyClient = axios.create({
  baseURL: difyConfig.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${difyConfig.apiKey}`,
  },
});

// 感情分析の結果の型定義
export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  summary: string;
}

// 愚痴の分析
export const analyzeGrumble = async (text: string): Promise<SentimentAnalysisResult> => {
  // テスト環境の場合はモックデータを返す
  if (isDevelopment) {
    console.log('Mock analyze grumble:', text);
    return {
      sentiment: 'negative',
      score: 0.8,
      summary: '家事の不公平さに対する不満'
    };
  }

  try {
    const response = await difyClient.post('/chat-messages', {
      inputs: {},
      query: text,
      response_mode: 'blocking',
      user: 'wife-bot-system',
    });

    // Difyからのレスポンスを解析
    const result = response.data;
    
    // レスポンスから感情分析結果を抽出
    // 注: 実際のDify APIのレスポンス形式に合わせて調整が必要
    const sentiment = extractSentiment(result.answer);
    const summary = extractSummary(result.answer);
    
    return {
      sentiment: sentiment.type,
      score: sentiment.score,
      summary,
    };
  } catch (error) {
    console.error('Error analyzing grumble with Dify:', error);
    throw error;
  }
};

// 旦那様へのメッセージ生成
export const generateMessageForHusband = async (
  grumbles: { original_text: string; sentiment_analysis?: string; summary?: string }[],
): Promise<string> => {
  // テスト環境の場合はモックデータを返す
  if (isDevelopment) {
    console.log('Mock generate message for husband:', grumbles);
    return '奥様が家事の負担について不満を感じています。家事の分担について話し合ってみてはいかがでしょうか。';
  }

  try {
    // 愚痴の要約とオリジナルテキストを組み合わせてプロンプトを作成
    const prompt = `
以下は妻からの最近の愚痴です：

${grumbles.map((g, i) => `${i + 1}. ${g.summary || '要約なし'}\n原文: "${g.original_text}"`).join('\n\n')}

これらの愚痴に基づいて、夫に対して適切なメッセージを作成してください。
妻の感情に共感し、夫が取るべき行動や気をつけるべきことを優しく伝えてください。
`;

    const response = await difyClient.post('/chat-messages', {
      inputs: {},
      query: prompt,
      response_mode: 'blocking',
      user: 'husband-bot-system',
    });

    return response.data.answer;
  } catch (error) {
    console.error('Error generating message for husband with Dify:', error);
    throw error;
  }
};

// 奥様への気遣いメッセージ生成
export const generateCareMessageForWife = async (
  recentGrumbles: { original_text: string; sentiment_analysis?: string }[],
): Promise<string | null> => {
  // テスト環境の場合はモックデータを返す
  if (isDevelopment) {
    console.log('Mock generate care message for wife:', recentGrumbles);
    return 'お疲れ様です。少し休息を取ることも大切ですよ。何かお手伝いできることはありますか？';
  }

  try {
    // ネガティブな感情が強い愚痴があるか確認
    const hasStrongNegativeEmotion = recentGrumbles.some(grumble => {
      if (!grumble.sentiment_analysis) return false;
      
      try {
        const sentiment = JSON.parse(grumble.sentiment_analysis);
        return sentiment.sentiment === 'negative' && sentiment.score > 0.7; // 強いネガティブ感情の閾値
      } catch {
        return false;
      }
    });

    // 強いネガティブ感情がない場合はnullを返す
    if (!hasStrongNegativeEmotion) {
      return null;
    }

    // 愚痴の内容に基づいて気遣いメッセージを生成
    const prompt = `
以下は最近の愚痴です：

${recentGrumbles.map((g, i) => `${i + 1}. "${g.original_text}"`).join('\n')}

これらの愚痴から、妻が強いストレスや不満を感じていることがわかります。
妻を気遣い、励ますメッセージを作成してください。
具体的な行動提案や、リラックスするための提案も含めてください。
`;

    const response = await difyClient.post('/chat-messages', {
      inputs: {},
      query: prompt,
      response_mode: 'blocking',
      user: 'wife-care-system',
    });

    return response.data.answer;
  } catch (error) {
    console.error('Error generating care message for wife with Dify:', error);
    throw error;
  }
};

// ヘルパー関数: テキストから感情を抽出
const extractSentiment = (text: string): { type: 'positive' | 'negative' | 'neutral'; score: number } => {
  // 注: 実際のDify APIのレスポンス形式に合わせて実装が必要
  // 以下はダミー実装
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('positive') || lowerText.includes('happy') || lowerText.includes('good')) {
    return { type: 'positive', score: 0.8 };
  } else if (lowerText.includes('negative') || lowerText.includes('sad') || lowerText.includes('angry')) {
    return { type: 'negative', score: 0.8 };
  } else {
    return { type: 'neutral', score: 0.5 };
  }
};

// ヘルパー関数: テキストから要約を抽出
const extractSummary = (text: string): string => {
  // 注: 実際のDify APIのレスポンス形式に合わせて実装が必要
  // 以下はダミー実装
  const summaryMatch = text.match(/summary:(.*?)(\n|$)/i);
  return summaryMatch ? summaryMatch[1].trim() : text.substring(0, 100) + '...';
}; 