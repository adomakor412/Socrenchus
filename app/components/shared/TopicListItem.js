import React from 'react';
import {
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import Relay from 'react-relay';
import NavigationStore from '../../stores/NavigationStore.js';
import WebAPIUtils from '../../utils/WebAPIUtils.js';
import styles from '../../styles/shared';
import cardListStyles from '../../styles/cardListStyles';
import JoinTopicMutation from '../../mutations/JoinTopicMutation'

const TopicListItem = React.createClass({
  render: function() {
    var topic = this.props.topic;
    return (
      <TouchableHighlight onPress={() => this._press()}>
        <View>
          <View style={[cardListStyles.row, cardListStyles.card, {padding: 15, justifyContent: 'flex-start'}]}>
            <View style={cardListStyles.column}>
              <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={[styles.baseText, cardListStyles.rowTitle, {alignSelf: 'flex-start', fontWeight: '700', fontSize: 18}]}>
                  {'#' + topic.title}
                </Text>
              </View>
              <Text style={[styles.baseText, styles.fonts.PT_SANS[400], {color: '#414141', paddingTop: 10, paddingBottom: 10, fontSize: 14}]}>
                {topic.description}
              </Text>
              <Text style={[styles.baseText, styles.fonts.ADELLE[400], {fontSize: 12, color: '#3A3A3A'}]}>
                <Text style={{fontWeight: '900'}}>
                  {topic.popularity}
                </Text> Active Herders
              </Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  },
  _press: function() {
    this.props.relay.commitUpdate(
      new JoinTopicMutation({topicId: this.props.topic.id, viewerId: this.props.viewer.id}), {
        onSuccess: () => {
          NavigationStore.goTo.chat(this.props.topic.id)
        },
        onFailure: (transaction) => {
          var error = transaction.getError() || new Error('Mutation failed.');
          console.error(error);
        }
      }
    );
  },
});

export default Relay.createContainer(TopicListItem, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        id
      }
    `,
    topic: () => Relay.QL`
      fragment on Topic {
        id
        title
        description
        popularity
      }
    `
  }
});