import Relay from 'react-relay';

export default class CreateTopicMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation{createTopic}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on createTopicPayload @relay(pattern: true) {
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
      title: this.props.title,
      description: this.props.description,
      viewerId: this.props.viewerId
    };
  }
}