import Relay from 'react-relay';

export default class CreateMessageMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation{createMessage}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on createMessagePayload @relay(pattern: true) {
        newMessageEdge
        room {
          id
          lastMessage
          message_connection
          messages
        }
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'room',
      parentID: this.props.room.id,
      connectionName: 'message_connection',
      edgeName: 'newMessageEdge',
      rangeBehaviors: (args) => 'prepend'
    },{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        room: this.props.room.id
      },
    }];
  }
  getVariables() {
    return {
      viewerId: this.props.viewer.id,
      roomId: this.props.room.id,
      text: this.props.text
    };
  }
  getOptimisticResponse() {
    const { room } = this.props;
    return {
      room,
      newMessageEdge: {
        cursor: 'test',
        node: {
          text: this.props.text,
          createdAt: null,
          author: {
            id: this.props.viewer.id
          }
        }
      }
    };
  }

  static fragments = {
    room: () => Relay.QL`
      fragment on Room {
        id
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        id
        name
      }
    `
  };
}
