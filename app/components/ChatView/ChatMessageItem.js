import React from 'react';
import Relay from 'react-relay';
import {
  ActivityIndicator,
  Text,
  View
} from 'react-native';
import AuthorLine from './AuthorLine';
import styles from '../../styles/shared.js';


function MessageText({text}) {
  return <Text style={[styles.fonts.PT_SANS[400], {
    flex: 1,
    fontSize: 14,
    color: '#616161',
    minHeight: 20
  }]}>{text}</Text>
}

function ChatMessageItem({message, lastMessage}) {
  const hideAuthor = lastMessage && lastMessage.author.id && lastMessage.author.id == message.author.id;
  const messageWrapperStyle = {flexDirection: 'row', margin: 5};
  return (
    <View>
    { (!hideAuthor) ? <AuthorLine message={message} style={messageWrapperStyle}>
        <MessageText text={message.text}/>
      </AuthorLine> : <View style={[messageWrapperStyle, {marginLeft: 51}]}>
        <MessageText text={message.text}/>
        { (message.createdAt) ? <View/> : <ActivityIndicator/> }
      </View>}
    </View>
  );
}

export default Relay.createContainer(ChatMessageItem, {
  fragments: {
    message: () => Relay.QL`
      fragment on Message {
        id
        ${AuthorLine.getFragment('message')}
        text
        createdAt
        author {
          id
          name
        }
      }
    `,
    lastMessage: () => Relay.QL`
      fragment on Message {
        id
        author {
          id
          name
        }
      }
    `
  }
});
