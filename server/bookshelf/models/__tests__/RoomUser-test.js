import { knex, currentUser } from '../../../config/spec/integration'
import { Topic, User, Room, RoomUser, Message, Rooms } from '../../';

describe('RoomUser', function() {
  describe('updateClosestRoom', function() {

    it('stores the closest room on the membership', function* () {
      var topic = yield Topic.findOrCreate({title: 'foo'}, {description: 'bar'});
      var user = yield User.findOrCreate({ email: 'moving+user@example.com' }, { name: 'Joe Shmoe', latitude: 4, longitude: 5 });
      var room1 = yield Room.forge({topic_id: topic.get('id'), latitude: 6, longitude: 5}).save()
      var room2 = yield Room.forge({topic_id: topic.get('id'), latitude: 1, longitude: 4}).save()

      var room_user = yield Topic.putUserInRoom(topic.get('id'), user.get('id'));

      expect(room_user.get('room_id')).toEqual(room1.get('id'));
      expect(room_user.get('closest_room_id')).toEqual(room1.get('id'));

      yield user.save({latitude: 2,longitude: 2}, {patch: true});

      room_user = yield room_user.updateClosestRoom(new Rooms([room1, room2], {model: Room}));

      expect(room_user.get('closest_room_id')).toEqual(room2.get('id'));
    });
  });

});
