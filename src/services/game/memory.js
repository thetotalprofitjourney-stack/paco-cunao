const gamesQueries = require('../../db/queries/games');
const { callAI } = require('../ai/client');
const env = require('../../config/env');

const updateHotelState = async (gameId, updates) => {
  return await gamesQueries.updateGameHotelState(gameId, updates);
};

const generateCycleSummary = async (game, playerMessages, resultsMessage) => {
  const prompt = `
Resume en UNA SOLA FRASE (máximo 20 palabras) qué pasó en este ciclo del juego.

El jugador sugirió:
${playerMessages}

Paco hizo:
${resultsMessage}

Ejemplo de formato: "Se instaló wifi. La tía Encarna amenazó con irse por el gasto."

RESUMEN:`;

  try {
    const result = await callAI('Eres un asistente que resume eventos de forma concisa.', prompt, {
      max_tokens: 50,
      temperature: 0.5,
    });

    return result.message.trim();
  } catch (error) {
    console.error('Error generating cycle summary:', error);
    return 'Ciclo completado.';
  }
};

const addKeyEvent = async (gameId, cycle, summary) => {
  return await gamesQueries.addKeyEvent(gameId, cycle, summary);
};

const compressOldEvents = async (gameId) => {
  const game = await gamesQueries.getGameById(gameId);

  if (game.key_events.length > env.maxKeyEvents) {
    // Mantener los últimos 20 eventos intactos
    const recentEvents = game.key_events.slice(-20);
    const oldEvents = game.key_events.slice(0, -20);

    // Pedir a la IA que resuma los eventos antiguos
    const prompt = `
Resume estos eventos históricos del hotel en 5-10 puntos clave:

${oldEvents.map((e) => `Ciclo ${e.cycle}: ${e.summary}`).join('\n')}

Genera un resumen conciso en formato de lista.
`;

    try {
      const result = await callAI('Eres un asistente que resume historias.', prompt, {
        max_tokens: 200,
        temperature: 0.5,
      });

      // Guardar: evento comprimido + eventos recientes
      const compressedEvent = {
        cycle: 0,
        summary: `RESUMEN CICLOS 1-${oldEvents.length}: ${result.message.trim()}`,
      };

      await gamesQueries.updateKeyEvents(gameId, [compressedEvent, ...recentEvents]);
    } catch (error) {
      console.error('Error compressing events:', error);
    }
  }
};

module.exports = {
  updateHotelState,
  generateCycleSummary,
  addKeyEvent,
  compressOldEvents,
};
