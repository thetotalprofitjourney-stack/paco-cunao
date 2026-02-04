const gamesQueries = require('../db/queries/games');
const usersQueries = require('../db/queries/users');
const messagesQueries = require('../db/queries/messages');
const whatsapp = require('../services/whatsapp');
const { isNightTime, getDelayUntilNextAllowedTime } = require('../services/scheduler/nightTime');
const { addReactivationJob } = require('./queue');
const { GAME_STATE, MESSAGE_TYPE, MESSAGE_DIRECTION } = require('../config/constants');
const env = require('../config/env');

const processSendReactivation = async (job) => {
  const { gameId, cycle, daysElapsed } = job.data;

  try {
    // 1. Verificar que el estado sigue siendo 'waiting_results'
    const game = await gamesQueries.getGameById(gameId);
    if (game.state !== GAME_STATE.WAITING_RESULTS) {
      console.log(`Game ${gameId} is not in waiting_results state, aborting reactivation`);
      return;
    }

    // 2. Comprobar horario nocturno
    if (isNightTime()) {
      const delay = getDelayUntilNextAllowedTime();
      console.log(`Night time detected, rescheduling reactivation for game ${gameId} with delay ${delay}ms`);
      await addReactivationJob(gameId, cycle, delay, daysElapsed);
      return;
    }

    // 3. Cambiar estado a SENDING_REACTIVATION
    await gamesQueries.updateGameState(gameId, GAME_STATE.SENDING_REACTIVATION);

    // 4. Obtener usuario
    const user = await usersQueries.getUserById(game.user_id);

    // 5. Enviar plantilla de reactivación por WhatsApp
    // La plantilla debe estar previamente aprobada en Meta Business
    // Nombre sugerido: "paco_novedades" con variable {{1}} para el nombre
    const templateComponents = user.name
      ? [
          {
            type: 'body',
            parameters: [{ type: 'text', text: user.name }],
          },
        ]
      : [];

    const waResult = await whatsapp.sendTemplate(
      user.phone,
      env.whatsappReactivationTemplate || 'paco_novedades',
      'es',
      templateComponents
    );

    if (!waResult.success) {
      throw new Error(`Failed to send WhatsApp template: ${waResult.error}`);
    }

    // 6. Guardar mensaje en BD (guardamos el nombre de la plantilla)
    const templateMessage = `[PLANTILLA: ${env.whatsappReactivationTemplate || 'paco_novedades'}]`;
    await messagesQueries.createMessage({
      gameId,
      cycle,
      direction: MESSAGE_DIRECTION.OUTBOUND,
      messageType: MESSAGE_TYPE.REACTIVATION,
      content: templateMessage,
      waMessageId: waResult.messageId,
      metadata: JSON.stringify({ daysElapsed }),
    });

    // 7. Actualizar estado a WAITING_REACTIVATION
    // Ahora esperamos a que el jugador responda para enviar los resultados
    await gamesQueries.updateGameState(gameId, GAME_STATE.WAITING_REACTIVATION);

    console.log(`Reactivation template sent for game ${gameId}, cycle ${cycle}. Waiting for player response.`);
  } catch (error) {
    console.error(`Error processing send_reactivation for game ${gameId}:`, error);
    throw error;
  }
};

module.exports = {
  processSendReactivation,
};
