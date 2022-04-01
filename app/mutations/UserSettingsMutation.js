import Relay from 'react-relay';

export default class UserSettingsMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation{userSettings}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on userSettingsPayload @relay(pattern: true) {
        viewer {
          notifications_enabled
        }
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id
      },
    }];
  }
  getVariables() {
    return {
      viewerId: this.props.viewer.id,
      notifications_enabled: this.props.notifications_enabled
    };
  }
  getOptimisticResponse() {
    const { viewer, notifications_enabled } = this.props;
    return {
      viewer: {
        id: viewer.id,
        notifications_enabled: notifications_enabled || viewer.notifications_enabled,
      },
    };
  }
  
  static fragments = {
    viewer: () => Relay.QL`
      fragment on User {
        id
        notifications_enabled
      }
    `,
  };
}