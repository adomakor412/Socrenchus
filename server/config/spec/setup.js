import co from 'co';
import knexCleaner from 'knex-cleaner';
require('dotenv').config({path: './.env.test'});
var bookshelf = require('../../bookshelf/connection').bookshelf;
var knex = bookshelf.knex;

var syncPromise = Promise.resolve(true);

function cleanDatabase(fn) {
  return knexCleaner.clean(knex).then(fn);
}

function syncronously(fn) {
  syncPromise = syncPromise.then(fn);

  return () => syncPromise;
}

function customIt(parentIt) {
  return (msg, fn) => {
    return parentIt(msg, syncronously(cleanDatabase(co.wrap(fn))));
  }
}

it = customIt(it);
it.xit = customIt(xit);
