const db = require('../client');

const createGame = async (userId, hotelState = null) => {
  const query = `
    INSERT INTO games (user_id, state, hotel_state, key_events, current_cycle, created_at, updated_at)
    VALUES ($1, 'waiting_player', $2, '[]', 0, NOW(), NOW())
    RETURNING *
  `;
  const result = await db.query(query, [userId, hotelState ? JSON.stringify(hotelState) : null]);
  return result.rows[0];
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
    SET state = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await db.query(query, [state, id]);
  return result.rows[0];
};

const updateGameConsolidation = async (id, jobId) => {
  const query = `
    UPDATE games
    SET consolidation_started_at = NOW(),
        consolidation_job_id = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await db.query(query, [jobId, id]);
  return result.rows[0];
};

const updateGameHotelState = async (id, hotelStateUpdates) => {
  const query = `
    UPDATE games
    SET hotel_state = hotel_state || $1::jsonb,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await db.query(query, [JSON.stringify(hotelStateUpdates), id]);
  return result.rows[0];
};

const incrementCycle = async (id) => {
  const query = `
    UPDATE games
    SET current_cycle = current_cycle + 1,
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const addKeyEvent = async (id, cycle, summary) => {
  const query = `
    UPDATE games
    SET key_events = key_events || $1::jsonb,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const event = JSON.stringify({ cycle, summary });
  const result = await db.query(query, [event, id]);
  return result.rows[0];
};

const updateKeyEvents = async (id, events) => {
  const query = `
    UPDATE games
    SET key_events = $1::jsonb,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await db.query(query, [JSON.stringify(events), id]);
  return result.rows[0];
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
