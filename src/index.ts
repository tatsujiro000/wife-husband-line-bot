import express from 'express';
import cors from 'cors';
import { serverConfig, validateConfig } from './config';
import lineRoutes from './routes/line';
import apiRoutes from './routes/api';
import { initScheduler } from './services/scheduler';
import appInstance from './app';

// 環境変数の検証
if (!validateConfig()) {
  console.error('Invalid configuration. Please check your environment variables.');
  process.exit(1);
}

// Expressアプリケーションの作成
const app = express();

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ルートの設定
app.use('/line', lineRoutes);
app.use('/api', apiRoutes);

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
const server = appInstance.listen(serverConfig.port, () => {
  console.log(`Server is running on port ${serverConfig.port} in ${serverConfig.nodeEnv} mode`);
  
  // スケジューラーの初期化
  const scheduler = initScheduler();
  
  // プロセス終了時のクリーンアップ
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    clearInterval(scheduler);
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    clearInterval(scheduler);
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}); 