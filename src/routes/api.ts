import express from 'express';
import { saveUserSettings, getUserSettings, saveUserRelationship, getHusbandIdForWife, getWifeIdForHusband } from '../services/supabase';
import { processAndSendMessages } from '../services/scheduler';
import * as lineService from '../services/line';
import { TextMessageEvent } from '../models/types/line';

const router = express.Router();

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
    const messageEvent: TextMessageEvent = {
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
  } catch (error) {
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
    saveUserSettings({
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
  } catch (error) {
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
    getUserSettings(userId)
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
  } catch (error) {
    console.error('Error in get settings API:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// 手動メッセージ送信API（テスト用）
router.post('/send-messages', (req, res) => {
  try {
    // メッセージ送信処理を実行
    processAndSendMessages()
      .then(() => {
        res.json({ status: 'success', message: 'Messages processed and sent' });
      })
      .catch((error) => {
        console.error('Error in send-messages API:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
      });
  } catch (error) {
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
    saveUserRelationship({
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
  } catch (error) {
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
    getHusbandIdForWife(wifeUserId)
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
  } catch (error) {
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
    getWifeIdForHusband(husbandUserId)
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
  } catch (error) {
    console.error('Error in get wife API:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

export default router; 