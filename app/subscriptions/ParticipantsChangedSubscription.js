import Relay from 'react-relay';
import { Subscription } from 'relay-subscriptions';

export default class ParticipantsChangedSubscription extends Subscription {
  getSubscription() {
    return Relay.QL`subscription {
      participantsChangedSubscription(input: $input) {
        room {
          id
          users {
            name
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