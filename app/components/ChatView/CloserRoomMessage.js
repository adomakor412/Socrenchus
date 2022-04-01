import React from 'react';
import Relay from 'react-relay';
import {
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import NavigationStore from '../../stores/NavigationStore';
import styles from '../../styles/shared';
import JoinCloserRoomMutation from '../../mutations/JoinCloserRoomMutation';
import SkipCloserRoomMutation from '../../mutations/SkipCloserRoomMutation';
import Texture from '../shared/Texture';

var CloserRoomMessage = React.createClass({
  render: function() {
    return (
      <Texture style={[styles.container, {elevation: 6, backgroundColor: '#00BCD4', padding: 10, alignItems: 'center'}]} source={{uri: 'patternbg_blue'}} height={297} width={299}>
        <Text style={[styles.baseText, styles.fonts.PT_SANS[700], customStyles.messageHeading]}>
          Hey! Heads up!
        </Text>
        <Text style={customStyles.messageDescription}>
          A room closer to you just opened up.
        </Text>
        <Text style={customStyles.messageDescription}>
          You can keep chatting here or meet
        </Text>
        <Text style={customStyles.messageDescription}>
         some of the locals.
        </Text>
        <View style={{flex: 1, margin: 10, alignItems: 'stretch'}}>
          <TouchableHighlight onPress={this._joinCloserRoom} style={{
            elevation: 8,
            borderRadius: 3,
            backgroundColor: '#FFF',
            padding: 10,
            paddingHorizontal: 30,
            margin: 10,
          }}>
            <Text style={[styles.baseText, styles.fonts.PT_SANS[700], {
              fontSize: 24,
              flex: 1,
              textAlign: 'center',
              backgroundColor: '#FFF',
              color: '#00BCD4'
            }]}>Join Closer Room</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this._skipCloserRoom} style={{
            borderRadius: 3,
            backgroundColor: 'rgba(0,0,0,0)',
            borderColor: '#FFF',
            borderWidth: 1,
            padding: 10,
            paddingHorizontal: 30,
            margin: 10,
          }}>
            <Text style={[styles.baseText, styles.fonts.PT_SANS[700], {
              fontSize: 24,
              flex: 1,
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0)',
              color: '#FFF',
            }]}>No thanks, i'll stay here</Text>
          </TouchableHighlight>
        </View>
      </Texture>
    );
  },

  _joinCloserRoom: function() {
    this.props.relay.commitUpdate(
      new JoinCloserRoomMutation({membershipId: this.props.room.membership.id, viewerId: this.props.viewer.id}), {
        onSuccess: () => {
          NavigationStore.goTo.chat(this.props.room.topic.id)
        },
        onFailure: (transaction) => {
          var error = transaction.getError() || new Error('Mutation failed.');
          console.error(error);
        }
      }
    );
  },
  _skipCloserRoom: function() {
    this.props.relay.commitUpdate(
      new SkipCloserRoomMutation({membershipId: this.props.room.membership.id, viewerId: this.props.viewer.id}), {
        onSuccess: () => { },
        onFailure: (transaction) => {
          var error = transaction.getError() || new Error('Mutation failed.');
          console.error(error);
        }
      }
    );
  }
});

const customStyles = {
  messageHeading: {
    color: '#FFF',
    fontSize: 25,
    margin: 20
  },
  messageDescription: [
    styles.baseText,
    styles.fonts.PT_SANS[400],
    {
      color: '#FFF',
      fontSize: 18,
      margin: 3
    }
  ]
};

export default Relay.createContainer(CloserRoomMessage, {
  fragments: {
    room: () => Relay.QL`
      fragment on Room {
        membership {
          id
        }
        topic {
          id
        }
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        id
      }
    `
  }
})