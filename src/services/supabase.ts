import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config';

// テスト環境かどうかを判定
const isDevelopment = process.env.NODE_ENV === 'development';

// Supabaseクライアントの作成
const supabase = createClient(supabaseConfig.url, supabaseConfig.key);

// 愚痴データの型定義
export interface GrumbleData {
  id?: number;
  user_id: string;
  posted_at?: string;
  original_text: string;
  sentiment_analysis?: string;
  summary?: string;
}

// メッセージ履歴の型定義
export interface MessageHistory {
  id?: number;
  sender_id: string;
  receiver_id: string;
  sent_at?: string;
  message_content: string;
}

// ユーザー設定の型定義
export interface UserSettings {
  user_id: string;
  sending_frequency: number;
  sending_time: string;
}

// ユーザー関係の型定義
export interface UserRelationship {
  id?: number;
  wife_user_id: string;
  husband_user_id: string;
}

// 愚痴データの保存
export const saveGrumble = async (grumbleData: GrumbleData) => {
  try {
    const { data, error } = await supabase
      .from('grumble_data')
      .insert([
        {
          user_id: grumbleData.user_id,
          posted_at: new Date().toISOString(),
          original_text: grumbleData.original_text,
          sentiment_analysis: grumbleData.sentiment_analysis,
          summary: grumbleData.summary,
        },
      ])
      .select();

    if (error) {
      console.error('Error saving grumble:', error);
      throw error;
    }

    return data;
  } catch (error) {
    // テスト環境ではエラーをログに出力するだけ
    if (isDevelopment) {
      console.error('Error saving grumble (development mode):', error);
      return [{ id: 999, ...grumbleData, posted_at: new Date().toISOString() }];
    }
    throw error;
  }
};

// 愚痴データの取得（未処理のもの）
export const getUnprocessedGrumbles = async (limit: number = 3) => {
  try {
    const { data, error } = await supabase
      .from('grumble_data')
      .select('*')
      .is('processed', false)
      .order('posted_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching unprocessed grumbles:', error);
      throw error;
    }

    return data as GrumbleData[];
  } catch (error) {
    // テスト環境ではダミーデータを返す
    if (isDevelopment) {
      console.error('Error fetching unprocessed grumbles (development mode):', error);
      return [
        {
          id: 1,
          user_id: 'test_user_wife',
          posted_at: new Date().toISOString(),
          original_text: '今日も夫は家事を手伝ってくれなかった。疲れているのに自分だけが家事をするのは不公平だと思う。',
          sentiment_analysis: JSON.stringify({ sentiment: 'negative', score: 0.8 }),
          summary: '家事の不公平さに対する不満',
          processed: false
        }
      ];
    }
    throw error;
  }
};

// 愚痴データを処理済みとしてマーク
export const markGrumbleAsProcessed = async (grumbleId: number) => {
  try {
    const { data, error } = await supabase
      .from('grumble_data')
      .update({ processed: true })
      .eq('id', grumbleId)
      .select();

    if (error) {
      console.error('Error marking grumble as processed:', error);
      throw error;
    }

    return data;
  } catch (error) {
    // テスト環境ではエラーをログに出力するだけ
    if (isDevelopment) {
      console.error('Error marking grumble as processed (development mode):', error);
      return [{ id: grumbleId, processed: true }];
    }
    throw error;
  }
};

// メッセージ履歴の保存
export const saveMessageHistory = async (messageHistory: MessageHistory) => {
  try {
    const { data, error } = await supabase
      .from('message_history')
      .insert([
        {
          sender_id: messageHistory.sender_id,
          receiver_id: messageHistory.receiver_id,
          sent_at: new Date().toISOString(),
          message_content: messageHistory.message_content,
        },
      ])
      .select();

    if (error) {
      console.error('Error saving message history:', error);
      throw error;
    }

    return data;
  } catch (error) {
    // テスト環境ではエラーをログに出力するだけ
    if (isDevelopment) {
      console.error('Error saving message history (development mode):', error);
      return [{ id: 999, ...messageHistory, sent_at: new Date().toISOString() }];
    }
    throw error;
  }
};

// ユーザー設定の取得
export const getUserSettings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116はレコードが見つからない場合のエラーコード
      console.error('Error fetching user settings:', error);
      throw error;
    }

    return data as UserSettings | null;
  } catch (error) {
    // テスト環境ではダミーデータを返す
    if (isDevelopment) {
      console.error('Error fetching user settings (development mode):', error);
      return {
        user_id: userId,
        sending_frequency: 3,
        sending_time: '18:00'
      };
    }
    throw error;
  }
};

// ユーザー設定の保存または更新
export const saveUserSettings = async (settings: UserSettings) => {
  try {
    const existingSettings = await getUserSettings(settings.user_id);

    if (existingSettings) {
      // 既存の設定を更新
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          sending_frequency: settings.sending_frequency,
          sending_time: settings.sending_time,
        })
        .eq('user_id', settings.user_id)
        .select();

      if (error) {
        console.error('Error updating user settings:', error);
        throw error;
      }

      return data;
    } else {
      // 新しい設定を作成
      const { data, error } = await supabase
        .from('user_settings')
        .insert([
          {
            user_id: settings.user_id,
            sending_frequency: settings.sending_frequency,
            sending_time: settings.sending_time,
          },
        ])
        .select();

      if (error) {
        console.error('Error creating user settings:', error);
        throw error;
      }

      return data;
    }
  } catch (error) {
    // テスト環境ではダミーデータを返す
    if (isDevelopment) {
      console.error('Error saving user settings (development mode):', error);
      return [settings];
    }
    throw error;
  }
};

// ユーザー関係の取得（奥様IDから旦那様IDを取得）
export const getHusbandIdForWife = async (wifeUserId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('user_relationships')
      .select('husband_user_id')
      .eq('wife_user_id', wifeUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが見つからない場合
        return null;
      }
      console.error('Error fetching husband ID for wife:', error);
      throw error;
    }

    return data?.husband_user_id || null;
  } catch (error) {
    // テスト環境ではダミーデータを返す
    if (isDevelopment) {
      console.log('Using mock husband ID for wife in development mode');
      return 'test_user_husband';
    }
    throw error;
  }
};

// ユーザー関係の取得（旦那様IDから奥様IDを取得）
export const getWifeIdForHusband = async (husbandUserId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('user_relationships')
      .select('wife_user_id')
      .eq('husband_user_id', husbandUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが見つからない場合
        return null;
      }
      console.error('Error fetching wife ID for husband:', error);
      throw error;
    }

    return data?.wife_user_id || null;
  } catch (error) {
    // テスト環境ではダミーデータを返す
    if (isDevelopment) {
      console.log('Using mock wife ID for husband in development mode');
      return 'test_user_wife';
    }
    throw error;
  }
};

// ユーザー関係の保存
export const saveUserRelationship = async (relationship: UserRelationship) => {
  try {
    // 既存の関係を確認
    const { data: existingData, error: existingError } = await supabase
      .from('user_relationships')
      .select('*')
      .eq('wife_user_id', relationship.wife_user_id)
      .eq('husband_user_id', relationship.husband_user_id)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing relationship:', existingError);
      throw existingError;
    }

    // 既存の関係がある場合は何もしない
    if (existingData) {
      return existingData;
    }

    // 新しい関係を作成
    const { data, error } = await supabase
      .from('user_relationships')
      .insert([
        {
          wife_user_id: relationship.wife_user_id,
          husband_user_id: relationship.husband_user_id,
        },
      ])
      .select();

    if (error) {
      console.error('Error saving user relationship:', error);
      throw error;
    }

    return data;
  } catch (error) {
    // テスト環境ではダミーデータを返す
    if (isDevelopment) {
      console.error('Error saving user relationship (development mode):', error);
      return [{ id: 999, ...relationship }];
    }
    throw error;
  }
}; 