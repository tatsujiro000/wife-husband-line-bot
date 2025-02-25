import express from 'express';
import { middleware } from '@line/bot-sdk';
import { lineBotConfigWife, lineBotConfigHusband } from '../config';
import { handleWifeMessage, handleHusbandMessage } from '../services/line';

const router = express.Router();

// デバッグ用のログ出力
console.log('LINE Bot Config Wife:', {
  channelSecret: lineBotConfigWife.channelSecret ? `${lineBotConfigWife.channelSecret.substring(0, 5)}...(${lineBotConfigWife.channelSecret.length}文字)` : 'undefined',
  channelAccessToken: lineBotConfigWife.channelAccessToken ? `${lineBotConfigWife.channelAccessToken.substring(0, 5)}...(${lineBotConfigWife.channelAccessToken.length}文字)` : 'undefined',
});

console.log('LINE Bot Config Husband:', {
  channelSecret: lineBotConfigHusband.channelSecret ? `${lineBotConfigHusband.channelSecret.substring(0, 5)}...(${lineBotConfigHusband.channelSecret.length}文字)` : 'undefined',
  channelAccessToken: lineBotConfigHusband.channelAccessToken ? `${lineBotConfigHusband.channelAccessToken.substring(0, 5)}...(${lineBotConfigHusband.channelAccessToken.length}文字)` : 'undefined',
});

// 署名検証をスキップするミドルウェア（テスト用）
const skipSignatureValidation = (req, res, next) => {
  console.log('署名検証をスキップします');
  req.body = req.body || {};
  next();
};

// デバッグ用のエンドポイント
router.get('/debug', (req, res) => {
  res.json({
    wifeConfigExists: !!lineBotConfigWife.channelSecret && !!lineBotConfigWife.channelAccessToken,
    husbandConfigExists: !!lineBotConfigHusband.channelSecret && !!lineBotConfigHusband.channelAccessToken,
    environment: process.env.NODE_ENV,
    wifeSecretLength: lineBotConfigWife.channelSecret ? lineBotConfigWife.channelSecret.length : 0,
    husbandSecretLength: lineBotConfigHusband.channelSecret ? lineBotConfigHusband.channelSecret.length : 0,
  });
});

// テスト用のエンドポイント
router.post('/test-webhook', (req, res) => {
  console.log('Test webhook received:', req.body);
  res.status(200).json({ status: 'success', message: 'Test webhook received' });
});

// 署名検証をスキップするテスト用のエンドポイント
router.post('/test-webhook/wife', skipSignatureValidation, (req, res) => {
  console.log('Wife test webhook received:', req.body);
  try {
    if (req.body.events && Array.isArray(req.body.events)) {
      Promise.all(req.body.events.map(handleWifeMessage))
        .then(() => res.status(200).json({ status: 'success', message: 'Wife test webhook processed' }))
        .catch((err) => {
          console.error('Error in wife test webhook:', err);
          res.status(500).json({ status: 'error', message: err.message });
        });
    } else {
      res.status(200).json({ status: 'success', message: 'No events to process' });
    }
  } catch (err) {
    console.error('Error in wife test webhook:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

router.post('/test-webhook/husband', skipSignatureValidation, (req, res) => {
  console.log('Husband test webhook received:', req.body);
  try {
    if (req.body.events && Array.isArray(req.body.events)) {
      Promise.all(req.body.events.map(handleHusbandMessage))
        .then(() => res.status(200).json({ status: 'success', message: 'Husband test webhook processed' }))
        .catch((err) => {
          console.error('Error in husband test webhook:', err);
          res.status(500).json({ status: 'error', message: err.message });
        });
    } else {
      res.status(200).json({ status: 'success', message: 'No events to process' });
    }
  } catch (err) {
    console.error('Error in husband test webhook:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 奥様用LINE Botのwebhookルート
router.post('/webhook/wife', (req, res, next) => {
  console.log('Wife webhook headers:', req.headers);
  console.log('Wife webhook signature:', req.headers['x-line-signature']);
  
  // 署名検証のデバッグ
  if (req.headers['x-line-signature'] && lineBotConfigWife.channelSecret) {
    const crypto = require('crypto');
    const body = JSON.stringify(req.body);
    console.log('Wife webhook body for signature:', body);
    const signature = crypto
      .createHmac('SHA256', lineBotConfigWife.channelSecret)
      .update(body)
      .digest('base64');
    console.log('計算された署名:', signature);
    console.log('受信した署名:', req.headers['x-line-signature']);
    console.log('署名一致:', signature === req.headers['x-line-signature']);
  }
  
  next();
}, middleware(lineBotConfigWife), (req, res) => {
  Promise.all(req.body.events.map(handleWifeMessage))
    .then(() => res.status(200).end())
    .catch((err) => {
      console.error('Error in wife webhook:', err);
      res.status(500).end();
    });
});

// 旦那様用LINE Botのwebhookルート
router.post('/webhook/husband', (req, res, next) => {
  console.log('Husband webhook headers:', req.headers);
  console.log('Husband webhook signature:', req.headers['x-line-signature']);
  
  // 署名検証のデバッグ
  if (req.headers['x-line-signature'] && lineBotConfigHusband.channelSecret) {
    const crypto = require('crypto');
    const body = JSON.stringify(req.body);
    console.log('Husband webhook body for signature:', body);
    const signature = crypto
      .createHmac('SHA256', lineBotConfigHusband.channelSecret)
      .update(body)
      .digest('base64');
    console.log('計算された署名:', signature);
    console.log('受信した署名:', req.headers['x-line-signature']);
    console.log('署名一致:', signature === req.headers['x-line-signature']);
  }
  
  next();
}, middleware(lineBotConfigHusband), (req, res) => {
  Promise.all(req.body.events.map(handleHusbandMessage))
    .then(() => res.status(200).end())
    .catch((err) => {
      console.error('Error in husband webhook:', err);
      res.status(500).end();
    });
});

export default router; 