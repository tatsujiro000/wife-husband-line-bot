"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../services/supabase");
const scheduler_1 = require("../services/scheduler");
const lineService = __importStar(require("../services/line"));
const router = express_1.default.Router();
// 愚痴投稿API（テスト用）
router.post('/grumble', (req, res) => {
    try {
        const { user_id, text } = req.body;
        if (!user_id || !text) {
            return res.status(400).json({ status: 'error', message: 'user_id and text are required' });
        }
        // 実際の実装では、LINE Botを通じて愚痴を受け取るため、このAPIは主にテスト用
        // ここでは、LINE Botのwebhookを直接呼び出す形で実装
        // テスト用のイベントを作成
        const messageEvent = {
            type: 'message',
            message: {
                type: 'text',
                text,
                id: `dummy-message-${Date.now()}`,
                quoteToken: `dummy-quote-${Date.now()}`
            },
            source: {
                type: 'user',
                userId: user_id
            },
            replyToken: 'dummy-reply-token',
            mode: 'active',
            timestamp: Date.now(),
            webhookEventId: `dummy-event-${Date.now()}`,
            deliveryContext: {
                isRedelivery: false
            }
        };
        // LINE Botのwebhookハンドラを直接呼び出す
        lineService.handleWifeMessage(messageEvent)
            .then(() => {
            res.json({ status: 'success' });
        })
            .catch((error) => {
            console.error('Error in grumble API:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        });
    }
    catch (error) {
        console.error('Error in grumble API:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});
// 設定更新API
router.post('/settings', (req, res) => {
    try {
        const { user_id, frequency, time } = req.body;
        if (!user_id || !frequency || !time) {
            return res.status(400).json({ status: 'error', message: 'user_id, frequency, and time are required' });
        }
        // ユーザー設定を保存
        (0, supabase_1.saveUserSettings)({
            user_id,
            sending_frequency: parseInt(frequency, 10),
            sending_time: time,
        })
            .then(() => {
            res.json({ status: 'success' });
        })
            .catch((error) => {
            console.error('Error in settings API:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        });
    }
    catch (error) {
        console.error('Error in settings API:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});
// 設定取得API
router.get('/settings/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ status: 'error', message: 'userId is required' });
        }
        // ユーザー設定を取得
        (0, supabase_1.getUserSettings)(userId)
            .then((settings) => {
            if (!settings) {
                return res.status(404).json({ status: 'error', message: 'Settings not found' });
            }
            res.json({ status: 'success', data: settings });
        })
            .catch((error) => {
            console.error('Error in get settings API:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        });
    }
    catch (error) {
        console.error('Error in get settings API:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});
// 手動メッセージ送信API（テスト用）
router.post('/send-messages', (req, res) => {
    try {
        // メッセージ送信処理を実行
        (0, scheduler_1.processAndSendMessages)()
            .then(() => {
            res.json({ status: 'success', message: 'Messages processed and sent' });
        })
            .catch((error) => {
            console.error('Error in send-messages API:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        });
    }
    catch (error) {
        console.error('Error in send-messages API:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});
// ユーザー関係の登録API
router.post('/relationship', (req, res) => {
    try {
        const { wife_user_id, husband_user_id } = req.body;
        if (!wife_user_id || !husband_user_id) {
            return res.status(400).json({ status: 'error', message: 'wife_user_id and husband_user_id are required' });
        }
        // ユーザー関係を保存
        (0, supabase_1.saveUserRelationship)({
            wife_user_id,
            husband_user_id,
        })
            .then(() => {
            res.json({ status: 'success', message: 'User relationship registered successfully' });
        })
            .catch((error) => {
            console.error('Error in relationship API:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        });
    }
    catch (error) {
        console.error('Error in relationship API:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});
// 旦那様IDの取得API
router.get('/husband/:wifeUserId', (req, res) => {
    try {
        const { wifeUserId } = req.params;
        if (!wifeUserId) {
            return res.status(400).json({ status: 'error', message: 'wifeUserId is required' });
        }
        // 旦那様IDを取得
        (0, supabase_1.getHusbandIdForWife)(wifeUserId)
            .then((husbandId) => {
            if (!husbandId) {
                return res.status(404).json({ status: 'error', message: 'Husband not found for this wife' });
            }
            res.json({ status: 'success', data: { husband_user_id: husbandId } });
        })
            .catch((error) => {
            console.error('Error in get husband API:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        });
    }
    catch (error) {
        console.error('Error in get husband API:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});
// 奥様IDの取得API
router.get('/wife/:husbandUserId', (req, res) => {
    try {
        const { husbandUserId } = req.params;
        if (!husbandUserId) {
            return res.status(400).json({ status: 'error', message: 'husbandUserId is required' });
        }
        // 奥様IDを取得
        (0, supabase_1.getWifeIdForHusband)(husbandUserId)
            .then((wifeId) => {
            if (!wifeId) {
                return res.status(404).json({ status: 'error', message: 'Wife not found for this husband' });
            }
            res.json({ status: 'success', data: { wife_user_id: wifeId } });
        })
            .catch((error) => {
            console.error('Error in get wife API:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        });
    }
    catch (error) {
        console.error('Error in get wife API:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});
exports.default = router;
