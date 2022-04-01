import Relay from 'react-relay';

export default class SkipCloserRoomMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation{skipCloserRoom}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on skipCloserRoomPayload @relay(pattern: true) {
        membership {
          closerRoomSkipped
        }
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        membership: this.props.membershipId
      },
    }];
  }
  getVariables() {
    return {
      membershipId: this.props.membershipId
    };
  }
  getOptimisticResponse() {
    return { membership: {
      closerRoomSkipped: true
    } };
  }
}