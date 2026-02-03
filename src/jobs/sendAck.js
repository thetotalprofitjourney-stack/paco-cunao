const gamesQueries = require('../db/queries/games');
const usersQueries = require('../db/queries/users');
const messagesQueries = require('../db/queries/messages');
const { callAI } = require('../services/ai/client');
const { getSystemPrompt, getAckPrompt } = require('../services/ai/prompts');
const { buildContext } = require('../services/ai/context');
const whatsapp = require('../services/whatsapp');
const { isNightTime, getDelayUntilNextAllowedTime } = require('../services/scheduler/nightTime');
const { addResultsJob } = require('./queue');
const { GAME_STATE, MESSAGE_TYPE, MESSAGE_DIRECTION } = require('../config/constants');
const env = require('../config/env');

const processSendAck = async (job) => {
  const { gameId, cycle } = job.data;

  try {
    // 1. Verificar que el estado sigue siendo 'consolidating'
    const game = await gamesQueries.getGameById(gameId);
    if (game.state !== GAME_STATE.CONSOLIDATING) {
      console.log(`Game ${gameId} is not in consolidating state, aborting`);
      return;
    }

    // 2. Comprobar horario nocturno
    if (isNightTime()) {
      const delay = getDelayUntilNextAllowedTime();
      console.log(`Night time detected, rescheduling ACK for game ${gameId} with delay ${delay}ms`);
      await addResultsJob(gameId, cycle, delay);
      return;
    }

    // 3. Cambiar estado a SENDING_ACK
    await gamesQueries.updateGameState(gameId, GAME_STATE.SENDING_ACK);

    // 4. Obtener todos los mensajes del jugador en este ciclo
    const playerMessages = await messagesQueries.getPlayerMessagesByCycle(gameId, cycle);
    const concatenatedMessages = playerMessages.map((m) => m.content).join('\n\n');

    // 5. Construir contexto y llamar a IA
    const context = await buildContext(gameId, playerMessages);
    const systemPrompt = getSystemPrompt(context);
    const userPrompt = getAckPrompt(concatenatedMessages);

    const aiResponse = await callAI(systemPrompt, userPrompt, {
      max_tokens: 150,
      temperature: 0.8,
    });

    // 6. Enviar mensaje por WhatsApp
    const user = await usersQueries.getUserById(game.user_id);
    const waResult = await whatsapp.sendMessage(user.phone, aiResponse.message);

    if (!waResult.success) {
      throw new Error(`Failed to send WhatsApp message: ${waResult.error}`);
    }

    // 7. Guardar mensaje en BD
    await messagesQueries.createMessage({
      gameId,
      cycle,
      direction: MESSAGE_DIRECTION.OUTBOUND,
      messageType: MESSAGE_TYPE.ACK,
      content: aiResponse.message,
      waMessageId: waResult.messageId,
      tokensInput: aiResponse.tokensInput,
      tokensOutput: aiResponse.tokensOutput,
    });

    // 8. Calcular días de espera (entre 3 y 7 días)
    const daysToWait = Math.floor(Math.random() * 5) + 3; // 3-7 días
    const delayMs = daysToWait * 24 * 60 * 60 * 1000;

    // 9. Programar job send_results
    const resultsJobId = await addResultsJob(gameId, cycle, delayMs);

    // 10. Actualizar estado a WAITING_RESULTS
    await gamesQueries.updateGameState(gameId, GAME_STATE.WAITING_RESULTS);

    console.log(`ACK sent for game ${gameId}, cycle ${cycle}. Results scheduled in ${daysToWait} days`);
  } catch (error) {
    console.error(`Error processing send_ack for game ${gameId}:`, error);
    throw error;
  }
};

module.exports = {
  processSendAck,
};
