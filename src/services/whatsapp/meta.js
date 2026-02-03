const env = require('../../config/env');

const getApiUrl = () =>
  `https://graph.facebook.com/v18.0/${env.whatsappPhoneNumberId}/messages`;

const sendMessage = async (phone, text) => {
  try {
    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.whatsappMetaToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone.replace('+', ''),
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

const verifyWebhook = (req) => {
  // Meta usa verificación con hub.verify_token
  if (req.query['hub.mode'] === 'subscribe') {
    if (req.query['hub.verify_token'] === env.whatsappVerifyToken) {
      return { verified: true, challenge: req.query['hub.challenge'] };
    }
  }
  return { verified: false };
};

const parseIncomingMessage = (webhookBody) => {
  try {
    // El formato es casi idéntico a 360dialog (ambos siguen Cloud API)
    const entry = webhookBody.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) return null;

    return {
      from: message.from,
      text: message.text?.body || '',
      timestamp: new Date(parseInt(message.timestamp) * 1000),
      messageId: message.id,
      type: message.type,
    };
  } catch (error) {
    console.error('Error parsing incoming message:', error);
    return null;
  }
};

module.exports = {
  sendMessage,
  parseIncomingMessage,
  verifyWebhook,
};
