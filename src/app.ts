import express from 'express';
import cors from 'cors';
import { validateConfig } from './config';
import lineRoutes from './routes/line';
import apiRoutes from './routes/api';
import healthRoutes from './routes/health';

// 設定の検証
if (!validateConfig()) {
  console.error('必要な環境変数が設定されていません。');
  process.exit(1);
}

const app = express();

// ミドルウェアの設定
app.use(cors());

// LINE Webhookのために生のリクエストボディを保持
app.use('/line/webhook', express.raw({ type: 'application/json' }));

// その他のルートではJSONをパース
app.use(express.json());

// リクエストボディのデバッグ用ミドルウェア
app.use((req, res, next) => {
  console.log('Request path:', req.path);
  console.log('Content-Type:', req.headers['content-type']);
  if (req.path.startsWith('/line/webhook')) {
    console.log('Raw body available:', !!req.body);
    if (req.body) {
      try {
        // 生のバッファをJSONとしてパース
        const jsonBody = JSON.parse(req.body.toString());
        console.log('Parsed webhook body:', jsonBody);
        req.body = jsonBody; // パースしたボディを設定
      } catch (error) {
        console.error('Error parsing webhook body:', error);
      }
    }
  }
  next();
});

// ルートの設定
app.use('/line', lineRoutes);
app.use('/api', apiRoutes);
app.use('/', healthRoutes);

export default app; 