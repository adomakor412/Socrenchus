exports.up = function(knex, Promise) {
  return knex.schema.table('rooms_users', function (table) {
    table.string('skipped_room_id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('rooms_users', function (table) {
    table.dropColumn('skipped_room_id');
  });
};
