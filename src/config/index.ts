import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

// LINE Bot設定（奥様用）
export const lineBotConfigWife = {
  channelSecret: process.env.LINE_CHANNEL_SECRET_WIFE || '',
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN_WIFE || '',
};

// LINE Bot設定（旦那様用）
export const lineBotConfigHusband = {
  channelSecret: process.env.LINE_CHANNEL_SECRET_HUSBAND || '',
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN_HUSBAND || '',
};

// Supabase設定
export const supabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  key: process.env.SUPABASE_KEY || '',
};

// Dify API設定
export const difyConfig = {
  apiKey: process.env.DIFY_API_KEY || '',
  apiUrl: process.env.DIFY_API_URL || '',
};

// サーバー設定
export const serverConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};

// 設定の検証
export const validateConfig = (): boolean => {
  const requiredEnvVars = [
    'LINE_CHANNEL_SECRET_WIFE',
    'LINE_CHANNEL_ACCESS_TOKEN_WIFE',
    'LINE_CHANNEL_SECRET_HUSBAND',
    'LINE_CHANNEL_ACCESS_TOKEN_HUSBAND',
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'DIFY_API_KEY',
    'DIFY_API_URL',
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    return false;
  }

  return true;
}; 