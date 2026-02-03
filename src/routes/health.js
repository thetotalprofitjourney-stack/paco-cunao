const db = require('../db/client');
const { createClient } = require('redis');
const env = require('../config/env');

async function healthRoutes(fastify, options) {
  fastify.get('/health', async (request, reply) => {
    const health = {
      status: 'ok',
      db: 'unknown',
      redis: 'unknown',
      whatsapp: 'configured',
    };

    // Check PostgreSQL
    try {
      await db.query('SELECT 1');
      health.db = 'connected';
    } catch (error) {
      health.db = 'disconnected';
      health.status = 'degraded';
    }

    // Check Redis
    try {
      const redis = createClient({ url: env.redisUrl });
      await redis.connect();
      await redis.ping();
      await redis.quit();
      health.redis = 'connected';
    } catch (error) {
      health.redis = 'disconnected';
      health.status = 'degraded';
    }

    // WhatsApp check (just verify config exists)
    if (!env.whatsapp360ApiKey && !env.whatsappMetaToken) {
      health.whatsapp = 'not_configured';
      health.status = 'degraded';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    return reply.code(statusCode).send(health);
  });
}

module.exports = healthRoutes;
