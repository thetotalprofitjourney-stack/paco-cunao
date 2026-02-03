// Este archivo exporta las funciones, internamente usa el proveedor configurado
const env = require('../../config/env');

const provider = require(`./${env.whatsappProvider}`);

module.exports = {
  sendMessage: provider.sendMessage,
  verifyWebhook: provider.verifyWebhook,
  parseIncomingMessage: provider.parseIncomingMessage,
};
