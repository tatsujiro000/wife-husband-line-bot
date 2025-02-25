import express from 'express';
import cors from 'cors';
import { validateConfig } from './config';
import lineRoutes from './routes/line';
import apiRoutes from './routes/api';
import { json } from 'body-parser';
import { raw } from 'body-parser';

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
app.use('/line/webhook', raw({ type: 'application/json' }), (req, res, next) => {
  try {
    const rawBody = req.body.toString('utf8');
    req.rawBody = rawBody;
    
    try {
      req.body = JSON.parse(rawBody);
      console.log('Parsed webhook body:', req.body);
    } catch (error) {
      console.error('Error parsing webhook body:', error);
      req.body = {};
    }
    next();
  } catch (error) {
    console.error('Error processing raw body:', error);
    next(error);
  }
});

// テスト用Webhookエンドポイントのためのミドルウェア
app.use('/line/test-webhook', json(), (req, res, next) => {
  console.log('Test webhook body:', req.body);
  next();
});

// その他のルートではJSONをパース
app.use(json());

// リクエストボディのデバッグ用ミドルウェア
app.use((req, res, next) => {
  console.log('Request path:', req.path);
  console.log('Content-Type:', req.headers['content-type']);
  if (!req.path.startsWith('/line/webhook') && !req.path.startsWith('/line/test-webhook')) {
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

// テスト用のヘルプページ
app.get('/test-help', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>LINE Bot テストヘルプ</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
          h1 { color: #333; }
          h2 { color: #555; margin-top: 20px; }
          .endpoint { color: #0066cc; }
        </style>
      </head>
      <body>
        <h1>LINE Bot テストヘルプ</h1>
        
        <h2>テスト用エンドポイント</h2>
        <p>署名検証をスキップするテスト用エンドポイント：</p>
        <p class="endpoint">POST /line/test-webhook/wife</p>
        <p class="endpoint">POST /line/test-webhook/husband</p>
        
        <h2>テスト方法</h2>
        <p>以下のようなJSONをPOSTしてください：</p>
        <pre>
{
  "events": [
    {
      "type": "message",
      "message": {
        "type": "text",
        "id": "12345",
        "text": "テストメッセージ"
      },
      "timestamp": 1625097587123,
      "source": {
        "type": "user",
        "userId": "test_user_wife"
      },
      "replyToken": "test-reply-token",
      "mode": "active"
    }
  ]
}
        </pre>
        
        <h2>curlコマンド例</h2>
        <pre>
curl -X POST https://wife-husband-line-bot.onrender.com/line/test-webhook/wife \\
  -H "Content-Type: application/json" \\
  -d '{"events":[{"type":"message","message":{"type":"text","id":"12345","text":"テストメッセージ"},"timestamp":1625097587123,"source":{"type":"user","userId":"test_user_wife"},"replyToken":"test-reply-token","mode":"active"}]}'
        </pre>
      </body>
    </html>
  `);
});

export default app; 