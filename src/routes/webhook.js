const usersQueries = require('../db/queries/users');
const gamesQueries = require('../db/queries/games');
const messagesQueries = require('../db/queries/messages');
const whatsapp = require('../services/whatsapp');
const { shouldProcessMessage, shouldIgnoreMessage } = require('../services/game/stateMachine');
const { addConsolidationJob, cancelJob } = require('../jobs/queue');
const { getTriggerPrompt } = require('../services/ai/prompts');
const {
  GAME_STATE,
  MESSAGE_TYPE,
  MESSAGE_DIRECTION,
  USER_STATUS,
} = require('../config/constants');

async function webhookRoutes(fastify, options) {
  // Webhook para recibir mensajes de WhatsApp
  fastify.post('/webhook/whatsapp', async (request, reply) => {
    try {
      // 1. Parsear mensaje entrante
      const incomingMessage = whatsapp.parseIncomingMessage(request.body);

      if (!incomingMessage || !incomingMessage.text) {
        return reply.code(200).send({ status: 'ignored', reason: 'no text message' });
      }

      const phone = `+${incomingMessage.from}`;

      // 2. Buscar usuario por teléfono
      let user = await usersQueries.getUserByPhone(phone);

      if (!user) {
        return reply.code(200).send({ status: 'ignored', reason: 'user not found' });
      }

      // 3. Si está pending_activation, activarlo y enviar trigger
      if (user.status === USER_STATUS.PENDING_ACTIVATION) {
        user = await usersQueries.updateUserStatus(user.id, USER_STATUS.ACTIVE);

        // Enviar mensaje trigger
        const triggerMessage = getTriggerPrompt();
        const waResult = await whatsapp.sendMessage(phone, triggerMessage);

        // Guardar mensaje trigger
        const game = await gamesQueries.getGameByUserId(user.id);
        await messagesQueries.createMessage({
          gameId: game.id,
          cycle: 0,
          direction: MESSAGE_DIRECTION.OUTBOUND,
          messageType: MESSAGE_TYPE.TRIGGER,
          content: triggerMessage,
          waMessageId: waResult.messageId,
        });

        return reply.code(200).send({ status: 'activated', user: user.id });
      }

      // 4. Si no está activo, ignorar
      if (user.status !== USER_STATUS.ACTIVE) {
        return reply.code(200).send({ status: 'ignored', reason: 'user not active' });
      }

      // 5. Obtener game del usuario
      const game = await gamesQueries.getGameByUserId(user.id);

      if (!game) {
        return reply.code(200).send({ status: 'ignored', reason: 'game not found' });
      }

      // 6. Verificar si debemos ignorar el mensaje (estado WAITING_RESULTS)
      if (shouldIgnoreMessage(game.state)) {
        console.log(`Ignoring message from ${phone} - game in state ${game.state}`);
        return reply.code(200).send({ status: 'ignored', reason: 'waiting_results' });
      }

      // 7. Procesar según estado del juego
      if (!shouldProcessMessage(game.state)) {
        return reply.code(200).send({ status: 'ignored', reason: 'invalid_state' });
      }

      // 8. Guardar mensaje del jugador
      await messagesQueries.createMessage({
        gameId: game.id,
        cycle: game.current_cycle + 1,
        direction: MESSAGE_DIRECTION.INBOUND,
        messageType: MESSAGE_TYPE.PLAYER_INPUT,
        content: incomingMessage.text,
        waMessageId: incomingMessage.messageId,
      });

      // 9. Actualizar actividad del usuario
      await usersQueries.updateUserActivity(user.id);

      // 10. Gestionar timer de consolidación
      if (game.state === GAME_STATE.WAITING_PLAYER) {
        // Primera mensaje → crear job y cambiar a CONSOLIDATING
        const jobId = await addConsolidationJob(game.id, game.current_cycle + 1);
        await gamesQueries.updateGameConsolidation(game.id, jobId);
        await gamesQueries.updateGameState(game.id, GAME_STATE.CONSOLIDATING);
      } else if (game.state === GAME_STATE.CONSOLIDATING) {
        // Mensaje adicional → cancelar job anterior y crear uno nuevo
        if (game.consolidation_job_id) {
          await cancelJob(game.consolidation_job_id);
        }
        const jobId = await addConsolidationJob(game.id, game.current_cycle + 1);
        await gamesQueries.updateGameConsolidation(game.id, jobId);
      }

      return reply.code(200).send({ status: 'processed' });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return reply.code(500).send({ error: 'internal_error' });
    }
  });

  // Verificación del webhook (para Meta)
  fastify.get('/webhook/whatsapp', async (request, reply) => {
    const verification = whatsapp.verifyWebhook(request);

    if (verification.verified) {
      return reply.code(200).send(verification.challenge || 'OK');
    }

    return reply.code(403).send('Forbidden');
  });
}

module.exports = webhookRoutes;
