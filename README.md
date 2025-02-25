# 奥様の愚痴を旦那様に伝えるLINE Botシステム

奥様の愚痴を適切に分析し、旦那様に伝えるLINE Botシステムです。奥様の感情を理解し、旦那様に適切な形でメッセージを届けます。

## 機能

- 奥様の愚痴をLINE Botで受け取り、感情分析
- 愚痴の内容を適切に要約し、旦那様に伝わりやすい形に変換
- 定期的に旦那様へメッセージを送信（頻度と時間は設定可能）
- 旦那様からの返信を奥様に伝達

## 技術スタック

- Node.js + Express + TypeScript
- LINE Messaging API
- Supabase (PostgreSQL)
- Dify API (感情分析・テキスト生成)

## 環境構築

### 前提条件

- Node.js 18以上
- npm 9以上
- LINE Developersアカウント
- Supabaseアカウント
- Difyアカウント

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/wife-husband-line-bot.git
cd wife-husband-line-bot

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して必要な情報を入力
```

### 環境変数の設定

`.env`ファイルに以下の情報を設定してください：

```
# LINE Bot設定（奥様用）
LINE_CHANNEL_SECRET_WIFE=your_line_channel_secret_for_wife
LINE_CHANNEL_ACCESS_TOKEN_WIFE=your_line_channel_access_token_for_wife

# LINE Bot設定（旦那様用）
LINE_CHANNEL_SECRET_HUSBAND=your_line_channel_secret_for_husband
LINE_CHANNEL_ACCESS_TOKEN_HUSBAND=your_line_channel_access_token_for_husband

# Supabase設定
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# Dify API設定
DIFY_API_KEY=your_dify_api_key
DIFY_API_URL=your_dify_api_url

# サーバー設定
PORT=3000
NODE_ENV=development # 開発時はdevelopment、本番環境ではproduction
```

### データベース設定

Supabaseで以下のテーブルを作成してください：

1. `grumble_data` - 愚痴データの保存
2. `message_history` - メッセージ履歴の保存
3. `user_settings` - ユーザー設定の保存
4. `user_relationships` - 奥様と旦那様の関係性の保存

詳細なスキーマについては `docs/database.md` を参照してください。

## 開発

```bash
# 開発サーバーの起動
npm run dev

# TypeScriptのコンパイル
npm run build

# 本番モードでの起動
npm start
```

## デプロイ

### Renderへのデプロイ

1. GitHubリポジトリにコードをプッシュします。

2. [Render](https://render.com/)にアクセスし、新しいWebサービスを作成します。

3. GitHubリポジトリと連携し、以下の設定を行います：
   - ビルドコマンド: `npm install && npm run build`
   - 開始コマンド: `npm start`

4. 環境変数を設定します（`.env`ファイルの内容をRenderの環境変数設定に追加）。

5. デプロイを開始します。

6. デプロイ後、LINE DevelopersコンソールでWebhook URLを更新します：
   - 奥様用Webhook URL: `https://<your-render-app-url>/line/webhook/wife`
   - 旦那様用Webhook URL: `https://<your-render-app-url>/line/webhook/husband`

## API

### エンドポイント

- `POST /line/webhook/wife` - 奥様からのLINEメッセージを受信
- `POST /line/webhook/husband` - 旦那様からのLINEメッセージを受信
- `POST /api/grumble` - 愚痴を投稿
- `POST /api/settings` - ユーザー設定を更新
- `GET /api/settings/:userId` - ユーザー設定を取得
- `POST /api/send-messages` - メッセージを手動で送信

詳細なAPIドキュメントについては `docs/api.md` を参照してください。

## ライセンス

MIT

## 作者

Your Name 