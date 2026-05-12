const db = require('../database');
const bcrypt = require('bcrypt');

async function createUser({ name, email, password, role = 'user' }) {
  const hashed = await bcrypt.hash(password, 10);
  const result = await db.query(
    'INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role,created_at',
    [name, email, hashed, role]
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await db.query('SELECT id,name,email,password,role FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

module.exports = {
  createUser,
  findByEmail,
};
