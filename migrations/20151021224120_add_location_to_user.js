
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function (table) {
    table.string('location');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('location');
  });
};
