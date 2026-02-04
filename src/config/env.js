require('dotenv').config();

module.exports = {
  // Base de datos
  databaseUrl: process.env.DATABASE_URL,

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // WhatsApp
  whatsappProvider: process.env.WHATSAPP_PROVIDER || '360dialog',
  whatsapp360ApiKey: process.env.WHATSAPP_360_API_KEY,
  whatsapp360WebhookToken: process.env.WHATSAPP_360_WEBHOOK_TOKEN,
  whatsappMetaToken: process.env.WHATSAPP_META_TOKEN,
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
  whatsappReactivationTemplate: process.env.WHATSAPP_REACTIVATION_TEMPLATE || 'paco_novedades',

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  // Servidor
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Tiempos (en milisegundos)
  consolidationWindowMs: parseInt(process.env.CONSOLIDATION_WINDOW_MS || '1800000'), // 30 minutos
  // Nota: Los días de espera (3-14) ahora los determina la IA según la complejidad del cambio

  // Horario nocturno (hora española)
  nightStartHour: parseInt(process.env.NIGHT_START_HOUR || '22'),
  nightEndHour: parseInt(process.env.NIGHT_END_HOUR || '7'),
  timezone: process.env.TIMEZONE || 'Europe/Madrid',

  // Memoria/Contexto
  recentCyclesToInclude: parseInt(process.env.RECENT_CYCLES_TO_INCLUDE || '2'),
  maxKeyEvents: parseInt(process.env.MAX_KEY_EVENTS || '50'),
};
