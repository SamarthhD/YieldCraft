//sets up connection pool to postgres
const { Pool } = require('pg');

const pool = new Pool({
  user: 'yc_user',
  host: 'localhost',
  database: 'yieldcraft',
  password: 'yc_pass',
  port: 5432
});

module.exports = pool;
