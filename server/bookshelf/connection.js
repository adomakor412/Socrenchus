if (!process.env.DATABASE_URL)
  throw new Error('Missing required env variables');

var bookshelf = require('bookshelf')(require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL
}));
var knex = bookshelf.knex

module.exports = {
  knex,
  bookshelf
}
