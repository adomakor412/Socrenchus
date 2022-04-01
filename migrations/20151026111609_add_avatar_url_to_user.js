
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function (table) {
    table.string('avatar_url');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('avatar_url');
  });
};
