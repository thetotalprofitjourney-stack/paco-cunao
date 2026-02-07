const usersQueries = require('../db/queries/users');
const gamesQueries = require('../db/queries/games');
const messagesQueries = require('../db/queries/messages');
const whatsapp = require('../services/whatsapp');
const {
  shouldProcessMessage,
  shouldIgnoreMessage,
  isWaitingForReactivation,
} = require('../services/game/stateMachine');
const { addConsolidationJob, addResultsJob, cancelJob } = require('../jobs/queue');
const { getTriggerPrompt } = require('../services/ai/prompts');
const {
  GAME_STATE,
  MESSAGE_TYPE,
  MESSAGE_DIRECTION,
  USER_STATUS,
} = require('../config/constants');

// Mensaje automático cuando el jugador envía audio/imagen/etc
const NON_TEXT_RESPONSE = `¡Uy! Perdona, me ha llegado algo pero no lo puedo abrir 😅

Este móvil que tengo es más viejo que el hotel, y con los audios y las fotos va fatal. A veces los abre, a veces no, y cuando los abre se queda pillado media hora.

¿Te importa escribírmelo? Así seguro que me llega bien. ¡Gracias!`;

async function webhookRoutes(fastify, options) {
  // Webhook para recibir mensajes de WhatsApp
  fastify.post('/webhook/whatsapp', async (request, reply) => {
    try {
      // 1. Parsear mensaje entrante
      const incomingMessage = whatsapp.parseIncomingMessage(request.body);

      if (!incomingMessage) {
        return reply.code(200).send({ status: 'ignored', reason: 'no message' });
      }

      const phone = `+${incomingMessage.from}`;

      // 2. Si es audio, imagen, video, etc. → responder que el móvil va fatal
      if (incomingMessage.isNonText) {
        // Solo respondemos si el usuario existe (evita spam a números desconocidos)
        const user = await usersQueries.getUserByPhone(phone);
        if (user && user.status !== USER_STATUS.PENDING_ACTIVATION) {
          await whatsapp.sendMessage(phone, NON_TEXT_RESPONSE);
          console.log(`Non-text message (${incomingMessage.type}) from ${phone} - sent fallback response`);
        }
        return reply.code(200).send({ status: 'non_text_handled', type: incomingMessage.type });
      }

      // 3. Si no hay texto, ignorar
      if (!incomingMessage.text) {
        return reply.code(200).send({ status: 'ignored', reason: 'empty text' });
      }

      // 4. Buscar usuario por teléfono
      let user = await usersQueries.getUserByPhone(phone);

      if (!user) {
        // Enviar mensaje automático para usuarios no registrados
        const notRegisteredMessage = `Hola, lo siento pero no tengo tu contacto guardado!

Si es para lo del hotel, sólo me fío de los contactos que me llegan por Antonio y Raquel, de La Comunidad TPM.

Pídeles que te recomienden en este enlace, te llevará unos segundos:
https://totalprofitjourney.com/help_paco`;

        await whatsapp.sendMessage(phone, notRegisteredMessage);
        return reply.code(200).send({ status: 'not_registered' });
      }

      // 5. Si está pending_activation, activarlo y enviar trigger
      if (user.status === USER_STATUS.PENDING_ACTIVATION) {
        user = await usersQueries.updateUserStatus(user.id, USER_STATUS.ACTIVE);

        // Enviar mensaje trigger personalizado con el nombre del usuario
        const triggerMessage = getTriggerPrompt(user.name);
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

      // 6. Si no está activo, ignorar
      if (user.status !== USER_STATUS.ACTIVE) {
        return reply.code(200).send({ status: 'ignored', reason: 'user not active' });
      }

      // 7. Obtener game del usuario
      const game = await gamesQueries.getGameByUserId(user.id);

      if (!game) {
        return reply.code(200).send({ status: 'ignored', reason: 'game not found' });
      }

      // 8. Verificar si debemos ignorar el mensaje (estado WAITING_RESULTS)
      if (shouldIgnoreMessage(game.state)) {
        console.log(`Ignoring message from ${phone} - game in state ${game.state}`);
        return reply.code(200).send({ status: 'ignored', reason: 'waiting_results' });
      }

      // 9. Procesar según estado del juego
      if (!shouldProcessMessage(game.state)) {
        return reply.code(200).send({ status: 'ignored', reason: 'invalid_state' });
      }

      // 10. Guardar mensaje del jugador
      await messagesQueries.createMessage({
        gameId: game.id,
        cycle: game.current_cycle + 1,
        direction: MESSAGE_DIRECTION.INBOUND,
        messageType: MESSAGE_TYPE.PLAYER_INPUT,
        content: incomingMessage.text,
        waMessageId: incomingMessage.messageId,
      });

      // 11. Actualizar actividad del usuario
      await usersQueries.updateUserActivity(user.id);

      // 12. Gestionar según estado del juego
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
      } else if (isWaitingForReactivation(game.state)) {
        // Jugador respondió a la plantilla de reactivación → disparar resultados
        // Obtener los días transcurridos del mensaje de reactivación
        const reactivationMessage = await messagesQueries.getLastMessageByType(
          game.id,
          MESSAGE_TYPE.REACTIVATION
        );

        let daysElapsed = 5; // valor por defecto
        if (reactivationMessage?.metadata) {
          try {
            const metadata = JSON.parse(reactivationMessage.metadata);
            daysElapsed = metadata.daysElapsed || 5;
          } catch (e) {
            console.error('Error parsing reactivation metadata:', e);
          }
        }

        // Disparar job de resultados inmediatamente
        await addResultsJob(game.id, game.current_cycle + 1, daysElapsed);
        console.log(`Player responded to reactivation - sending results for game ${game.id}`);
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
