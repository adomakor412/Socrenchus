import BookshelfType from 'graphql-bookshelf'
import RoomType from './RoomType'
import TopicType from './TopicType'
import {
  GraphQLID,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean
} from 'graphql'
import {
  globalIdField,
  fromGlobalId
} from 'graphql-relay';
import {nodeInterface} from './nodeIdentification';

export default new GraphQLObjectType(BookshelfType({
  name: 'User',
  description: 'A user of the app',
  interfaces: [nodeInterface],
  fields: (model) => ({
    id: globalIdField('User'),
    name: model.attr({
      type: GraphQLString,
      description: 'The name of the user',
    }),
    email: model.attr({
      type: GraphQLString,
      description: 'The email address of the user.',
    }),
    facebook_id: model.attr({
      type: GraphQLString,
      description: 'The unique id of the user on Facebook.',
    }),
    avatar_url: model.attr({
      type: GraphQLString,
      description: 'The profile picture for the user',
    }),
    notifications_enabled: model.attr({
      type: GraphQLBoolean,
      description: 'True if user enables push notifications',
    }),
    topics: {
      type: new GraphQLList(TopicType),
      description: 'Recommended or queried topics.',
      args: {
        search: {
          type: GraphQLString,
          description: 'Optional text search of topics'
        }
      },
      resolve: (modelInstance, {search}) => {
        if (search) {
          return BookshelfType.collection(
            modelInstance.searchTopics(search)
          );
        } else {
          return BookshelfType.collection(
            modelInstance.recommendedTopics()
          );
        }
      }
    },
    rooms: model.hasMany({
      type: new GraphQLList(RoomType),
      description: 'The rooms the user belongs to.',
      args: {
        id: {
          type: GraphQLID,
          description: 'Optional ID of the room.'
        },
        topicId: {
          type: GraphQLID,
          description: 'Optional ID of the topic.'
        }
      },
      resolve: (qb, modelInstance, {id, topicId}) => {
        if (id) {
          qb.where({room_id: fromGlobalId(id).id});
        }
        if (topicId) {
          qb.where({topic_id: fromGlobalId(topicId).id});
        }
        qb.orderBy('updated_at', 'desc');
      }
    })
  }),
}));
