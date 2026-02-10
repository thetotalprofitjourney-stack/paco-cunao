const db = require('../client');
const { v4: uuidv4 } = require('uuid');

const createUser = async ({ phone, name }) => {
  const id = uuidv4();
  const query = `
    INSERT INTO users (id, phone, name, status, created_at)
    VALUES ($1, $2, $3, 'pending_activation', CURRENT_TIMESTAMP)
  `;
  await db.query(query, [id, phone, name]);
  // Devolvemos el usuario recién creado
  return getUserById(id);
};

const getUserByPhone = async (phone) => {
  const query = 'SELECT * FROM users WHERE phone = $1';
  const result = await db.query(query, [phone]);
  return result.rows[0];
};

const getUserById = async (id) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const updateUserStatus = async (id, status) => {
  const query = `
    UPDATE users
    SET status = $1, last_activity_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `;
  await db.query(query, [status, id]);
  return getUserById(id);
};

const updateUserActivity = async (id) => {
  const query = `
    UPDATE users
    SET last_activity_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `;
  await db.query(query, [id]);
  return getUserById(id);
};

module.exports = {
  createUser,
  getUserByPhone,
  getUserById,
  updateUserStatus,
  updateUserActivity,
};
