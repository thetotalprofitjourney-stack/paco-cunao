const fastify = require('fastify')({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
            },
          }
        : undefined,
  },
});

const env = require('./config/env');

// Plugins
fastify.register(require('@fastify/cors'), {
  origin: true, // En producción, especifica el dominio de tu web
});
fastify.register(require('@fastify/formbody'));

// Rutas
fastify.register(require('./routes/webhook'));
fastify.register(require('./routes/register'));
fastify.register(require('./routes/health'));

// Inicializar workers de BullMQ
require('./jobs/workers');

// Manejo de errores
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({ error: 'Internal Server Error' });
});

// Iniciar servidor
const start = async () => {
  try {
    await fastify.listen({ port: env.port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on port ${env.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
const shutdown = async (signal) => {
  fastify.log.info(`Received ${signal}, closing server...`);
  await fastify.close();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
