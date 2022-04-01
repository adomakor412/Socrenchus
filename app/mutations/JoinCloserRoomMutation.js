import Relay from 'react-relay';

export default class JoinCloserRoomMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation{joinCloserRoom}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on joinCloserRoomPayload @relay(pattern: true) {
        viewer {
          rooms
        }
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewerId
      },
    }];
  }
  getVariables() {
    return {
      viewerId: this.props.viewerId,
      membershipId: this.props.membershipId
    };
  }
}