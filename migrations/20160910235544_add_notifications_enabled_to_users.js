
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function (table) {
    table.boolean('notifications_enabled');
  });

};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('notifications_enabled');
  });
};
