import { User } from '../bookshelf';
import UserType from './UserType';
import {
  GraphQLObjectType,
} from 'graphql';
import {nodeField} from './nodeIdentification';

export default new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    viewer: {
      type: UserType,
      description: 'The current user of the site',
      resolve: (root, args, context) => {
        return User.where({id: root.currentUserID}).fetch();
      }
    }
  })
})
