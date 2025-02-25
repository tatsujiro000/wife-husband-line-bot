# Supabaseデータベース設計

このドキュメントでは、「奥様の愚痴を旦那様に伝えるLINE Botシステム」で使用するSupabaseデータベースの設計について説明します。

## テーブル構造

### 1. grumble_data（愚痴データ）テーブル

奥様から送信された愚痴のデータを保存するテーブルです。

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | SERIAL | 主キー |
| user_id | TEXT | 奥様のLINEユーザーID |
| posted_at | TIMESTAMP | 投稿日時 |
| original_text | TEXT | 愚痴の原文 |
| sentiment_analysis | TEXT | 感情分析結果（JSON形式） |
| summary | TEXT | 愚痴の要約 |
| processed | BOOLEAN | 処理済みフラグ（デフォルト: false） |
| created_at | TIMESTAMP | レコード作成日時 |

```sql
CREATE TABLE grumble_data (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  original_text TEXT NOT NULL,
  sentiment_analysis TEXT,
  summary TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_grumble_data_user_id ON grumble_data(user_id);
CREATE INDEX idx_grumble_data_processed ON grumble_data(processed);
CREATE INDEX idx_grumble_data_posted_at ON grumble_data(posted_at);
```

### 2. message_history（メッセージ履歴）テーブル

システムから送信されたメッセージの履歴を保存するテーブルです。

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | SERIAL | 主キー |
| sender_id | TEXT | 送信者ID（'system'または奥様/旦那様のLINEユーザーID） |
| receiver_id | TEXT | 受信者ID（奥様/旦那様のLINEユーザーID） |
| sent_at | TIMESTAMP | 送信日時 |
| message_content | TEXT | メッセージ内容 |
| created_at | TIMESTAMP | レコード作成日時 |

```sql
CREATE TABLE message_history (
  id SERIAL PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_message_history_sender_id ON message_history(sender_id);
CREATE INDEX idx_message_history_receiver_id ON message_history(receiver_id);
CREATE INDEX idx_message_history_sent_at ON message_history(sent_at);
```

### 3. user_settings（ユーザー設定）テーブル

ユーザー（主に旦那様）の設定情報を保存するテーブルです。

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| user_id | TEXT | ユーザーID（主キー） |
| sending_frequency | INTEGER | メッセージ送信頻度（愚痴の数） |
| sending_time | TEXT | メッセージ送信時間（HH:MM形式） |
| created_at | TIMESTAMP | レコード作成日時 |
| updated_at | TIMESTAMP | レコード更新日時 |

```sql
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY,
  sending_frequency INTEGER DEFAULT 3,
  sending_time TEXT DEFAULT '18:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. user_relationships（ユーザー関係）テーブル

奥様と旦那様の関係を管理するテーブルです。

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | SERIAL | 主キー |
| wife_user_id | TEXT | 奥様のLINEユーザーID |
| husband_user_id | TEXT | 旦那様のLINEユーザーID |
| created_at | TIMESTAMP | レコード作成日時 |

```sql
CREATE TABLE user_relationships (
  id SERIAL PRIMARY KEY,
  wife_user_id TEXT NOT NULL,
  husband_user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wife_user_id, husband_user_id)
);

-- インデックス
CREATE INDEX idx_user_relationships_wife_user_id ON user_relationships(wife_user_id);
CREATE INDEX idx_user_relationships_husband_user_id ON user_relationships(husband_user_id);
```

## RLS（Row Level Security）ポリシー

Supabaseでは、セキュリティを強化するためにRLSポリシーを設定することをお勧めします。以下は基本的なポリシーの例です。

```sql
-- すべてのテーブルに対してRLSを有効化
ALTER TABLE grumble_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_relationships ENABLE ROW LEVEL SECURITY;

-- サーバーサイドからのアクセスを許可するポリシー
CREATE POLICY "Server can do anything" ON grumble_data FOR ALL TO authenticated USING (auth.uid() = '00000000-0000-0000-0000-000000000000');
CREATE POLICY "Server can do anything" ON message_history FOR ALL TO authenticated USING (auth.uid() = '00000000-0000-0000-0000-000000000000');
CREATE POLICY "Server can do anything" ON user_settings FOR ALL TO authenticated USING (auth.uid() = '00000000-0000-0000-0000-000000000000');
CREATE POLICY "Server can do anything" ON user_relationships FOR ALL TO authenticated USING (auth.uid() = '00000000-0000-0000-0000-000000000000');
```

## データベース初期化スクリプト

以下のスクリプトを使用して、Supabaseプロジェクトの「SQL Editor」からデータベースを初期化できます。

```sql
-- テーブルの作成
CREATE TABLE grumble_data (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  original_text TEXT NOT NULL,
  sentiment_analysis TEXT,
  summary TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE message_history (
  id SERIAL PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY,
  sending_frequency INTEGER DEFAULT 3,
  sending_time TEXT DEFAULT '18:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_relationships (
  id SERIAL PRIMARY KEY,
  wife_user_id TEXT NOT NULL,
  husband_user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wife_user_id, husband_user_id)
);

-- インデックスの作成
CREATE INDEX idx_grumble_data_user_id ON grumble_data(user_id);
CREATE INDEX idx_grumble_data_processed ON grumble_data(processed);
CREATE INDEX idx_grumble_data_posted_at ON grumble_data(posted_at);

CREATE INDEX idx_message_history_sender_id ON message_history(sender_id);
CREATE INDEX idx_message_history_receiver_id ON message_history(receiver_id);
CREATE INDEX idx_message_history_sent_at ON message_history(sent_at);

CREATE INDEX idx_user_relationships_wife_user_id ON user_relationships(wife_user_id);
CREATE INDEX idx_user_relationships_husband_user_id ON user_relationships(husband_user_id);

-- RLSの設定
ALTER TABLE grumble_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_relationships ENABLE ROW LEVEL SECURITY;

-- サーバーサイドからのアクセスを許可するポリシー
CREATE POLICY "Server can do anything" ON grumble_data FOR ALL TO authenticated USING (auth.uid() = '00000000-0000-0000-0000-000000000000');
CREATE POLICY "Server can do anything" ON message_history FOR ALL TO authenticated USING (auth.uid() = '00000000-0000-0000-0000-000000000000');
CREATE POLICY "Server can do anything" ON user_settings FOR ALL TO authenticated USING (auth.uid() = '00000000-0000-0000-0000-000000000000');
CREATE POLICY "Server can do anything" ON user_relationships FOR ALL TO authenticated USING (auth.uid() = '00000000-0000-0000-0000-000000000000');
``` 