const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.POSTGREE_CONNECTION_STRING || process.env.DATABASE_URL || process.env.DATABASE_URL_CONNECTION || process.env.DATABASE_URL_CONNECTION_STRING;

const poolConfig = { connectionString };

if (connectionString && (connectionString.includes('sslmode=require') || connectionString.includes('neon') || connectionString.startsWith('postgresql://') && connectionString.includes('ssl'))) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
