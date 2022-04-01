require('dotenv').load();

if (!process.env.DATABASE_URL)
  throw new Error('Missing required env variables');

const config = {
  client: 'pg',
  connection: process.env.DATABASE_URL
};

module.exports = {
  development: config,
  test: config,
  production: config
}
