const gamesQueries = require('../db/queries/games');
const usersQueries = require('../db/queries/users');
const messagesQueries = require('../db/queries/messages');
const { callAI } = require('../services/ai/client');
const { getSystemPrompt, getResultsPrompt } = require('../services/ai/prompts');
const { buildContext } = require('../services/ai/context');
const { generateCycleSummary, updateHotelState } = require('../services/game/memory');
const whatsapp = require('../services/whatsapp');
const { isNightTime, getDelayUntilNextAllowedTime } = require('../services/scheduler/nightTime');
const { addResultsJob } = require('./queue');
const { GAME_STATE, MESSAGE_TYPE, MESSAGE_DIRECTION } = require('../config/constants');

const processSendResults = async (job) => {
  const { gameId, cycle, daysElapsed } = job.data;

  try {
    // 1. Comprobar horario nocturno
    if (isNightTime()) {
      const delay = getDelayUntilNextAllowedTime();
      console.log(`Night time detected, rescheduling RESULTS for game ${gameId} with delay ${delay}ms`);
      await addResultsJob(gameId, cycle, daysElapsed);
      return;
    }

    // 2. Cambiar estado a SENDING_RESULTS
    const game = await gamesQueries.getGameById(gameId);
    await gamesQueries.updateGameState(gameId, GAME_STATE.SENDING_RESULTS);

    // 3. Obtener mensajes del jugador en este ciclo
    const playerMessages = await messagesQueries.getPlayerMessagesByCycle(gameId, cycle);
    const concatenatedMessages = playerMessages.map((m) => m.content).join('\n\n');

    // 4. Construir contexto y llamar a IA
    const context = await buildContext(gameId, playerMessages);
    const systemPrompt = getSystemPrompt(context);

    // Usar los días reales determinados por la IA en el ACK
    const userPrompt = getResultsPrompt(daysElapsed, concatenatedMessages);

    // Aumentamos max_tokens para respuestas más ricas (1500-3000 chars)
    const aiResponse = await callAI(systemPrompt, userPrompt, {
      max_tokens: 800,
      temperature: 0.85,
    });

    // 5. Parsear respuesta (formato: ---MENSAJE--- ... ---HOTEL_UPDATE--- ... ---RESUMEN_CICLO---)
    const parsed = parseResultsResponse(aiResponse.message);

    // 6. Enviar mensaje por WhatsApp
    const user = await usersQueries.getUserById(game.user_id);
    const waResult = await whatsapp.sendMessage(user.phone, parsed.message);

    if (!waResult.success) {
      throw new Error(`Failed to send WhatsApp message: ${waResult.error}`);
    }

    // 7. Guardar mensaje en BD
    await messagesQueries.createMessage({
      gameId,
      cycle,
      direction: MESSAGE_DIRECTION.OUTBOUND,
      messageType: MESSAGE_TYPE.RESULTS,
      content: parsed.message,
      waMessageId: waResult.messageId,
      tokensInput: aiResponse.tokensInput,
      tokensOutput: aiResponse.tokensOutput,
    });

    // 8. Actualizar hotel_state
    if (parsed.hotelUpdate) {
      await updateHotelState(gameId, parsed.hotelUpdate);
    }

    // 9. Generar y guardar resumen del ciclo
    const summary =
      parsed.summary || (await generateCycleSummary(game, concatenatedMessages, parsed.message));
    await gamesQueries.addKeyEvent(gameId, cycle, summary);

    // 10. Incrementar ciclo
    await gamesQueries.incrementCycle(gameId);

    // 11. Actualizar estado a WAITING_PLAYER
    await gamesQueries.updateGameState(gameId, GAME_STATE.WAITING_PLAYER);

    console.log(
      `RESULTS sent for game ${gameId}, cycle ${cycle} (${daysElapsed} days elapsed). Now waiting for player.`
    );
  } catch (error) {
    console.error(`Error processing send_results for game ${gameId}:`, error);
    throw error;
  }
};

const parseResultsResponse = (response) => {
  const result = {
    message: '',
    hotelUpdate: null,
    summary: null,
  };

  try {
    // Extraer mensaje
    const messageMatch = response.match(/---MENSAJE---([\s\S]*?)---HOTEL_UPDATE---/);
    if (messageMatch) {
      result.message = messageMatch[1].trim();
    } else {
      // Si no encuentra el formato, usar toda la respuesta como mensaje
      result.message = response.trim();
    }

    // Extraer hotel update
    const updateMatch = response.match(/---HOTEL_UPDATE---([\s\S]*?)---RESUMEN_CICLO---/);
    if (updateMatch) {
      try {
        result.hotelUpdate = JSON.parse(updateMatch[1].trim());
      } catch (e) {
        console.error('Error parsing hotel update JSON:', e);
      }
    }

    // Extraer resumen del ciclo
    const summaryMatch = response.match(/---RESUMEN_CICLO---([\s\S]*?)$/);
    if (summaryMatch) {
      result.summary = summaryMatch[1].trim();
    }
  } catch (error) {
    console.error('Error parsing results response:', error);
  }

  return result;
};

module.exports = {
  processSendResults,
};
