"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bot_sdk_1 = require("@line/bot-sdk");
const config_1 = require("../config");
const line_1 = require("../services/line");
const router = express_1.default.Router();
// 奥様用LINE Botのwebhookルート
router.post('/webhook/wife', (0, bot_sdk_1.middleware)(config_1.lineBotConfigWife), (req, res) => {
    Promise.all(req.body.events.map(line_1.handleWifeMessage))
        .then(() => res.status(200).end())
        .catch((err) => {
        console.error('Error in wife webhook:', err);
        res.status(500).end();
    });
});
// 旦那様用LINE Botのwebhookルート
router.post('/webhook/husband', (0, bot_sdk_1.middleware)(config_1.lineBotConfigHusband), (req, res) => {
    Promise.all(req.body.events.map(line_1.handleHusbandMessage))
        .then(() => res.status(200).end())
        .catch((err) => {
        console.error('Error in husband webhook:', err);
        res.status(500).end();
    });
});
exports.default = router;
