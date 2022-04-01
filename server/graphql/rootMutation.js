import ObjectID from 'bson-objectid';
import {
  mutationWithClientMutationId,
  fromGlobalId,
  cursorForObjectInConnection
} from 'graphql-relay';
import { User, Topic, Room, Message, RoomUser } from '../bookshelf';
import { MessageType, MessageEdge } from './MessageType'
import RoomUserType from './RoomUserType'
import RoomType from './RoomType'
import UserType from './UserType'
import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql'

    
export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createMessage: mutationWithClientMutationId({
      name: 'createMessage',
      description: 'Send new chat message to the room',
      inputFields: {
        roomId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'ID of the topic to join a room for'
        },
        viewerId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'ID of the current user'
        },
        text: {
          type: new GraphQLNonNull(GraphQLString),
          description: 'The message text to send'
        },
      },
      outputFields: {
        room: {
          type: RoomType,
          resolve: ({room}, __, ___, {rootValue}) => room
        },
        newMessageEdge: {
          type: MessageEdge,
          resolve: ({room, message}, __, ___, {rootValue}) => {
            const messages = room.related('messages').models;
            return {
              cursor: cursorForObjectInConnection(messages, message),
              node: message
            }
          }
        }
      },
      mutateAndGetPayload: ({roomId, text}, ctx, {rootValue}) => {
        let author_id = rootValue.currentUserID;
        const room = new Room({id: fromGlobalId(roomId).id});
        return room.sendMessage({text, author_id});
      },
    }),
    leaveRoom: mutationWithClientMutationId({
      name: 'leaveRoom',
      description: 'Remove the user from a room they are in',
      inputFields: {
        roomId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'ID of the room to leave'
        },
        viewerId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'ID of the current user'
        },
      },
      outputFields: {
        viewer: {
          type: UserType,
          resolve: (_, __, ___, {rootValue}) => User.where({id: rootValue.currentUserID}).fetch()
        },
      },
      mutateAndGetPayload: ({roomId}, ctx, {rootValue}) => {
        return RoomUser.forge({room_id: fromGlobalId(roomId).id}).where({room_id: fromGlobalId(roomId).id, user_id: rootValue.currentUserID}).destroy();
      },
    }),
    viewRoom: mutationWithClientMutationId({
      name: 'viewRoom',
      description: 'Join a room for a particular topic',
      inputFields: {
        roomId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'ID of the room the user is viewing'
        },
        viewerId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'ID of the current user'
        },
      },
      outputFields: {
        viewer: {
          type: UserType,
          resolve: (_, __, ___, {rootValue}) => User.where({id: rootValue.currentUserID}).fetch()
        },
      },
      mutateAndGetPayload: ({roomId}, ctx, {rootValue}) => {
        return (new RoomUser({
          room_id: fromGlobalId(roomId).id,
          user_id: rootValue.currentUserID
        })).fetch((model) => model.markAsRead());
      },
    }),
    userSettings: mutationWithClientMutationId({
      name: 'userSettings',
      inputFields: {
        viewerId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'ID of the current user'
        },
        notifications_enabled: {
          type: GraphQLBoolean,
          description: 'Enable or disable notifications'
        }
      },
      outputFields: {
        viewer: {
          type: UserType,
          resolve: (result, __, ___, {rootValue}) => result
        },
      },
      mutateAndGetPayload: ({notifications_enabled}, ctx, {rootValue}) => {
        return User.forge({id: rootValue.currentUserID, notifications_enabled}).save();
      },
    }),
    joinTopic: mutationWithClientMutationId({
        name: 'joinTopic',
        inputFields: {
          topicId: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID of the topic to join a room for'
          },
          viewerId: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID of the current user'
          },
        },
        outputFields: {
          viewer: {
            type: UserType,
            resolve: (_, __, ___, {rootValue}) => User.where({id: rootValue.currentUserID}).fetch()
          },
        },
        mutateAndGetPayload: ({topicId}, ctx, {rootValue}) => {
          return Topic.putUserInRoom(fromGlobalId(topicId).id, rootValue.currentUserID);
        },
      }),
    createTopic: mutationWithClientMutationId({
      name: 'createTopic',
      description: 'Create a new topic if it does not exist',
      inputFields: {
        title: {
          type: new GraphQLNonNull(GraphQLString),
          description: 'The title of the topic'
        },
        description: {
          type: new GraphQLNonNull(GraphQLString),
          description: 'The description of the new topic'
        },
        viewerId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'ID of the current user'
        },
      },
      outputFields: {
        viewer: {
          type: UserType,
          resolve: (_, __, ___, {rootValue}) => User.where({id: rootValue.currentUserID}).fetch()
        },
      },
      mutateAndGetPayload: ({title, description}, ctx, {rootValue}) => {
        if ("#" == title[0]) {
          title = title.slice(1);
        }
        return Topic.forge({title}).fetch().then((topic) => {
          if (topic) {
            return topic;
          } else {
            return (new Topic({title, description})).save();
          }
        }).then((topic) => {
          return Topic.putUserInRoom(topic.get('id'), rootValue.currentUserID);
        }).catch((reason) => {
          console.log('Error: ', reason);
        });
      },
    }),
    joinCloserRoom: mutationWithClientMutationId({
      name: 'joinCloserRoom',
      description: 'Join a closer room if available',
      inputFields: {
        membershipId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'ID of the membership to move to a closer room'
        },
        viewerId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'ID of the current user'
        }
      },
      outputFields: {
        viewer: {
          type: UserType,
          resolve: (_, __, ___, {rootValue}) => User.where({id: rootValue.currentUserID}).fetch()
        },
      },
      mutateAndGetPayload: ({membershipId}, ctx, {rootValue}) => {
        return RoomUser.forge().where({
          id: fromGlobalId(membershipId).id,
          user_id: rootValue.currentUserID
        }).fetch().then((membership) => {
          return membership.save({
            room_id: membership.get('closest_room_id')
          }, {patch: true});
        });
      }
    }),
    skipCloserRoom: mutationWithClientMutationId({
      name: 'skipCloserRoom',
      description: 'Opt out of joining a closer room',
      inputFields: {
        membershipId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'ID of the membership to skip out on closer room'
        },
      },
      outputFields: {
        membership: {
          type: RoomUserType,
          resolve: (result, __, ___, {rootValue}) => result
        },
      },
      mutateAndGetPayload: ({membershipId}, ctx, {rootValue}) => {
        return RoomUser.forge().where({
          id: fromGlobalId(membershipId).id,
          user_id: rootValue.currentUserID
        }).fetch().then((membership) => {
          return membership.save({
            skipped_room_id: `${membership.get('closest_room_id')}`
          }, {patch: true});
        });
      }
    })
  })
})
