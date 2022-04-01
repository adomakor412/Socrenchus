import { knex, currentUser } from '../../config/spec/integration'
import { Topic, User } from '../../bookshelf';
import { graphql, schema } from '../../graphql';

describe('rootMutation', function() {
  let root;

  describe('joinTopic', function() {
    it('returns a RoomUserType', function* () {
      var topic = yield Topic.findOrCreate({title: 'foo'}, {description: 'bar'});
      var user = yield currentUser();
      root = {
        currentUserID: user.get('id')
      }

      let query = `
        mutation joinTopic($topic: Int!) {
          joinTopic(topic: $topic) {
            room {
              topic {
                title
              }
            }
            user {
              name
            }
          }
        }
      `

      let params = {
        topic: topic.get('id')
      }

      var results = yield graphql(schema, query, root, params)

      expect(results).toEqual({
        data: {
          joinTopic: {
            room: {
              topic: {
                title: 'foo'
              }
            },
            user: {
              name: 'Joe Shmoe'
            }
          }
        }
      });
    });
  });
});
