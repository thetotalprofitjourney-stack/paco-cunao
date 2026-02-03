const db = require('../client');

const createMessage = async ({
  gameId,
  cycle,
  direction,
  messageType,
  content,
  waMessageId = null,
  tokensInput = null,
  tokensOutput = null,
}) => {
  const query = `
    INSERT INTO messages (
      game_id, cycle, direction, message_type, content,
      wa_message_id, tokens_input, tokens_output, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING *
  `;
  const result = await db.query(query, [
    gameId,
    cycle,
    direction,
    messageType,
    content,
    waMessageId,
    tokensInput,
    tokensOutput,
  ]);
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

module.exports = {
  createMessage,
  getMessagesByGame,
  getMessagesByCycle,
  getMessagesFromLastNCycles,
  getPlayerMessagesByCycle,
};
