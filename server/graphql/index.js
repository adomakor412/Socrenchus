import {
  GraphQLSchema,
  graphql,
} from 'graphql'
import rootQuery from './rootQuery'
import rootMutation from './rootMutation'
import rootSubscription from './rootSubscription'

var schema = new GraphQLSchema({
  query: rootQuery,
  mutation: rootMutation,
  subscription: rootSubscription
});

module.exports = {
  graphql,
  schema
}
