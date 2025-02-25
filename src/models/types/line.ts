import { MessageEvent, TextEventMessage, EventSource } from '@line/bot-sdk';

// テスト用のダミーWebhookEventの型定義
export type DummyWebhookEvent = {
  type: 'message';
  message: {
    type: 'text';
    text: string;
    id: string;
    quoteToken?: string;
  };
  source: {
    type: 'user';
    userId: string;
  };
  replyToken: string;
  mode: 'active';
  timestamp: number;
  webhookEventId: string;
  deliveryContext: {
    isRedelivery: boolean;
  };
};

// LINE SDKのMessageEventと互換性のある型定義
export type TextMessageEvent = MessageEvent & {
  message: TextEventMessage;
}; 