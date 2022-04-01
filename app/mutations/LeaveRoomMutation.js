import Relay from 'react-relay';

export default class LeaveRoomMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation{leaveRoom}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on leaveRoomPayload @relay(pattern: true) {
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
      viewerId: this.props.viewer.id,
      roomId: this.props.roomId
    };
  }
  getOptimisticResponse() {
    const newTopics = Array.from(this.props.viewer.topics);
    const newRooms = this.props.viewer.rooms.filter((room) => {
      const result = room.id != this.props.roomId;
      if (!result) newTopics.push(room.topic);
      return result;
    })
    return {
      viewer: {
        id: this.props.viewer.id,
        rooms: newRooms,
        topics: newTopics
      },
    };
  }
  
  static fragments = {
    viewer: () => Relay.QL`
      fragment on User {
        id
        rooms {
          id
        }
        topics {
          id
        }
      }
    `,
  };
}