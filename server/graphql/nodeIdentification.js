import {
  fromGlobalId,
  nodeDefinitions,
} from 'graphql-relay';
import MessageType from './MessageType'
import RoomType from './RoomType'
import RoomUserType from './RoomUserType'
import TopicType from './TopicType'
import UserType from './UserType'
import Models, {
  Message,
  Room,
  RoomUser,
  Topic,
  User
} from '../bookshelf/models'

module.exports = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (Models[type]) {
      return (new Models[type]({id})).fetch();
    } else {
      return null;
    }
  },
  (obj) => {
    if (obj instanceof User) {
      return UserType;
    } else if (obj instanceof Topic)  {
      return TopicType;
    } else if (obj instanceof RoomUser)  {
      return RoomUserType;
    } else if (obj instanceof Room)  {
      return RoomType;
    } else if (obj instanceof Message)  {
      return MessageType;
    } else {
      return null;
    }
  }
);
