
exports.up = function(knex, Promise) {
  return knex.schema.table('rooms_users', function (table) {
    table.integer('closest_room_id').references('id').inTable('rooms');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('rooms_users', function (table) {
    table.dropColumn('closest_room_id');
  });
};
