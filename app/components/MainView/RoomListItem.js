import React from 'react';
import Relay from 'react-relay';
import RelaySubscriptions from 'relay-subscriptions';
import {
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import NavigationStore from '../../stores/NavigationStore.js';
import RoomMessagePreview from './RoomMessagePreview';
import Flix from './Flix';
import styles from '../../styles/shared';
import cardListStyles from '../../styles/cardListStyles';
import LeaveRoomMutation from '../../mutations/LeaveRoomMutation';
import CreateMessageSubscription from '../../subscriptions/CreateMessageSubscription';
import ParticipantsChangedSubscription from '../../subscriptions/ParticipantsChangedSubscription';

const RoomListItem = React.createClass({
  render: function() {
    var room = this.props.room;
    if (this.props.leaveRoom !== undefined) {
      return (<View/>);
    } else {
      return (
        <View style={[cardListStyles.cardMissing, {elevation: 3}]}>
          <TouchableHighlight style={[cardListStyles.card, {marginLeft: 0, marginRight: 0, margin: 0}]} onPress={() => this._press()}>
            <View>
              <View style={[cardListStyles.row, {backgroundColor: '#F8F8F8'}]}>
                <View style={cardListStyles.column}>
                  <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                    <Text style={[styles.baseText, cardListStyles.rowTitle, {alignSelf: 'center', fontSize: 24}]}>
                      {'#' + room.topic.title}
                    </Text>
                  </View>
                  <Text style={[styles.baseText, styles.fonts.ADELLE[400], {flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent: 'center', textAlign: 'center', margin: 3, fontSize: 12}]}>
                    <Text style={styles.fonts.ADELLE[900]}>
                      {room.users.length} / 15
                    </Text> Herders
                  </Text>
                </View>
              </View>
              <RoomMessagePreview message={room.lastMessage}/>
            </View>
          </TouchableHighlight>
        </View>
      );
    }
  },
  _press: function() {
    NavigationStore.goTo.chat(this.props.room.topic.id);
  },
  _leaveRoom() {
    this.props.relay.commitUpdate(
      new LeaveRoomMutation({
        roomId: this.props.room.id,
        viewer: this.props.viewer
      }), {
        onSuccess: () => {
          NavigationStore.goTo.main()
        },
        onFailure: (transaction) => {
          var error = transaction.getError() || new Error('Mutation failed.');
          console.error(error);
        }
      }
    );
  }
});

export default RelaySubscriptions.createContainer(RoomListItem, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        id
        ${LeaveRoomMutation.getFragment('viewer')}
      }
    `,
    room: () => Relay.QL`
      fragment on Room {
        id
        topic {
          id
          title
        }
        users {
          name
        }
        lastMessage {
          ${RoomMessagePreview.getFragment('message')}
        }
      }
    `
  },
  subscriptions: [
    ({ room }) => new CreateMessageSubscription({ roomId: room.id }),
    ({ room }) => new ParticipantsChangedSubscription({ roomId: room.id })
  ]
});