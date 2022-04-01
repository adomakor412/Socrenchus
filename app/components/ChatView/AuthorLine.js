import React from 'react';
import Relay from 'react-relay';
import Avatar from '../shared/Avatar';
import {
  Text,
  View
} from 'react-native';
import styles from '../../styles/shared.js';
import MessageTimestamp from './MessageTimestamp';

function AuthorLine({message, children, style}) {
  return <View style={style}>
      <Avatar author={message.author} size={30} style={{margin: 10, marginLeft: 5, borderRadius: 15}}/>
      <View style={{flex: 1, flexDirection: 'column', margin: 2, marginTop: 15}}>
        <View style={{flexDirection: 'row', marginBottom: 10}}>
          <Text style={[styles.baseText, styles.fonts.PT_SANS[700], {fontSize: 16, color: '#414141'}]}>
            {message.author.name}
          </Text>
          <MessageTimestamp createdAt={message.createdAt}/>
        </View>
        {children}
      </View>
    </View>
}

export default Relay.createContainer(AuthorLine, {
  fragments: {
    message: () => Relay.QL`
      fragment on Message {
        id
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