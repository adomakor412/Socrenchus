import { subscriptionWithClientId } from 'graphql-relay-subscription';
import { fromGlobalId } from 'graphql-relay';
import { Room, } from '../bookshelf';
import RoomType from './RoomType'
import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql'

export default new GraphQLObjectType({
  name: 'Subscription',
  fields: () => ({
    createMessageSubscription: subscriptionWithClientId({
      name: 'createMessageSubscription',
      outputFields: {
        room: {
          type: RoomType,
          resolve: ({roomId}) => (new Room({id: roomId})).fetch()
        },
      },
      inputFields: {
        roomId: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      subscribe: ({roomId}, context) => {
        context.subscribe(`create_message_${fromGlobalId(roomId).id}`);
      },
    }),
    participantsChangedSubscription: subscriptionWithClientId({
      name: 'participantsChangedSubscription',
      outputFields: {
        room: {
          type: RoomType,
          resolve: ({roomId}) => (new Room({id: roomId})).fetch()
        },
      },
      inputFields: {
        roomId: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      subscribe: ({roomId}, context) => {
        context.subscribe(`participants_changed_${fromGlobalId(roomId).id}`);
      },
    })
  })
})