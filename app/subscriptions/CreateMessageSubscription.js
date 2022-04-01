import Relay from 'react-relay';
import { Subscription } from 'relay-subscriptions';
import RoomListItem from '../components/MainView/RoomListItem';

export default class CreateMessageSubscription extends Subscription {
  getSubscription() {
    return Relay.QL`subscription {
      createMessageSubscription(input: $input) {
        room {
          id
          ${RoomListItem.getFragment('room')}
          message_connection(first: 50) {
            edges {
              node {
                id
                text
                createdAt
                author {
                  name
                  email
                  avatar_url
                }
              }
            }
          }
        }
      }
    }`;
  }
  
  getVariables() {
    return { roomId: this.props.roomId };
  }
  
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        room: this.props.roomId
      },
    }];
  }
}