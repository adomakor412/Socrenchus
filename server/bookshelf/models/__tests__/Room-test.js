import { knex, currentUser } from '../../../config/spec/integration'
import { Topic, User, Room, RoomUser, Message, Rooms } from '../../';

describe('Room', function() {
  describe('updateLocation', function() {

    it('recalculates and stores the mean of use locations', function* () {
      var topic = yield Topic.findOrCreate({title: 'foo'}, {description: 'bar'});
      var room = yield Room.forge({topic_id: topic.get('id'), latitude: 6, longitude: 5}).save()
      let users = [
        { latitude: 6, longitude: 5 },
        { latitude: 5, longitude: 0 },
        { latitude: 4, longitude: 2 },
        { latitude: 2, longitude: 4 }
      ];
      yield Promise.all(users.map((attrs, i) => {
        return User.findOrCreate({email: `sheep${i}@example.com`}, Object.assign({name: `Sheep${i} McGee`}, attrs)).then((user) => {
          return Topic.putUserInRoom(topic.get('id'), user.get('id')).then(() => user);
        });
      }));

      room = yield room.updateLocation();

      let { latitude, longitude } = room.attributes;
      expect({ latitude, longitude }).toEqual({
        latitude: 4.25,
        longitude: 2.75
      });
    });
  });

});
