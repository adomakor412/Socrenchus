import { knex, currentUser } from '../../../config/spec/integration'
import { Topic, User, Room, RoomUser, Message, Rooms } from '../../';

describe('Topic', function() {
  describe('putUserInRoom', function() {

    it('places the user in the nearest room then reruns k-means for topic', function* () {
      var topic = yield Topic.findOrCreate({title: 'foo'}, {description: 'bar'});
      var user = yield User.findOrCreate({ email: 'user@example.com' }, { name: 'Joe Shmoe', latitude: 4, longitude: 5 });
      var farRoom = yield Room.forge({topic_id: topic.get('id'), latitude: 1, longitude: 4}).save()
      var closeRoom = yield Room.forge({topic_id: topic.get('id'), latitude: 6, longitude: 5}).save()

      var room_user = yield Topic.putUserInRoom(topic.get('id'), user.get('id'));

      expect(room_user.get('room_id')).toEqual(closeRoom.get('id'));
    });

  });
});
