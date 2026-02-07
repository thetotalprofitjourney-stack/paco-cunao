const env = require('../../config/env');

const API_URL = 'https://waba.360dialog.io/v1/messages';

const sendMessage = async (phone, text) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'D360-API-KEY': env.whatsapp360ApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone.replace('+', ''), // 360dialog no quiere el +
        type: 'text',
        text: { body: text },
      }),
    });

    const data = await response.json();

    return {
      success: response.ok,
      messageId: data.messages?.[0]?.id,
      error: data.error?.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

const parseIncomingMessage = (webhookBody) => {
  try {
    const entry = webhookBody.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) return null;

    // Tipos de mensaje que no son texto
    const NON_TEXT_TYPES = ['audio', 'image', 'video', 'document', 'sticker', 'location', 'contacts'];
    const isNonText = NON_TEXT_TYPES.includes(message.type);

    return {
      from: message.from,
      text: message.text?.body || '',
      timestamp: new Date(parseInt(message.timestamp) * 1000),
      messageId: message.id,
      type: message.type,
      isNonText,
    };
  } catch (error) {
    console.error('Error parsing incoming message:', error);
    return null;
  }
};

const verifyWebhook = (req) => {
  // 360dialog usa un token en el header
  return req.headers['d360-api-key'] === env.whatsapp360WebhookToken;
};

module.exports = {
  sendMessage,
  parseIncomingMessage,
  verifyWebhook,
};
