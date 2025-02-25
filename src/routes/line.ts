import express from 'express';
import { middleware } from '@line/bot-sdk';
import { lineBotConfigWife, lineBotConfigHusband } from '../config';
import { handleWifeMessage, handleHusbandMessage } from '../services/line';

const router = express.Router();

// デバッグ用のログ出力
console.log('LINE Bot Config Wife:', {
  channelSecret: lineBotConfigWife.channelSecret ? lineBotConfigWife.channelSecret.substring(0, 5) + '...' : 'undefined',
  channelAccessToken: lineBotConfigWife.channelAccessToken ? lineBotConfigWife.channelAccessToken.substring(0, 5) + '...' : 'undefined',
});

console.log('LINE Bot Config Husband:', {
  channelSecret: lineBotConfigHusband.channelSecret ? lineBotConfigHusband.channelSecret.substring(0, 5) + '...' : 'undefined',
  channelAccessToken: lineBotConfigHusband.channelAccessToken ? lineBotConfigHusband.channelAccessToken.substring(0, 5) + '...' : 'undefined',
});

// デバッグ用のエンドポイント
router.get('/debug', (req, res) => {
  res.json({
    wifeConfigExists: !!lineBotConfigWife.channelSecret && !!lineBotConfigWife.channelAccessToken,
    husbandConfigExists: !!lineBotConfigHusband.channelSecret && !!lineBotConfigHusband.channelAccessToken,
    environment: process.env.NODE_ENV
  });
});

// 奥様用LINE Botのwebhookルート
router.post('/webhook/wife', (req, res, next) => {
  console.log('Wife webhook headers:', req.headers);
  console.log('Wife webhook signature:', req.headers['x-line-signature']);
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