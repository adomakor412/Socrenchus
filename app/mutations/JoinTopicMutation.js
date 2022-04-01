import Relay from 'react-relay';

export default class JoinTopicMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation{joinTopic}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on joinTopicPayload @relay(pattern: true) {
        viewer {
          rooms
          topics
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
      topicId: this.props.topicId
    };
  }
}