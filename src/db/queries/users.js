const db = require('../client');

const createUser = async ({ phone, name }) => {
  const query = `
    INSERT INTO users (phone, name, status, created_at)
    VALUES ($1, $2, 'pending_activation', NOW())
    RETURNING *
  `;
  const result = await db.query(query, [phone, name]);
  return result.rows[0];
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
    SET status = $1, last_activity_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await db.query(query, [status, id]);
  return result.rows[0];
};

const updateUserActivity = async (id) => {
  const query = `
    UPDATE users
    SET last_activity_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createUser,
  getUserByPhone,
  getUserById,
  updateUserStatus,
  updateUserActivity,
};
