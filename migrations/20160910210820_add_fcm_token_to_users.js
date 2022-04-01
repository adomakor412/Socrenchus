
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function (table) {
    table.string('fcm_token');
  });

};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('fcm_token');
  });
};
