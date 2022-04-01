
exports.seed = function(knex, Promise) {
  return Promise.join(
    // Deletes ALL existing entries
    knex('users').del(),
    knex('users').insert({
      id: 1,
      name: 'Joe Schmoe',
      email: 'user@example.com',
    })
  );
};
