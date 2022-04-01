import React from 'react';
import Relay from 'react-relay';
import RelaySubscriptions from 'relay-subscriptions';
import {
  ListView,
  View,
  ActivityIndicator
} from 'react-native';
import TextInput from '../shared/TextInput';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import KeyboardSpacer from '../shared/KeyboardSpacer';
import ChatMessageItem from './ChatMessageItem';
import ChatViewTopBar from './ChatViewTopBar';
import MenuModal from './MenuModal';
import styles from '../../styles/shared.js';
import CreateMessageMutation from '../../mutations/CreateMessageMutation';
import CreateMessageSubscription from '../../subscriptions/CreateMessageSubscription';

var ds = new ListView.DataSource({
  rowHasChanged: function(r1, r2) {
    return (
      r1.room !== r2.room ||
      r1.author.id !== r2.author.id ||
      r1.text !== r2.text
    );
  }
});


var ChatView = React.createClass({
  getInitialState: function() {
    return {
      input: '',
      menuModalVisible: false
    };
  },
  render: function() {
    let { viewer, relay } = this.props;
    const room = this._currentRoom();
    if (room === undefined) return <View/>;
    const {all: messagePairs, pair: remainder} = room.message_connection.edges.reduce(({all, pair}, current) => {
      switch (pair.length) {
        case 0:
          pair.push(current.node);
          return {all, pair};
        default:
          pair.push(current.node);
          all.push(pair);
          return {all, pair: [current.node]};
      }
    }, {all: [], pair: []});
    if (remainder.length > 0) {
      remainder.push(null);
      messagePairs.push(remainder);
    }
    return (
      <View style={[styles.container, {backgroundColor: '#FFFFFF'}]}>
        <ChatViewTopBar room={room} viewer={viewer} toggleMenuModal={this._toggleMenuModal}/>
        <ListView
          renderScrollComponent={props => <InvertibleScrollView {...props} inverted />}
          style={{flex: 1, padding: 10, backgroundColor: '#FFFFFF'}}
          dataSource={ds.cloneWithRows(messagePairs)}
          renderRow={this._renderRow}
          onScroll={this._closeKeyboard}
          keyboardDismissMode={'on-drag'}
          enableEmptySections={true}
          renderFooter={() => (room.message_connection.pageInfo.hasNextPage) ? <ActivityIndicator/> : null}
          onEndReached={() => {
            if (room.message_connection.pageInfo.hasNextPage) {
              relay.setVariables({first: relay.variables.first + 50})
            }
          }}
        />
        
        <View style={[styles.dropShadow, {backgroundColor: "#F8F8F8"}]}>
          <TextInput
            blurOnSubmit={false}
            returnKeyType={'send'}
            onChangeText={(input) => this.setState({input})}
            onSubmitEditing={this._sendMessage}
            placeholder={'Type Something...'}
            value={this.state.input}
          />
        </View>
        
        {this._renderMenuModal()}
        <KeyboardSpacer platform={'ios'}/>
      </View>
    );
  },
  _renderRow: function(rowData, sectionID, rowID) {
    const [message, lastMessage] = rowData;
    return ( <ChatMessageItem message={message} lastMessage={lastMessage}/> );
  },
  _renderMenuModal: function() {
    if (this.state.menuModalVisible) {
      return ( <MenuModal viewer={this.props.viewer} room={this._currentRoom()} onClose={this._toggleMenuModal} /> );
    }
  },
  _toggleMenuModal: function() {
    let {menuModalVisible} = this.state;
    menuModalVisible = !menuModalVisible;
    this.setState({menuModalVisible});
  },
  _sendMessage: function() {
    let { viewer } = this.props;
    const room = this._currentRoom();
    const text = this.state.input;
    if (text == '') return;
    this.props.relay.commitUpdate(
      new CreateMessageMutation({
        room,
        viewer,
        text
      }), {
        onFailure: (transaction) => {
          var error = transaction.getError() || new Error('Mutation failed.');
          console.error(error);
        }
      }
    );
    this.setState({input: ''});
  },
  _currentRoom: function() {
    return currentRoom({relay: this.props.relay, viewer: this.props.viewer});
  },
  _onChange: function() {
    this.props.relay.forceFetch();
  },
});

function currentRoom({viewer, relay}) {
  const variables = Object.assign({}, relay.variables, relay.pendingVariables);
  return viewer.rooms.find((r) => variables.topicId == r.topic.id);
}

export default RelaySubscriptions.createContainer(ChatView, {
  initialVariables: {
    topicId: null,
    first: 50
  },
  fragments: {
    viewer: ({topicId, first}) => Relay.QL`
      fragment on User {
        id
        ${CreateMessageMutation.getFragment('viewer')}
        ${ChatViewTopBar.getFragment('viewer')}
        ${MenuModal.getFragment('viewer')}
        rooms(topicId: $topicId) {
          ${ChatViewTopBar.getFragment('room')}
          ${CreateMessageMutation.getFragment('room')}
          ${MenuModal.getFragment('room')}
          id
          topic {
            id
            title
          }
          users {
            name
          }
          message_connection(first: $first) {
            edges {
              node {
                ${ChatMessageItem.getFragment('message')}
                ${ChatMessageItem.getFragment('lastMessage')}
              }
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      }
   ` 
  },
  subscriptions: [
    ({ viewer, relay }) => {
      const room = currentRoom({viewer, relay});
      if (!relay.hasOptimisticUpdate(room)) {
        return new CreateMessageSubscription({ roomId: room.id})
      }
    },
  ],
});