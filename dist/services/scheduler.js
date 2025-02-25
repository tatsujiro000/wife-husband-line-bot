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
exports.initScheduler = exports.processAndSendMessages = void 0;
const supabase_1 = require("./supabase");
const dify_1 = require("./dify");
const line_1 = require("./line");
// テスト環境かどうかを判定
const isDevelopment = process.env.NODE_ENV === 'development';
// 定期的なメッセージ送信処理
const processAndSendMessages = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 未処理の愚痴を取得（デフォルトで3件）
        const unprocessedGrumbles = yield (0, supabase_1.getUnprocessedGrumbles)();
        if (unprocessedGrumbles.length === 0) {
            console.log('No unprocessed grumbles found.');
            return;
        }
        // 愚痴をユーザーIDごとにグループ化
        const grumblesByWifeId = groupGrumblesByUserId(unprocessedGrumbles);
        // 各奥様の愚痴を処理
        for (const [wifeUserId, grumbles] of Object.entries(grumblesByWifeId)) {
            yield processGrumblesForWife(wifeUserId, grumbles);
        }
        console.log(`Successfully processed grumbles for ${Object.keys(grumblesByWifeId).length} users.`);
    }
    catch (error) {
        console.error('Error in processAndSendMessages:', error);
    }
});
exports.processAndSendMessages = processAndSendMessages;
// 愚痴をユーザーIDごとにグループ化する関数
const groupGrumblesByUserId = (grumbles) => {
    return grumbles.reduce((groups, grumble) => {
        const userId = grumble.user_id;
        if (!groups[userId]) {
            groups[userId] = [];
        }
        groups[userId].push(grumble);
        return groups;
    }, {});
};
// 特定の奥様の愚痴を処理する関数
const processGrumblesForWife = (wifeUserId, grumbles) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 愚痴の送信先（旦那様）のユーザーIDを取得
        const husbandUserId = yield (0, supabase_1.getHusbandIdForWife)(wifeUserId);
        if (!husbandUserId) {
            console.error('No husband user ID found for wife:', wifeUserId);
            return;
        }
        // 旦那様の設定を取得
        const settings = yield (0, supabase_1.getUserSettings)(husbandUserId);
        // 設定に基づいて送信するかどうかを判断
        if (settings && !shouldSendMessage(settings)) {
            console.log(`Skipping message sending for husband ${husbandUserId} based on user settings.`);
            return;
        }
        // 旦那様へのメッセージを生成
        const message = yield (0, dify_1.generateMessageForHusband)(grumbles);
        // 旦那様にメッセージを送信
        yield (0, line_1.sendMessageToHusband)(husbandUserId, message);
        // 処理した愚痴を処理済みとしてマーク
        for (const grumble of grumbles) {
            if (grumble.id) {
                yield (0, supabase_1.markGrumbleAsProcessed)(grumble.id);
            }
        }
        console.log(`Successfully processed and sent ${grumbles.length} grumbles from wife ${wifeUserId} to husband ${husbandUserId}.`);
    }
    catch (error) {
        console.error(`Error processing grumbles for wife ${wifeUserId}:`, error);
    }
});
// ユーザー設定に基づいて送信するかどうかを判断
const shouldSendMessage = (settings) => {
    // 頻度チェック
    // 注: 実際の実装では、最後のメッセージ送信時刻と頻度に基づいて判断する必要があります
    // 時間帯チェック
    if (settings.sending_time) {
        const [hours, minutes] = settings.sending_time.split(':').map(Number);
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        // 設定された時間の前後30分以内であれば送信
        const settingTimeInMinutes = hours * 60 + minutes;
        const currentTimeInMinutes = currentHours * 60 + currentMinutes;
        const timeDifference = Math.abs(settingTimeInMinutes - currentTimeInMinutes);
        if (timeDifference > 30) {
            return false;
        }
    }
    return true;
};
// スケジューラーの初期化
const initScheduler = () => {
    console.log('Initializing scheduler...');
    // 10分ごとに実行
    const intervalMinutes = 10;
    const interval = intervalMinutes * 60 * 1000;
    // 開発環境では即時実行も行う
    if (isDevelopment) {
        console.log('Development mode: Running initial message processing...');
        setTimeout(() => {
            (0, exports.processAndSendMessages)().catch(err => {
                console.error('Error in initial message processing:', err);
            });
        }, 5000); // 5秒後に実行
    }
    return setInterval(exports.processAndSendMessages, interval);
};
exports.initScheduler = initScheduler;
