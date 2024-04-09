const pg = require("pg");
const { Pool } = pg;

const pool = new Pool({
  host: "34.123.29.31",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "namcoi123",
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
