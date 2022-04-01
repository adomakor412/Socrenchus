import BookshelfType from 'graphql-bookshelf'
import RoomType from './RoomType'
import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'
import {
  globalIdField,
} from 'graphql-relay';

export default new GraphQLObjectType(BookshelfType({
  name: 'Topic',
  description: 'A subject to talk about.',
  fields: (model) => ({
    id: globalIdField('Topic'),
    title: model.attr({
      type: GraphQLString,
      description: 'The unique name of the topic (without the #).',
    }),
    description: model.attr({
      type: GraphQLString,
      description: 'A brief description of the topic.',
    }),
    rooms: model.hasMany({
      type: new GraphQLList(RoomType),
      description: 'Rooms on this topic',
    }),
    popularity: {
      type: GraphQLInt,
      description: 'How many users are talking about the topic.',
      resolve: (model) => {
        return model.popularity();
      },
    }
  }),
}));
