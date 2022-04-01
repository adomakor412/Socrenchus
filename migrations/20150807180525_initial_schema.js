
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id');
    table.string('name');
    table.string('email').unique();
    table.string('facebook_id').unique();
    table.timestamps();
  }).createTable('topics', function (table) {
    table.increments('id');
    table.string('title').unique().index();
    table.string('description');
    table.timestamps();
  }).createTable('rooms', function (table) {
    table.increments('id');
    table.integer('topic_id').references('id').inTable('topics');
    table.timestamps();
  }).createTable('rooms_users', function (table) {
    table.increments('id');
    table.integer('room_id').references('id').inTable('rooms');
    table.integer('user_id').references('id').inTable('users');
    table.timestamp('last_read');
    table.timestamps();
  }).createTable('messages', function (table) {
    table.increments('id');
    table.string('text');
    table.integer('room_id').references('id').inTable('rooms');
    table.integer('author_id').references('id').inTable('users');
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('messages')
    .dropTable('rooms_users')
    .dropTable('rooms')
    .dropTable('topics')
    .dropTable('users');
};
