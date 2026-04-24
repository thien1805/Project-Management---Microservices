const { Pool } = require('pg');

const shouldUseSsl = () => {
  const sslEnv = process.env.DB_SSL;

  if (sslEnv !== undefined) {
    return ['1', 'true', 'yes', 'on'].includes(String(sslEnv).toLowerCase());
  }

  return String(process.env.DB_HOST || '').includes('rds.amazonaws.com');
};

const config = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

if (shouldUseSsl()) {
  config.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(config);

module.exports = pool;