
exports.up = function(knex, Promise) {
  return Promise.all([knex.schema.table('users', function (table) {
    table.dropColumn('location');
    table.float('latitude');
    table.float('longitude');
  }), knex.schema.table('rooms', function (table) {
    table.float('latitude');
    table.float('longitude');
  })]);

};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.table('users', function (table) {
    table.string('location');
    table.dropColumn('latitude');
    table.dropColumn('longitude');
  }), knex.schema.table('rooms', function (table) {
    table.dropColumn('latitude');
    table.dropColumn('longitude');
  })]);
};
