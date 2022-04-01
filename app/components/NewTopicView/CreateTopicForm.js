import React from 'react';
import NavigationStore from '../../stores/NavigationStore';
import styles from '../../styles/shared';
import cardListStyles from '../../styles/cardListStyles';
import CreateTopicMutation from '../../mutations/CreateTopicMutation';
import Relay from 'react-relay';
import {
  Text,
  TextInput,
  TouchableHighlight,
  View
} from 'react-native';
import Icon from '../shared/Icon';

const CreateTopicForm = React.createClass({
  getInitialState: function() {
    return {
      description: ''
    };
  },
  render: function() {
    return (
      <View style={[cardListStyles.row, cardListStyles.card, {padding: 15, justifyContent: 'flex-start'}]}>
        <View style={(cardListStyles.column, {flex: 1})}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={[styles.baseText, cardListStyles.rowTitle, {alignSelf: 'flex-start', fontWeight: '700', fontSize: 18}]}>
              {'#' + this.props.searchText}
            </Text>
          </View>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
            <TextInput placeholder={'Describe your new topic'} onChange={this._descriptionChanged}  style={[styles.baseText, styles.fonts.PT_SANS[400], {
              color: '#414141',
              paddingTop: 10,
              paddingBottom: 10,
              fontSize: 14,
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              margin: 10,
              padding: 10,
              flex: 1
            }]} onChangeText={this._triggerSearch}/>
          </View>
          <View>
            <TouchableHighlight
              onPress={this._createTopic}
              style={[{
                padding: 22,
                width: 72,
                height: 72,
                borderRadius: 36,
                alignSelf: 'flex-end',
                margin: 15,
                backgroundColor: '#00BCD4',
                borderColor: 'gray',
                borderWidth: 1
              }]}
              >
              <View>
                <Icon
                  name={'newChat'}
                  style={{
                  color: '#F8F8F8',
                  fontSize: 28,
                  textAlign: 'center',
                  backgroundColor: 'transparent',
                }}/>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  },
  _descriptionChanged: function(event) {
    var description = event.nativeEvent.text;
    this.setState({description});
  },
  _createTopic: function() {
    let { description } = this.state;
    let title = this.props.searchText;
    this.props.relay.commitUpdate(
      new CreateTopicMutation({
        viewerId: this.props.viewer.id,
        title, description
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

export default Relay.createContainer(CreateTopicForm, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        id
      }
      
    `
  }
})