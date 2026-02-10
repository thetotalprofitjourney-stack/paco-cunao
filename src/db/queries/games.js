const db = require('../client');
const { v4: uuidv4 } = require('uuid');

const createGame = async (userId, hotelState = null) => {
  const id = uuidv4();
  const query = `
    INSERT INTO games (id, user_id, state, hotel_state, key_events, current_cycle, created_at, updated_at)
    VALUES ($1, $2, 'waiting_player', $3, '[]', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;
  await db.query(query, [id, userId, hotelState ? JSON.stringify(hotelState) : null]);
  return getGameById(id);
};

const getGameByUserId = async (userId) => {
  const query = 'SELECT * FROM games WHERE user_id = $1';
  const result = await db.query(query, [userId]);
  return result.rows[0];
};

const getGameById = async (id) => {
  const query = 'SELECT * FROM games WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const updateGameState = async (id, state) => {
  const query = `
    UPDATE games
    SET state = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `;
  await db.query(query, [state, id]);
  return getGameById(id);
};

const updateGameConsolidation = async (id, jobId) => {
  const query = `
    UPDATE games
    SET consolidation_started_at = CURRENT_TIMESTAMP,
        consolidation_job_id = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `;
  await db.query(query, [jobId, id]);
  return getGameById(id);
};

const updateGameHotelState = async (id, hotelStateUpdates) => {
  const query = `
    UPDATE games
    SET hotel_state = JSON_MERGE_PATCH(hotel_state, $1),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `;
  await db.query(query, [JSON.stringify(hotelStateUpdates), id]);
  return getGameById(id);
};

const incrementCycle = async (id) => {
  const query = `
    UPDATE games
    SET current_cycle = current_cycle + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `;
  await db.query(query, [id]);
  return getGameById(id);
};

const addKeyEvent = async (id, cycle, summary) => {
  // MariaDB no soporta || para concatenar arrays JSON directamente
  // Necesitamos obtener el array actual, agregar el elemento, y actualizarlo
  const game = await getGameById(id);
  const keyEvents = game.key_events || [];
  const event = { cycle, summary };
  keyEvents.push(event);

  const query = `
    UPDATE games
    SET key_events = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `;
  await db.query(query, [JSON.stringify(keyEvents), id]);
  return getGameById(id);
};

const updateKeyEvents = async (id, events) => {
  const query = `
    UPDATE games
    SET key_events = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `;
  await db.query(query, [JSON.stringify(events), id]);
  return getGameById(id);
};

module.exports = {
  createGame,
  getGameByUserId,
  getGameById,
  updateGameState,
  updateGameConsolidation,
  updateGameHotelState,
  incrementCycle,
  addKeyEvent,
  updateKeyEvents,
};
