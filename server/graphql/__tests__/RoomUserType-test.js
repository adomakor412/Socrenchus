import { knex, currentUser } from '../../config/spec/integration'
import { Topic, User } from '../../bookshelf';
import { schema, graphql } from '../../graphql';

describe('RoomUserType', function() {
  describe('when the room has more than 15 people', function() {
    xit('tells half of them that there is a closer room', function* () {
      var toJoin = yield Topic.findOrCreate({title: 'popular-topic'}, {description: 'we need to split'});

      let users = [];
      for (let i = 0; i < 16; ++i) {
        users.push(yield User.findOrCreate({email: `sheep${i}@example.com`}, {name: `Sheep${i} McGee`}));
        yield Topic.putUserInRoom(toJoin.get('id'), users[i].get('id'));
      }

      const query = `{
        viewer {
          rooms {
            topic {
              title
            }
            membership {
              closerRoomAvailable
            }
          }
        }
      }`

      let closerRoomCount = 0;
      for (let i = 0; i < 16; ++i) {
        var root = {
          currentUserID: users[i].get('id')
        }

        let results = yield graphql(schema, query, root);

        if (results.data.viewer.rooms[0].membership.closerRoomAvailable) {
          closerRoomCount += 1;
        }
      }

      expect(closerRoomCount).toBe(8);
  });
  });
});
