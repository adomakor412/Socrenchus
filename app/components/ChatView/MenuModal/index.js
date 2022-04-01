import React from 'react';
import Relay from 'react-relay';
import {
  TouchableHighlight,
  View,
  Alert
} from 'react-native';
import MenuButton from './MenuButton';
import NavigationStore from '../../../stores/NavigationStore';
import LeaveRoomMutation from '../../../mutations/LeaveRoomMutation';
import JoinCloserRoomMutation from '../../../mutations/JoinCloserRoomMutation';
import WebAPIUtils from '../../../utils/WebAPIUtils.js';

function MenuModal({onClose, room, viewer, relay}) {
  return (
    <TouchableHighlight onPress={onClose} style={{
      backgroundColor: 'rgba(0,0,0,0)',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <View style={{
        flexDirection: 'column',
        backgroundColor: '#000000',
        borderRadius: 50,
        width: 280
      }}>
        <View style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
          <MenuButton onPress={() => NavigationStore.goTo.participantsList(room.topic.id)} icon={'participants'}>
            Participants
          </MenuButton>
          <MenuButton onPress={() => Alert.alert('Chat settings is not yet implemented')} icon={'settings'}>
            Chat Settings
          </MenuButton>
        </View>
        <View style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
          <MenuButton onPress={ () => {
            return new Promise((resolve) => {
              Alert.alert(
                'Are you sure?',
                'You may not be able to get back in...',
                [
                  {text: "Stay", onPress: () => resolve(), style: 'cancel'},
                  {text: "Leave", onPress: () => {
                    relay.commitUpdate(
                      new LeaveRoomMutation({
                        roomId: room.id,
                        viewer: viewer
                      }), {
                        onSuccess: () => {
                          resolve(NavigationStore.goTo.main());
                        },
                        onFailure: (transaction) => {
                          var error = transaction.getError() || new Error('Mutation failed.');
                          console.error(error);
                          resolve(error);
                        }
                      })
                  }},
                ]
              )
          })}} icon={'exit'}>
            Leave Room
          </MenuButton>
          <MenuButton onPress={ () => {
            return new Promise((resolve) => {
              if (room.membership.hasCloserRoom) {
                relay.commitUpdate(
                  new JoinCloserRoomMutation({membershipId: room.membership.id, viewerId: viewer.id}), {
                    onSuccess: () => {
                      resolve(NavigationStore.goTo.chat(room.topic.id));
                    },
                    onFailure: (transaction) => {
                      var error = transaction.getError() || new Error('Mutation failed.');
                      console.error(error);
                      resolve(error);
                    }
                  }
                );
              } else {
                Alert.alert(
                  "Sorry",
                  "We couldn't find a closer room, but we'll double check for you",
                  [
                    {text: "Okay", onPress: () => {
                      navigator.geolocation.getCurrentPosition(
                        (loc) => {
                           WebAPIUtils.update_location(loc).then(resolve);
                        },
                        (error) => console.warn(JSON.stringify(error)),
                        {enableHighAccuracy: true, timeout: 60000, maximumAge: 86400000}
                      );
                    }},
                  ]
                )
                
              }
          })}} icon={'closerRoom'}>
            Join Closer Room
          </MenuButton>
        </View>
      </View>
    </TouchableHighlight>
  )
}

MenuModal.propTypes = {
  onClose: React.PropTypes.func.isRequired
}

export default Relay.createContainer(MenuModal, {
  fragments: {
    room: () => Relay.QL`
      fragment on Room {
        id
        membership {
          id
          hasCloserRoom
        }
        topic {
          id
        }
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        id
        ${LeaveRoomMutation.getFragment('viewer')}
      }
    `
  }
});
