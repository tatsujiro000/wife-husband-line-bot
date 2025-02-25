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
exports.sendMessageToWife = exports.sendMessageToHusband = exports.handleHusbandMessage = exports.handleWifeMessage = void 0;
const bot_sdk_1 = require("@line/bot-sdk");
const config_1 = require("../config");
const supabase_1 = require("./supabase");
const dify_1 = require("./dify");
// テスト環境かどうかを判定
const isDevelopment = process.env.NODE_ENV === 'development';
// モッククライアントの作成
function createMockClient() {
    return {
        replyMessage: (token, message) => __awaiter(this, void 0, void 0, function* () {
            console.log('Mock reply message:', { token, message });
            return Promise.resolve({});
        }),
        pushMessage: (to, message) => __awaiter(this, void 0, void 0, function* () {
            console.log('Mock push message:', { to, message });
            return Promise.resolve({});
        })
    };
}
// LINE Bot クライアント（奥様用）
const wifeBotClient = isDevelopment
    ? createMockClient()
    : new bot_sdk_1.Client(config_1.lineBotConfigWife);
// LINE Bot クライアント（旦那様用）
const husbandBotClient = isDevelopment
    ? createMockClient()
    : new bot_sdk_1.Client(config_1.lineBotConfigHusband);
// 奥様からのメッセージ処理
const handleWifeMessage = (event) => __awaiter(void 0, void 0, void 0, function* () {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return;
    }
    const { userId } = event.source;
    const { text } = event.message;
    try {
        // 愚痴を分析
        const analysisResult = yield (0, dify_1.analyzeGrumble)(text);
        // 愚痴をデータベースに保存
        const grumbleData = {
            user_id: userId || 'unknown',
            original_text: text,
            sentiment_analysis: JSON.stringify({
                sentiment: analysisResult.sentiment,
                score: analysisResult.score,
            }),
            summary: analysisResult.summary,
        };
        yield (0, supabase_1.saveGrumble)(grumbleData);
        // 奥様に返信
        yield wifeBotClient.replyMessage(event.replyToken, {
            type: 'text',
            text: '愚痴を受け取りました。旦那様に適切に伝えます。',
        });
        // 強いネガティブ感情がある場合は気遣いメッセージを送信
        if (analysisResult.sentiment === 'negative' && analysisResult.score > 0.7) {
            const careMessage = yield (0, dify_1.generateCareMessageForWife)([grumbleData]);
            if (careMessage) {
                yield wifeBotClient.pushMessage(userId || '', {
                    type: 'text',
                    text: careMessage,
                });
            }
        }
    }
    catch (error) {
        console.error('Error handling wife message:', error);
        // エラー時の返信
        yield wifeBotClient.replyMessage(event.replyToken, {
            type: 'text',
            text: 'すみません、メッセージの処理中にエラーが発生しました。しばらくしてからもう一度お試しください。',
        });
    }
});
exports.handleWifeMessage = handleWifeMessage;
// 旦那様からのメッセージ処理
const handleHusbandMessage = (event) => __awaiter(void 0, void 0, void 0, function* () {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return;
    }
    const { userId } = event.source;
    const { text } = event.message;
    try {
        // コマンド処理
        if (text.startsWith('/')) {
            yield handleHusbandCommand(event);
            return;
        }
        // 通常のメッセージは単に返信
        yield husbandBotClient.replyMessage(event.replyToken, {
            type: 'text',
            text: 'メッセージを受け取りました。設定を変更するには、以下のコマンドを使用してください：\n/frequency [数値] - メッセージの頻度を設定\n/time [時間] - メッセージの送信時間を設定\n/help - ヘルプを表示',
        });
    }
    catch (error) {
        console.error('Error handling husband message:', error);
        // エラー時の返信
        yield husbandBotClient.replyMessage(event.replyToken, {
            type: 'text',
            text: 'すみません、メッセージの処理中にエラーが発生しました。しばらくしてからもう一度お試しください。',
        });
    }
});
exports.handleHusbandMessage = handleHusbandMessage;
// 旦那様へのメッセージ送信
const sendMessageToHusband = (userId, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield husbandBotClient.pushMessage(userId, {
            type: 'text',
            text: message,
        });
        // メッセージ履歴を保存
        yield (0, supabase_1.saveMessageHistory)({
            sender_id: 'system',
            receiver_id: userId,
            message_content: message,
        });
    }
    catch (error) {
        console.error('Error sending message to husband:', error);
        throw error;
    }
});
exports.sendMessageToHusband = sendMessageToHusband;
// 奥様へのメッセージ送信
const sendMessageToWife = (userId, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield wifeBotClient.pushMessage(userId, {
            type: 'text',
            text: message,
        });
        // メッセージ履歴を保存
        yield (0, supabase_1.saveMessageHistory)({
            sender_id: 'system',
            receiver_id: userId,
            message_content: message,
        });
    }
    catch (error) {
        console.error('Error sending message to wife:', error);
        throw error;
    }
});
exports.sendMessageToWife = sendMessageToWife;
// 旦那様のコマンド処理
const handleHusbandCommand = (event) => __awaiter(void 0, void 0, void 0, function* () {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return;
    }
    const { userId } = event.source;
    const { text } = event.message;
    // 頻度設定コマンド
    if (text.startsWith('/frequency')) {
        const frequencyMatch = text.match(/\/frequency\s+(\d+)/);
        if (frequencyMatch && frequencyMatch[1]) {
            const frequency = parseInt(frequencyMatch[1], 10);
            try {
                // 現在の設定を取得
                const currentSettings = yield (0, supabase_1.getUserSettings)(userId || '');
                const sendingTime = (currentSettings === null || currentSettings === void 0 ? void 0 : currentSettings.sending_time) || '18:00';
                // ユーザー設定を更新
                yield (0, supabase_1.saveUserSettings)({
                    user_id: userId || '',
                    sending_frequency: frequency,
                    sending_time: sendingTime,
                });
                yield husbandBotClient.replyMessage(event.replyToken, {
                    type: 'text',
                    text: `メッセージの頻度を ${frequency} に設定しました。`,
                });
            }
            catch (error) {
                console.error('Error updating frequency settings:', error);
                yield husbandBotClient.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '設定の更新中にエラーが発生しました。しばらくしてからもう一度お試しください。',
                });
            }
            return;
        }
    }
    // 時間設定コマンド
    if (text.startsWith('/time')) {
        const timeMatch = text.match(/\/time\s+(\d{1,2}:\d{2})/);
        if (timeMatch && timeMatch[1]) {
            const time = timeMatch[1];
            try {
                // 現在の設定を取得
                const currentSettings = yield (0, supabase_1.getUserSettings)(userId || '');
                const sendingFrequency = (currentSettings === null || currentSettings === void 0 ? void 0 : currentSettings.sending_frequency) || 3;
                // ユーザー設定を更新
                yield (0, supabase_1.saveUserSettings)({
                    user_id: userId || '',
                    sending_frequency: sendingFrequency,
                    sending_time: time,
                });
                yield husbandBotClient.replyMessage(event.replyToken, {
                    type: 'text',
                    text: `メッセージの送信時間を ${time} に設定しました。`,
                });
            }
            catch (error) {
                console.error('Error updating time settings:', error);
                yield husbandBotClient.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '設定の更新中にエラーが発生しました。しばらくしてからもう一度お試しください。',
                });
            }
            return;
        }
    }
    // 設定確認コマンド
    if (text.startsWith('/settings')) {
        try {
            const settings = yield (0, supabase_1.getUserSettings)(userId || '');
            if (!settings) {
                yield husbandBotClient.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '設定が見つかりませんでした。/frequency と /time コマンドを使用して設定してください。',
                });
                return;
            }
            yield husbandBotClient.replyMessage(event.replyToken, {
                type: 'text',
                text: `現在の設定:\n・メッセージ頻度: ${settings.sending_frequency}\n・送信時間: ${settings.sending_time}`,
            });
        }
        catch (error) {
            console.error('Error fetching settings:', error);
            yield husbandBotClient.replyMessage(event.replyToken, {
                type: 'text',
                text: '設定の取得中にエラーが発生しました。しばらくしてからもう一度お試しください。',
            });
        }
        return;
    }
    // ヘルプコマンド
    if (text.startsWith('/help')) {
        yield husbandBotClient.replyMessage(event.replyToken, {
            type: 'text',
            text: '使用可能なコマンド:\n/frequency [数値] - メッセージの頻度を設定\n/time [時間] - メッセージの送信時間を設定（例: 18:00）\n/settings - 現在の設定を確認\n/help - このヘルプを表示',
        });
        return;
    }
    // コマンドが認識できない場合
    yield husbandBotClient.replyMessage(event.replyToken, {
        type: 'text',
        text: '無効なコマンドです。以下のコマンドを使用してください：\n/frequency [数値] - メッセージの頻度を設定\n/time [時間] - メッセージの送信時間を設定\n/settings - 現在の設定を確認\n/help - ヘルプを表示',
    });
});
