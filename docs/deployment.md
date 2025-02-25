# デプロイ方法

このドキュメントでは、「奥様の愚痴を旦那様に伝えるLINE Botシステム」をRenderにデプロイする方法について説明します。

## 前提条件

- GitHubアカウント
- Renderアカウント
- Supabaseプロジェクト（セットアップ済み）
- LINE Developersアカウント（2つのMessaging APIチャネル作成済み）
- Difyアカウント（APIキー取得済み）

## デプロイ手順

### 1. GitHubリポジトリの準備

1. GitHubにリポジトリを作成します。
2. ローカルのプロジェクトをGitHubリポジトリにプッシュします。

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Renderでのデプロイ設定

1. Renderにログインし、ダッシュボードから「New Web Service」をクリックします。
2. 「Connect a repository」セクションで、GitHubリポジトリを選択します。
3. 以下の設定を行います：
   - **Name**: with-wife-bot（任意の名前）
   - **Environment**: Node
   - **Region**: お好みのリージョン（例：Singapore）
   - **Branch**: main
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free（または必要に応じて有料プラン）

4. 「Environment Variables」セクションで、以下の環境変数を設定します：

```
LINE_CHANNEL_SECRET_WIFE=<奥様用LINEチャネルシークレット>
LINE_CHANNEL_ACCESS_TOKEN_WIFE=<奥様用LINEチャネルアクセストークン>
LINE_CHANNEL_SECRET_HUSBAND=<旦那様用LINEチャネルシークレット>
LINE_CHANNEL_ACCESS_TOKEN_HUSBAND=<旦那様用LINEチャネルアクセストークン>
SUPABASE_URL=<SupabaseプロジェクトURL>
SUPABASE_KEY=<Supabaseプロジェクトの匿名キー>
DIFY_API_KEY=<DifyのAPIキー>
DIFY_API_URL=<DifyのAPIエンドポイントURL>
PORT=10000
NODE_ENV=production
```

5. 「Create Web Service」ボタンをクリックしてデプロイを開始します。

### 3. LINE Botのwebhook URLの設定

デプロイが完了したら、LINE DevelopersコンソールでwebhookのURLを設定します。

1. 奥様用LINE Botの設定：
   - Webhook URL: `https://<your-render-app-url>/line/webhook/wife`
   - Webhook利用を有効にする

2. 旦那様用LINE Botの設定：
   - Webhook URL: `https://<your-render-app-url>/line/webhook/husband`
   - Webhook利用を有効にする

### 4. デプロイの確認

1. ブラウザで `https://<your-render-app-url>/health` にアクセスし、`{"status":"ok"}` が返ってくることを確認します。
2. 奥様用LINE Botに友達追加し、メッセージを送信してみます。
3. 旦那様用LINE Botに友達追加し、設定コマンド（例：`/frequency 5`）を送信してみます。

## 継続的デプロイ

Renderは、GitHubリポジトリへの変更を自動的に検出し、デプロイを行います。新しい変更をプッシュするだけで、アプリケーションが自動的に更新されます。

## スケーリング

トラフィックが増加した場合は、Renderの有料プランにアップグレードして、より多くのリソースを割り当てることができます。

## トラブルシューティング

### デプロイに失敗する場合

1. Renderのログを確認して、エラーの原因を特定します。
2. 環境変数が正しく設定されているか確認します。
3. ビルドコマンドとスタートコマンドが正しいか確認します。

### LINE Botが応答しない場合

1. Webhook URLが正しく設定されているか確認します。
2. LINE Developersコンソールで「Webhook利用」が有効になっているか確認します。
3. Renderのログを確認して、エラーがないか確認します。

### データベース接続エラーが発生する場合

1. Supabaseの接続情報（URL、キー）が正しいか確認します。
2. Supabaseプロジェクトが稼働しているか確認します。
3. RLSポリシーが正しく設定されているか確認します。 