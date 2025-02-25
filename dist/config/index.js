"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = exports.serverConfig = exports.difyConfig = exports.supabaseConfig = exports.lineBotConfigHusband = exports.lineBotConfigWife = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// 環境変数の読み込み
dotenv_1.default.config();
// LINE Bot設定（奥様用）
exports.lineBotConfigWife = {
    channelSecret: process.env.LINE_CHANNEL_SECRET_WIFE || '',
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN_WIFE || '',
};
// LINE Bot設定（旦那様用）
exports.lineBotConfigHusband = {
    channelSecret: process.env.LINE_CHANNEL_SECRET_HUSBAND || '',
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN_HUSBAND || '',
};
// Supabase設定
exports.supabaseConfig = {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || '',
};
// Dify API設定
exports.difyConfig = {
    apiKey: process.env.DIFY_API_KEY || '',
    apiUrl: process.env.DIFY_API_URL || '',
};
// サーバー設定
exports.serverConfig = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
};
// 設定の検証
const validateConfig = () => {
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
    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
        console.error('Missing required environment variables:', missingEnvVars);
        return false;
    }
    return true;
};
exports.validateConfig = validateConfig;
