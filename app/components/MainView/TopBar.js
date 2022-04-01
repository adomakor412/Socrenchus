import React from 'react';
import {
  Image,
  TouchableHighlight,
  View,
} from 'react-native';
import Icon from '../shared/Icon.js';
import NavigationStore from '../../stores/NavigationStore';

var TopBar = React.createClass({
  render: function() {
    return (
      <View style={[this.props.style, {height: 65, flexDirection: 'row'}]}>
        <TouchableHighlight
          onPress={this.props.openDrawer}
          underlayColor={'white'}
          activeOpacity={1}
          style={{
            alignSelf: 'stretch',
            flex: 1,
            justifyContent: 'center',
            borderRadius: 5,
          }}
        >
          <Icon
            name={'hamburger'}
            style={{
              alignSelf: 'flex-start',
              margin: 24,
              height: 24,
              width: 24,
              fontSize: 24,
            }}
          />
        </TouchableHighlight>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Image style={{height: 52, width: 62, alignSelf: 'center'}} source={{uri: 'logo'}}/>
        </View>
        <TouchableHighlight
          onPress={this._openTopicSearch}
          underlayColor={'white'}
          activeOpacity={1}
          style={{
            alignSelf: 'stretch',
            flex: 1,
            justifyContent: 'center',
            borderRadius: 5,
            marginRight: 12,
          }}
        >
          <Icon
            name={'search'}
            style={{
              alignSelf: 'flex-end',
              margin: 24,
              marginRight: 12,
              height: 24,
              width: 24,
              fontSize: 24,
            }}
          />
        </TouchableHighlight>
      </View>
    );
  },
  _openTopicSearch: function() {
    NavigationStore.goTo.newTopic();
  },
});

module.exports = TopBar;
