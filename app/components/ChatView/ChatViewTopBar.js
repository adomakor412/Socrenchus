import React from 'react';
import Relay from 'react-relay';
import RelaySubscriptions from 'relay-subscriptions';
import {
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import Icon from '../shared/Icon';
import CloserRoomMessage from './CloserRoomMessage';
import NavigationStore from '../../stores/NavigationStore';
import styles from '../../styles/shared';
import pluralize from 'pluralize';
import ParticipantsChangedSubscription from '../../subscriptions/ParticipantsChangedSubscription';

var ChatViewTopBar = React.createClass({
  render: function() {
    let { room, style } = this.props;

    return (
      <View style={[{marginBottom: 5}, style]}>
        <View style={[styles.dropShadow, {height: 84, flexDirection: 'row', backgroundColor: "#FFC21F"}]}>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableHighlight onPress={this._close} style={{alignSelf: 'flex-start', borderRadius: 26}}>
              <Icon style={{fontSize: 16, margin: 18}} name={'close'}/>
            </TouchableHighlight>
          </View>
          <View style={{flex: 3, justifyContent: 'center', flexDirection: 'column'}}>
            <View style={{flex: 3, flexDirection: 'row', justifyContent: 'center'}}>
              <Text numberOfLines={1} style={[styles.baseText, styles.fonts.ADELLE[900], {
                flex: 1,
                alignSelf: 'flex-end',
                textAlign: 'center',
                fontSize: 24,
                color: '#3A3A3A',
              }]}>{'#' + room.topic.title}</Text>
            </View>
            <View style={{flex: 2, flexDirection: 'row', justifyContent: 'center'}}>
              <Text style={[styles.baseText, styles.fonts.ADELLE[400], {
                flex: 1,
                alignSelf: 'flex-start',
                textAlign: 'center',
                margin: 3,
                fontSize: 12,
              }]}>
                Room #{room.id}  |  {room.users.length} {pluralize('Herder', room.users.length)}
              </Text>
            </View>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableHighlight style={{alignSelf: 'flex-end', borderRadius: 26}} onPress={this.props.toggleMenuModal}>
              <Icon style={{fontSize: 16, margin: 18}} name={'menu'}/>
            </TouchableHighlight>
          </View>
        </View>
        { this._renderCloserRoomMessage() }
      </View>
    );
  },
  _renderCloserRoomMessage: function() {
    const { room, viewer } = this.props;
    const { membership } = room;
    const { hasCloserRoom, closerRoomSkipped } = membership;
    if (hasCloserRoom && !closerRoomSkipped) {
      return <CloserRoomMessage room={room} viewer={viewer} />
    }
  },
  _close: function() {
    NavigationStore.goTo.main();
  },
});

export default RelaySubscriptions.createContainer(ChatViewTopBar, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        ${CloserRoomMessage.getFragment('viewer')}
      }
    `,
    room: () => Relay.QL`
      fragment on Room {
        id
        ${CloserRoomMessage.getFragment('room')}
        membership {
          id
          hasCloserRoom
          closerRoomSkipped
        }
        topic {
          title
        }
        users {
          id
        }
      }
    `
  },
  subscriptions: [
    ({ room }) => new ParticipantsChangedSubscription({ roomId: room.id }),
  ],
});
