import { bookshelf } from '../connection'
import Room from './Room'
import User from './User'

export default bookshelf.Model.extend({
  tableName: 'topics',
  hasTimestamps: ['created_at', 'updated_at'],
  rooms: function() {
    return this.hasMany(Room);
  },
  popularity: function() {
    return this.load(['rooms']).then((topic) => {
      let popularities = [];
      topic.related('rooms').models.forEach((room) => {
        popularities.push(room.popularity());
      });
      return Promise.all(popularities).then(
        (pop) => pop.reduce((sum, cur) => sum + cur, 0)
      );
    });
  },
}, {
  findOrCreate: function(query, rest) {
    return this.where(query).fetch().then((result) => {
      if (result) return result.save(rest, {patch: true});

      return this.forge(Object.assign(query, rest)).save();
    });
  },
  putUserInRoom (topic_id, user_id) {
    return User.where({id: user_id}).fetch().then((user) => {
      return this.where({id: topic_id}).fetch({withRelated: 'rooms'}).then((topicModel) => {
        let collection = topicModel.related('rooms');
        return collection.breakUpLargeRooms().then(() => {
          let {latitude, longitude} = user.attributes;
          collection.updateClosestRooms();
          return collection.findOrCreateNearest({latitude, longitude}).then((room) => {
            return room.addUser(user_id, {isClosestRoom: true})
          }).then((result) => {
            collection.updateRoomLocations();
            return result;
          });
        });
      });
    });
  },
});
