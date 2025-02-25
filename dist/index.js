"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const line_1 = __importDefault(require("./routes/line"));
const api_1 = __importDefault(require("./routes/api"));
const scheduler_1 = require("./services/scheduler");
// 環境変数の検証
if (!(0, config_1.validateConfig)()) {
    console.error('Invalid configuration. Please check your environment variables.');
    process.exit(1);
}
// Expressアプリケーションの作成
const app = (0, express_1.default)();
// ミドルウェアの設定
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
// ルートの設定
app.use('/line', line_1.default);
app.use('/api', api_1.default);
// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// ルートエンドポイント
app.get('/', (req, res) => {
    res.status(200).json({
        message: '奥様の愚痴を旦那様に伝えるLINE Botシステム',
        version: '1.0.0',
    });
});
// サーバーの起動
app.listen(config_1.serverConfig.port, () => {
    console.log(`Server is running on port ${config_1.serverConfig.port} in ${config_1.serverConfig.nodeEnv} mode`);
    // スケジューラーの初期化
    const scheduler = (0, scheduler_1.initScheduler)();
    // プロセス終了時のクリーンアップ
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        clearInterval(scheduler);
        process.exit(0);
    });
    process.on('SIGINT', () => {
        console.log('SIGINT received, shutting down gracefully');
        clearInterval(scheduler);
        process.exit(0);
    });
});
