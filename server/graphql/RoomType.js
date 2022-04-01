import BookshelfType from 'graphql-bookshelf'
import TopicType from './TopicType'
import { MessageType, MessageConnection } from './MessageType'
import UserType from './UserType'
import RoomUserType from './RoomUserType'
import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {
  globalIdField,
  connectionArgs
} from 'graphql-relay';

export default new GraphQLObjectType(BookshelfType({
  name: 'Room',
  description: 'A place to chat that only allows a certain number of users.',
  fields: (model) => ({
    id: globalIdField('Room'),
    topic: model.belongsTo({
      type: TopicType,
      description: 'The topic of the room.',
    }),
    users: model.hasMany({
      type: new GraphQLList(UserType),
      description: 'The users of the room.',
    }),
    messages: model.hasMany({
      type: new GraphQLList(MessageType),
      description: 'The messages in the room.',
      deprecationReason: 'message_connection offers better control',
      resolve: (qb) => {
        qb.orderBy('created_at', 'DESC');
      }
    }),
    message_connection: model.hasMany({
      type: MessageConnection,
      args: connectionArgs,
      description: 'The messages in the room.',
      resolve: (qb) => {
        qb.orderBy('created_at', 'DESC');
      }
    }),
    updatedAt: model.attr({
      type: GraphQLString,
      description: 'Manually advanced when a message is added.'
    }),
    membership: {
      type: RoomUserType,
      description: 'The membership of the current user in the room.',
      resolve: (modelInstance, params, source, {rootValue}) => {
        return modelInstance.membership(rootValue.currentUserID);
      }
    },
    lastMessage: {
      type: MessageType,
      description: 'The last message in the room.',
      resolve: (modelInstance, params, source, fieldASTs) => {
        return modelInstance.lastMessage();
      }
    }
  }),
}));
