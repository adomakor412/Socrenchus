import React from 'react';
import Relay from 'react-relay';
import {
  Text,
  View
} from 'react-native';
import Avatar from '../shared/Avatar';
import styles from '../../styles/shared';
import TimeAgo from '../shared/TimeAgo';

var RoomMessagePreview = React.createClass({
  render: function() {
    if (this.props.message) {
      let { text, author, createdAt } = this.props.message;
      createdAt = new Date(createdAt);

      return (
        <View style={this.props.style}>
          <View style={{flex: 1, flexDirection: 'row', padding: 10}}>
            <Text style={[styles.baseText, styles.icon, styles.fonts.ADELLE[900], {color: '#FFC107', marginTop: -10, fontSize: 60, marginRight: 10}]}>“</Text>
            <Text style={[styles.baseText, styles.fonts.ADELLE[300], {flex: 1, textAlign: 'left', fontSize: 20, color: '#3A3A3A'}]}>
            {text}
            </Text>
          </View>
          <View style={{flexDirection: 'row', margin: 5}}>
            <View style={{flex: 1}}/>
            <View style={{flexDirection: 'column', margin: 9, marginRight: 0}}>
              <Text style={[styles.baseText, styles.fonts.PT_SANS[700], {fontSize: 10, color: '#414141'}]}>
                {author.name}
              </Text>
              <TimeAgo date={createdAt} style={[styles.baseText, styles.fonts.PT_SANS[400], {fontSize: 10, color: '#8F8F8F'}]}/>
            </View>
            <Avatar author={author} size={30} style={{margin: 7, borderRadius: 15}}/>
          </View>
        </View>
      );
    } else {
      return (<View/>);
    }
  },
});

export default Relay.createContainer(RoomMessagePreview, {
  fragments: {
    message: () => Relay.QL`
      fragment on Message {
        text
        createdAt
        author {
          name
          email
          avatar_url
        }
      }
    `
  }
});
