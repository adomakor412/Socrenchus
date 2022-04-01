import React from 'react';
import Relay from 'react-relay';
import RelaySubscriptions from 'relay-subscriptions';
import {
  ListView,
  Text,
  View
} from 'react-native';
import Texture from '../shared/Texture';
import Avatar from '../shared/Avatar';
import ModalTopBar from '../shared/ModalTopBar';
import styles from '../../styles/shared';
import ParticipantsChangedSubscription from '../../subscriptions/ParticipantsChangedSubscription';

var ds = new ListView.DataSource({
  rowHasChanged: function(r1, r2) {
    return Object.keys(r1).reduce((changed, key) => changed || r1[key] != r2[key]);
  },
});

function ParticipantsList({viewer, relay}) {
  const room = currentRoom({viewer, relay});
  return <Texture style={[styles.container, {backgroundColor: '#FFC21F'}]} source={{uri: 'patternbg_orange'}} height={301} width={301}>
    <ModalTopBar title={`${room.users.length} Participants`}/>
    <ListView
      style={{flex: 1, backgroundColor: 'rgba(0,0,0,0)'}}
      dataSource={ds.cloneWithRows(room.users)}
      renderRow={(user) => (<View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Avatar author={user} size={60} style={{margin: 10, borderRadius: 30}}/>
        <Text style={[styles.baseText, styles.fonts.PT_SANS[700], {fontSize: 20, color: '#414141'}]}>
          {user.name}
        </Text>
      </View>)}
    />
  </Texture>
}

function currentRoom({viewer, relay}) {
  const variables = Object.assign({}, relay.variables, relay.pendingVariables);
  return viewer.rooms.find((r) => variables.topicId == r.topic.id);
}

export default RelaySubscriptions.createContainer(ParticipantsList, {
  initialVariables: {
    topicId: null
  },
  fragments: {
    viewer: ({topicId}) => Relay.QL`
      fragment on User {
        rooms(topicId: $topicId) {
          id
          topic {
            id
          }
          users {
            id
            email
            avatar_url
            name
          }
        }
      }
    `
  },
  subscriptions: [
    ({ viewer, relay }) => new ParticipantsChangedSubscription({ roomId: currentRoom({relay, viewer}).id })
  ]
});