//sets up connection pool to postgres
const { Pool } = require('pg');

const pool = new Pool({
  user: 'yc_user',
  host: 'localhost',
  database: 'yieldcraft',
  password: 'kdb1718',
  port: 5432
});
pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("PostgreSQL connection error:", err.message));
module.exports = pool;
