const db = require('../database');
const bcrypt = require('bcrypt');
const freelancerProfileService = require('./freelancerProfileService');

async function createUser({ name, email, password, role = 'user' }) {
  const hashed = await bcrypt.hash(password, 10);
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role,created_at',
      [name, email, hashed, role]
    );

    const user = userResult.rows[0];

    await client.query(
      `INSERT INTO freelancer_profiles (freelancer_id)
       VALUES ($1)
       ON CONFLICT (freelancer_id) DO NOTHING`,
      [user.id]
    );

    await client.query('COMMIT');
    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function findByEmail(email) {
  const result = await db.query('SELECT id,name,email,password,role FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

module.exports = {
  createUser,
  findByEmail,
};
