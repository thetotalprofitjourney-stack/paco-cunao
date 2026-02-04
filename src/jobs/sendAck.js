const gamesQueries = require('../db/queries/games');
const usersQueries = require('../db/queries/users');
const messagesQueries = require('../db/queries/messages');
const { callAI } = require('../services/ai/client');
const { getSystemPrompt, getAckPrompt } = require('../services/ai/prompts');
const { buildContext } = require('../services/ai/context');
const whatsapp = require('../services/whatsapp');
const { isNightTime, getDelayUntilNextAllowedTime } = require('../services/scheduler/nightTime');
const { addReactivationJob } = require('./queue');
const { GAME_STATE, MESSAGE_TYPE, MESSAGE_DIRECTION } = require('../config/constants');

const parseAckResponse = (response) => {
  const result = {
    message: '',
    days: 5, // valor por defecto
  };

  try {
    // Extraer mensaje
    const messageMatch = response.match(/---MENSAJE---([\s\S]*?)---DIAS---/);
    if (messageMatch) {
      result.message = messageMatch[1].trim();
    } else {
      // Si no encuentra el formato, usar toda la respuesta como mensaje
      result.message = response.trim();
    }

    // Extraer días
    const daysMatch = response.match(/---DIAS---\s*(\d+)/);
    if (daysMatch) {
      const days = parseInt(daysMatch[1], 10);
      // Validar que esté en el rango 3-14
      result.days = Math.max(3, Math.min(14, days));
    }
  } catch (error) {
    console.error('Error parsing ACK response:', error);
  }

  return result;
};

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
      // Reprogramar el mismo job de ACK
      await addReactivationJob(gameId, cycle, delay, 5);
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
      max_tokens: 250,
      temperature: 0.8,
    });

    // 6. Parsear respuesta para obtener mensaje y días
    const parsed = parseAckResponse(aiResponse.message);

    // 7. Enviar mensaje por WhatsApp
    const user = await usersQueries.getUserById(game.user_id);
    const waResult = await whatsapp.sendMessage(user.phone, parsed.message);

    if (!waResult.success) {
      throw new Error(`Failed to send WhatsApp message: ${waResult.error}`);
    }

    // 8. Guardar mensaje en BD
    await messagesQueries.createMessage({
      gameId,
      cycle,
      direction: MESSAGE_DIRECTION.OUTBOUND,
      messageType: MESSAGE_TYPE.ACK,
      content: parsed.message,
      waMessageId: waResult.messageId,
      tokensInput: aiResponse.tokensInput,
      tokensOutput: aiResponse.tokensOutput,
    });

    // 9. Calcular delay basado en los días determinados por la IA
    const daysToWait = parsed.days;
    const delayMs = daysToWait * 24 * 60 * 60 * 1000;

    // 10. Programar job send_reactivation (plantilla)
    // Los días se pasan en el job para usarlos después en los resultados
    const reactivationJobId = await addReactivationJob(gameId, cycle, delayMs, daysToWait);

    // 11. Actualizar estado a WAITING_RESULTS
    await gamesQueries.updateGameState(gameId, GAME_STATE.WAITING_RESULTS);

    console.log(`ACK sent for game ${gameId}, cycle ${cycle}. Reactivation scheduled in ${daysToWait} days (job: ${reactivationJobId})`);
  } catch (error) {
    console.error(`Error processing send_ack for game ${gameId}:`, error);
    throw error;
  }
};

module.exports = {
  processSendAck,
};
