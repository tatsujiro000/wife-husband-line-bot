"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUserRelationship = exports.getWifeIdForHusband = exports.getHusbandIdForWife = exports.saveUserSettings = exports.getUserSettings = exports.saveMessageHistory = exports.markGrumbleAsProcessed = exports.getUnprocessedGrumbles = exports.saveGrumble = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("../config");
// テスト環境かどうかを判定
const isDevelopment = process.env.NODE_ENV === 'development';
// Supabaseクライアントの作成
const supabase = (0, supabase_js_1.createClient)(config_1.supabaseConfig.url, config_1.supabaseConfig.key);
// 愚痴データの保存
const saveGrumble = (grumbleData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabase
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
    }
    catch (error) {
        // テスト環境ではエラーをログに出力するだけ
        if (isDevelopment) {
            console.error('Error saving grumble (development mode):', error);
            return [Object.assign(Object.assign({ id: 999 }, grumbleData), { posted_at: new Date().toISOString() })];
        }
        throw error;
    }
});
exports.saveGrumble = saveGrumble;
// 愚痴データの取得（未処理のもの）
const getUnprocessedGrumbles = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 3) {
    try {
        const { data, error } = yield supabase
            .from('grumble_data')
            .select('*')
            .is('processed', false)
            .order('posted_at', { ascending: true })
            .limit(limit);
        if (error) {
            console.error('Error fetching unprocessed grumbles:', error);
            throw error;
        }
        return data;
    }
    catch (error) {
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
});
exports.getUnprocessedGrumbles = getUnprocessedGrumbles;
// 愚痴データを処理済みとしてマーク
const markGrumbleAsProcessed = (grumbleId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabase
            .from('grumble_data')
            .update({ processed: true })
            .eq('id', grumbleId)
            .select();
        if (error) {
            console.error('Error marking grumble as processed:', error);
            throw error;
        }
        return data;
    }
    catch (error) {
        // テスト環境ではエラーをログに出力するだけ
        if (isDevelopment) {
            console.error('Error marking grumble as processed (development mode):', error);
            return [{ id: grumbleId, processed: true }];
        }
        throw error;
    }
});
exports.markGrumbleAsProcessed = markGrumbleAsProcessed;
// メッセージ履歴の保存
const saveMessageHistory = (messageHistory) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabase
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
    }
    catch (error) {
        // テスト環境ではエラーをログに出力するだけ
        if (isDevelopment) {
            console.error('Error saving message history (development mode):', error);
            return [Object.assign(Object.assign({ id: 999 }, messageHistory), { sent_at: new Date().toISOString() })];
        }
        throw error;
    }
});
exports.saveMessageHistory = saveMessageHistory;
// ユーザー設定の取得
const getUserSettings = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error && error.code !== 'PGRST116') {
            // PGRST116はレコードが見つからない場合のエラーコード
            console.error('Error fetching user settings:', error);
            throw error;
        }
        return data;
    }
    catch (error) {
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
});
exports.getUserSettings = getUserSettings;
// ユーザー設定の保存または更新
const saveUserSettings = (settings) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingSettings = yield (0, exports.getUserSettings)(settings.user_id);
        if (existingSettings) {
            // 既存の設定を更新
            const { data, error } = yield supabase
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
        }
        else {
            // 新しい設定を作成
            const { data, error } = yield supabase
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
    }
    catch (error) {
        // テスト環境ではダミーデータを返す
        if (isDevelopment) {
            console.error('Error saving user settings (development mode):', error);
            return [settings];
        }
        throw error;
    }
});
exports.saveUserSettings = saveUserSettings;
// ユーザー関係の取得（奥様IDから旦那様IDを取得）
const getHusbandIdForWife = (wifeUserId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabase
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
        return (data === null || data === void 0 ? void 0 : data.husband_user_id) || null;
    }
    catch (error) {
        // テスト環境ではダミーデータを返す
        if (isDevelopment) {
            console.log('Using mock husband ID for wife in development mode');
            return 'test_user_husband';
        }
        throw error;
    }
});
exports.getHusbandIdForWife = getHusbandIdForWife;
// ユーザー関係の取得（旦那様IDから奥様IDを取得）
const getWifeIdForHusband = (husbandUserId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabase
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
        return (data === null || data === void 0 ? void 0 : data.wife_user_id) || null;
    }
    catch (error) {
        // テスト環境ではダミーデータを返す
        if (isDevelopment) {
            console.log('Using mock wife ID for husband in development mode');
            return 'test_user_wife';
        }
        throw error;
    }
});
exports.getWifeIdForHusband = getWifeIdForHusband;
// ユーザー関係の保存
const saveUserRelationship = (relationship) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 既存の関係を確認
        const { data: existingData, error: existingError } = yield supabase
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
        const { data, error } = yield supabase
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
    }
    catch (error) {
        // テスト環境ではダミーデータを返す
        if (isDevelopment) {
            console.error('Error saving user relationship (development mode):', error);
            return [Object.assign({ id: 999 }, relationship)];
        }
        throw error;
    }
});
exports.saveUserRelationship = saveUserRelationship;
