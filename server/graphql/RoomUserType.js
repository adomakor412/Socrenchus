import BookshelfType from 'graphql-bookshelf'
import RoomType from './RoomType'
import UserType from './UserType'
import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql'
import {
  globalIdField,
} from 'graphql-relay';
import RoomUser from '../bookshelf/models/RoomUser'

export default new GraphQLObjectType(BookshelfType({
  name: 'RoomUser',
  description: 'The membership of a user in a room.',
  model: RoomUser,
  fields: (model) => ({
    id: globalIdField('RoomUser'),
    room: model.belongsTo({
      type: RoomType,
      description: 'The room the user is in.'
    }),
    user: model.belongsTo({
      type: UserType,
      description: 'The user that is in the room'
    }),
    lastRead: model.attr({
      type: GraphQLString,
      description: 'When the user last checked the room.',
    }),
    closestRoom: model.belongsTo({
      type: RoomType,
      description: 'Holds the closest room to the user even if they are in a different one.',
    }),
    hasCloserRoom: {
      type: GraphQLBoolean,
      description: 'True when the user can switch to a closer room.',
      resolve: (modelInstance) => {
        let closestRoomID = modelInstance.get('closest_room_id');
        return closestRoomID && closestRoomID !== modelInstance.get('room_id');
      }
    },
    closerRoomSkipped:{
      type: GraphQLBoolean,
      description: 'True if the closest room has been skipped over.',
      resolve: (modelInstance) => {
        return (modelInstance.get('skipped_room_id') == `${modelInstance.get('closest_room_id')}`);
      }
    },
    unreadCount: {
      type: GraphQLInt,
      description: 'Count of unread messages',
      resolve: (modelInstance) => {
        return modelInstance.unreadCount();
      }
    },
  }),
}));
