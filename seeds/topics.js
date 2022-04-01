
exports.seed = function(knex, Promise) {
  return Promise.join(
    // Deletes ALL existing entries
    knex('messages').del(),
    knex('rooms_users').del(),
    knex('rooms').del(),
    knex('topics').del(),
    knex('topics').insert({
      title: 'WrestleMania',
      description: 'Talk about the wrestle maniacs!',
    }),
    knex('topics').insert({
      title: 'Coachella',
      description: 'What the hell is coachella?',
    }),
    knex('topics').insert({
      title: 'TheDailyShow',
      description: 'WTF? Jon Stewart is leaving!?!!',
    }),
    knex('topics').insert({
      title: 'KentuckyVsND',
      description: 'Talk about sports',
    }),
    knex('topics').insert({
      title: 'WalkingDead',
      description: 'zombiesss!!!',
    })
  );
};
