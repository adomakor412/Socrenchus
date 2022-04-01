import BookshelfType from 'graphql-bookshelf'
import RoomType from './RoomType'
import UserType from './UserType'
import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'
import {
  globalIdField,
  connectionDefinitions
} from 'graphql-relay';

export const MessageType = new GraphQLObjectType(BookshelfType({
  name: 'Message',
  description: 'A message left by a user in a room.',
  fields: (model) => ({
    id: globalIdField('Message'),
    text: model.attr({
      type: GraphQLString,
      description: 'The body of the message.',
    }),
    room: model.belongsTo({
      type: RoomType,
      description: 'The room the message was posted in.',
    }),
    author: model.belongsTo({
      type: UserType,
      description: 'The user that wrote the message.',
    }),
    createdAt: model.attr({
      type: GraphQLString,
      description: 'Creation date of the message.'
    })
  }),
}));
export const { edgeType: MessageEdge, connectionType: MessageConnection } = connectionDefinitions({nodeType: MessageType});
export default MessageType;