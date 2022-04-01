import { knex, currentUser } from '../../config/spec/integration'
import { Topic, User } from '../../bookshelf';
import { schema, graphql } from '../../graphql';

describe('rootQuery', function() {
  var root, topics;

  describe('getting a list of topics', function() {
    it('returns a list of all the topics the user has not joined', function* () {
      yield Topic.findOrCreate({title: 'one-nojoin'}, {description: 'fish'});
      yield Topic.findOrCreate({title: 'two-nojoin'}, {description: 'fish!'});
      var toJoin = yield Topic.findOrCreate({title: 'red'}, {description: 'fish!!'});
      yield Topic.findOrCreate({title: 'blue-nojoin'}, {description: 'fish@!'});
      var user = yield currentUser();
      yield Topic.putUserInRoom(toJoin.get('id'), user.get('id'));
      root = {
        currentUserID: user.get('id')
      }

      let query = `{
        viewer {
          topics {
            title
            description
          }
        }
      }`

      topics = yield graphql(schema, query, root)

      expect(topics.data.viewer.topics).toContain({
        description: 'fish',
        title: 'one-nojoin'
      });
      expect(topics.data.viewer.topics).toContain({
        description: 'fish!',
        title: 'two-nojoin'
      });
      expect(topics.data.viewer.topics).not.toContain({
        description: 'fish!!',
        title: 'red'
      });
      expect(topics.data.viewer.topics).toContain({
        description: 'fish@!',
        title: 'blue-nojoin'
      });
  });
  });

  describe('getting open rooms', function() {
    it('lists the open rooms for a user', function* () {
      var user = yield currentUser();
      var topic1 = yield Topic.findOrCreate({title: 'one'}, {description: 'fish'});
      var topic2 = yield Topic.findOrCreate({title: 'two'}, {description: 'fish!'});
      var topic3 = yield Topic.findOrCreate({title: 'blue'}, {description: 'fish@!'});

      yield Topic.putUserInRoom(topic2.id, root.currentUserID);
      yield Topic.putUserInRoom(topic1.id, root.currentUserID);

      let query = `{
        viewer {
          rooms {
            topic {
              title
            }
          }
        }
      }`

      var results = yield graphql(schema, query, root);

      expect(results.data.viewer.rooms).toContain({
        topic: { title: 'one' }
      });
      expect(results.data.viewer.rooms).toContain({
        topic: { title: 'two' }
      });
      expect(results.data.viewer.rooms).not.toContain({
        topic: { title: 'blue' }
      });
    });

  });
});
