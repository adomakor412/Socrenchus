import { knex, currentUser } from '../../../config/spec/integration'
import { Topic, User, Room, RoomUser, Message, Rooms } from '../../';

describe('Rooms', function() {
  
  describe('kMeansAlgorithm', function() {
    it('clusters the users into rooms (stored as closestRoom)', function* () {
      var topic = yield Topic.findOrCreate({title: 'foo'}, {description: 'bar'});
      var room1 = yield Room.forge({topic_id: topic.get('id'), latitude: 2, longitude: 7}).save()
      var room2 = yield Room.forge({topic_id: topic.get('id'), latitude: 2, longitude: 8}).save()
      let users = [
        { latitude: 2, longitude: 3 },
        { latitude: 3, longitude: 9 },
        { latitude: 3, longitude: 6 },
        { latitude: 2, longitude: 5 },
        { latitude: 4, longitude: 9 },
        { latitude: 3, longitude: 10 },
        { latitude: 3, longitude: 4 }
      ];
      let emailTemplate = (i) => `sheep${i}@example.com`
      yield Promise.all(users.map((attrs, i) => {
        return User.findOrCreate({email:emailTemplate(i)}, Object.assign({name: `Sheep${i} McGee`}, attrs)).then((user) => {
          return Topic.putUserInRoom(topic.get('id'), user.get('id')).then(() => user);
        });
      }));

      yield (yield topic.rooms().fetch()).kMeansAlgorithm();

      let room1Emails = (yield room1.users().fetch()).map((u) => u.get('email')).sort();
      let room2Emails = (yield room2.users().fetch()).map((u) => u.get('email')).sort();

      let mapEmailTemplate = (indexes) => indexes.map(emailTemplate);
      expect(room1Emails).toEqual(mapEmailTemplate([0, 2, 3, 6]));
      expect(room2Emails).toEqual(mapEmailTemplate([1, 4, 5]));
    });
  });

  describe('updateClosestRooms', function() {

    it('calls updateClosestUsers on each room', function* () {
      var topic = yield Topic.findOrCreate({title: 'foo'}, {description: 'bar'});
      var room1 = yield topic.rooms().findOrCreateNearest({latitude: 1, longitude: 1});
      var room2 = yield topic.rooms().create({topic_id: topic.get('id'), latitude: 2, longitude: 2});

      var user1 = yield room2.users().create({
        email: 'wrongroom1@example.com',
        name: 'Lost Nforgotten',
        latitude: 1,
        longitude: 1
      });

      var user2 = yield room1.users().create({
        email: 'wrongroom2@example.com',
        name: 'LLost Nforgotten',
        latitude: 2,
        longitude: 2
      });

      yield (yield topic.rooms().fetch()).updateClosestRooms();

      var room1UserIds = (yield room1.users().fetch()).map((user) => user.get('id'));
      var room2UserIds = (yield room2.users().fetch()).map((user) => user.get('id'));
      var room1ClosestUserIds = (yield room1.closestUsers().fetch()).map((user) => user.get('id'));
      var room2ClosestUserIds = (yield room2.closestUsers().fetch()).map((user) => user.get('id'));

      expect(room1UserIds).toContain(user2.get('id'));
      expect(room2UserIds).toContain(user1.get('id'));
      expect(room1ClosestUserIds).toContain(user1.get('id'));
      expect(room2ClosestUserIds).toContain(user2.get('id'));
    });

  });

  describe('breakUpLargeRooms', function() {

    it('splits rooms over threshold and adds new rooms to collection', function* () {
      var topic = yield Topic.findOrCreate({title: 'foo'}, {description: 'bar'});

      // Create a room to start with
      var room = yield topic.rooms().findOrCreateNearest({latitude: 1, longitude: 1});
      expect(room instanceof Room).toBe(true);

      // 15 people and it still needs only one room
      for (let i = 0; i < 15; ++i) {
        yield User.findOrCreate({email: `foo${i}@example.com`}, {
          name: `Foo Bar ${i}`,
          longitude: i,
          latitude: i
        }).then((user) => room.addUser(user.get('id'), {isClosestRoom: true}));
      }

      let collection = yield topic.rooms().fetch();
      expect(collection instanceof Rooms).toBe(true);
      yield collection.breakUpLargeRooms();
      collection = yield collection.fetch();

      expect(collection.length).toBe(1);

      // 16 people and it now needs two rooms
      let i = 16;
      yield User.findOrCreate({email: `foo${i}@example.com`}, {
        name: `Foo Bar ${i}`,
        longitude: i,
        latitude: i
      }).then((user) => room.addUser(user.get('id'), {isClosestRoom: true}));

      yield collection.breakUpLargeRooms();
      collection = yield collection.fetch();

      expect(collection.length).toBe(2);

      // 17 people in one room but a second room is already recommended
      i = 17;
      yield User.findOrCreate({email: `foo${i}@example.com`}, {
        name: `Foo Bar ${i}`,
        longitude: i,
        latitude: i
      }).then((user) => room.addUser(user.get('id')));

      yield collection.breakUpLargeRooms();
      collection = yield collection.fetch();

      expect(collection.length).toBe(2);
    });

  });

});
