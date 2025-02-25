import express from 'express';
import { middleware } from '@line/bot-sdk';
import { lineBotConfigWife, lineBotConfigHusband } from '../config';
import { handleWifeMessage, handleHusbandMessage } from '../services/line';

const router = express.Router();

// 奥様用LINE Botのwebhookルート
router.post('/webhook/wife', middleware(lineBotConfigWife), (req, res) => {
  Promise.all(req.body.events.map(handleWifeMessage))
    .then(() => res.status(200).end())
    .catch((err) => {
      console.error('Error in wife webhook:', err);
      res.status(500).end();
    });
});

// 旦那様用LINE Botのwebhookルート
router.post('/webhook/husband', middleware(lineBotConfigHusband), (req, res) => {
  Promise.all(req.body.events.map(handleHusbandMessage))
    .then(() => res.status(200).end())
    .catch((err) => {
      console.error('Error in husband webhook:', err);
      res.status(500).end();
    });
});

export default router; 