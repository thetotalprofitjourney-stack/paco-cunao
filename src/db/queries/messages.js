const db = require('../client');
const { v4: uuidv4 } = require('uuid');

const createMessage = async ({
  gameId,
  cycle,
  direction,
  messageType,
  content,
  waMessageId = null,
  tokensInput = null,
  tokensOutput = null,
  metadata = null,
}) => {
  const id = uuidv4();
  const query = `
    INSERT INTO messages (
      id, game_id, cycle, direction, message_type, content,
      wa_message_id, tokens_input, tokens_output, metadata, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
  `;
  await db.query(query, [
    id,
    gameId,
    cycle,
    direction,
    messageType,
    content,
    waMessageId,
    tokensInput,
    tokensOutput,
    metadata ? JSON.stringify(metadata) : null,
  ]);

  // Devolver el mensaje recién creado
  const selectQuery = 'SELECT * FROM messages WHERE id = $1';
  const result = await db.query(selectQuery, [id]);
  return result.rows[0];
};

const getMessagesByGame = async (gameId) => {
  const query = `
    SELECT * FROM messages
    WHERE game_id = $1
    ORDER BY created_at ASC
  `;
  const result = await db.query(query, [gameId]);
  return result.rows;
};

const getMessagesByCycle = async (gameId, cycle) => {
  const query = `
    SELECT * FROM messages
    WHERE game_id = $1 AND cycle = $2
    ORDER BY created_at ASC
  `;
  const result = await db.query(query, [gameId, cycle]);
  return result.rows;
};

const getMessagesFromLastNCycles = async (gameId, n) => {
  const query = `
    SELECT * FROM messages
    WHERE game_id = $1
      AND cycle >= (
        SELECT GREATEST(0, MAX(cycle) - $2)
        FROM messages
        WHERE game_id = $1
      )
    ORDER BY created_at ASC
  `;
  const result = await db.query(query, [gameId, n]);
  return result.rows;
};

const getPlayerMessagesByCycle = async (gameId, cycle) => {
  const query = `
    SELECT * FROM messages
    WHERE game_id = $1
      AND cycle = $2
      AND message_type = 'player_input'
    ORDER BY created_at ASC
  `;
  const result = await db.query(query, [gameId, cycle]);
  return result.rows;
};

const getLastMessageByType = async (gameId, messageType) => {
  const query = `
    SELECT * FROM messages
    WHERE game_id = $1
      AND message_type = $2
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const result = await db.query(query, [gameId, messageType]);
  return result.rows[0];
};

module.exports = {
  createMessage,
  getMessagesByGame,
  getMessagesByCycle,
  getMessagesFromLastNCycles,
  getPlayerMessagesByCycle,
  getLastMessageByType,
};
