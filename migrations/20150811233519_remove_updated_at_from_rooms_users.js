
exports.up = function(knex, Promise) {
  return knex.schema.table('rooms_users', function (table) {
    table.dropColumn('updated_at');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('rooms_users', function (table) {
    table.timestamp('updated_at');
  });
};
