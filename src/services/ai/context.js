const gamesQueries = require('../../db/queries/games');
const usersQueries = require('../../db/queries/users');
const messagesQueries = require('../../db/queries/messages');
const env = require('../../config/env');
const sponsored = require('../../config/sponsored');

const buildContext = async (gameId, currentCycleMessages = []) => {
  const game = await gamesQueries.getGameById(gameId);
  const user = await usersQueries.getUserById(game.user_id);
  const recentMessages = await messagesQueries.getMessagesFromLastNCycles(
    gameId,
    env.recentCyclesToInclude
  );

  const hs = game.hotel_state;

  // Cargar productos patrocinados activos
  const sponsoredPrompt = sponsored.buildSponsoredProductsPrompt();

  const context = `
JUGADOR: ${user.name}

ESTADO ACTUAL DEL HOTEL "${hs.name}":
- Estrellas: ${hs.stars}
- Habitaciones: ${hs.rooms} (${hs.occupancy_percent}% ocupación)
- Empleados: ${hs.employees.total} (${hs.employees.family} familia, ${hs.employees.professional} profesionales)
- Ingresos: ${hs.monthly_revenue}€/mes | Gastos: ${hs.monthly_expenses}€/mes
- Valoración Google: ${hs.google_rating}/5 (${hs.google_reviews_count} reseñas)
- Tecnología: WiFi ${hs.technology.has_wifi ? 'SÍ' : 'NO'}, Sistema reservas ${hs.technology.has_booking_system ? 'SÍ' : 'NO (Excel)'}, Web ${hs.technology.has_website ? 'SÍ' : 'NO'}
- Nivel de caos: ${hs.chaos_level}/10
- Tensión familiar: ${hs.family_tension_level}/10
- Problemas activos: ${hs.problems_active.join(', ')}
- Problemas resueltos: ${hs.problems_resolved.length > 0 ? hs.problems_resolved.join(', ') : 'ninguno aún'}

HISTORIAL DE LA PARTIDA:
${game.key_events.length > 0 ? game.key_events.map((e) => `- Ciclo ${e.cycle}: ${e.summary}`).join('\n') : '(Partida recién comenzada)'}

CONVERSACIÓN RECIENTE:
${formatRecentMessages(recentMessages)}

${currentCycleMessages.length > 0 ? `MENSAJES DEL JUGADOR EN ESTE CICLO:\n${currentCycleMessages.map((m) => m.content).join('\n\n')}` : ''}

${sponsoredPrompt ? `\n${sponsoredPrompt}` : ''}
  `.trim();

  return context;
};

const formatRecentMessages = (messages) => {
  if (messages.length === 0) {
    return '(Sin conversación previa)';
  }

  return messages
    .map((m) => {
      const sender = m.direction === 'outbound' ? 'Paco' : 'Jugador';
      return `[${sender}]: ${m.content}`;
    })
    .join('\n');
};

module.exports = {
  buildContext,
};
