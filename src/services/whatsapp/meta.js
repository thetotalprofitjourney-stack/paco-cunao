const crypto = require('crypto');
const env = require('../../config/env');

/**
 * Genera el appsecret_proof para mayor seguridad en las llamadas a la API
 * @returns {string} Hash HMAC-SHA256 del token de acceso
 */
const generateAppSecretProof = () => {
  if (!env.whatsappAppSecret) {
    return null;
  }
  return crypto
    .createHmac('sha256', env.whatsappAppSecret)
    .update(env.whatsappMetaToken)
    .digest('hex');
};

const getApiUrl = () => {
  const baseUrl = `https://graph.facebook.com/v18.0/${env.whatsappPhoneNumberId}/messages`;
  const proof = generateAppSecretProof();

  // Si hay App Secret configurado, incluir appsecret_proof
  if (proof) {
    return `${baseUrl}?appsecret_proof=${proof}`;
  }

  return baseUrl;
};

const sendTemplate = async (phone, templateName, languageCode = 'es', components = []) => {
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
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: components.length > 0 ? components : undefined,
        },
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
  sendTemplate,
  parseIncomingMessage,
  verifyWebhook,
};
