import express from 'express';
import cors from 'cors';
import { validateConfig } from './config';
import lineRoutes from './routes/line';
import apiRoutes from './routes/api';

// Request型を拡張してrawBodyプロパティを追加
declare global {
  namespace Express {
    interface Request {
      rawBody?: string;
    }
  }
}

// 設定の検証
if (!validateConfig()) {
  console.error('必要な環境変数が設定されていません。');
  process.exit(1);
}

const app = express();

// ミドルウェアの設定
app.use(cors());

// LINE Webhookのために生のリクエストボディを保持
// LINE SDKの署名検証のために、リクエストボディを文字列として保持する必要がある
app.use('/line/webhook', (req, res, next) => {
  let data = '';
  req.setEncoding('utf8');
  
  req.on('data', (chunk) => {
    data += chunk;
  });
  
  req.on('end', () => {
    req.rawBody = data;
    try {
      req.body = JSON.parse(data);
      console.log('Parsed webhook body:', req.body);
    } catch (error) {
      console.error('Error parsing webhook body:', error);
      req.body = {};
    }
    next();
  });
});

// その他のルートではJSONをパース
app.use(express.json());

// リクエストボディのデバッグ用ミドルウェア
app.use((req, res, next) => {
  console.log('Request path:', req.path);
  console.log('Content-Type:', req.headers['content-type']);
  if (!req.path.startsWith('/line/webhook')) {
    console.log('Request body:', req.body);
  }
  next();
});

// ルートの設定
app.use('/line', lineRoutes);
app.use('/api', apiRoutes);

// ヘルスチェックエンドポイント
app.get('/', (req, res) => {
  res.status(200).json({
    message: '奥様の愚痴を旦那様に伝えるLINE Botシステム',
    version: '1.0.0',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app; 