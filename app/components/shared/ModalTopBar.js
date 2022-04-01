import React from 'react';
import {
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import Icon from '../shared/Icon';
import NavigationStore from '../../stores/NavigationStore';
import styles from '../../styles/shared';

var ModalTopBar = React.createClass({
  render: function() {
    return (
      <View style={[styles.dropShadow, {height: 84, flexDirection: 'row', marginHorizontal: -5,marginBottom: 5, backgroundColor: "rgba(255,255,255,0.25)", alignItems: 'center'}]}>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <TouchableHighlight onPress={this._close} style={{position: 'relative', alignSelf: 'center', height: 52, width: 52, borderRadius: 26}}>
            <Icon style={{fontSize: 16, margin: 18}} name={'close'}/>
          </TouchableHighlight>
        </View>
        <Text numberOfLines={1} style={[styles.baseText, styles.fonts.ADELLE[900], {
          flex: 3,
          textAlign: 'center',
          alignSelf: 'center',
          fontSize: 24,
          color: '#3A3A3A',
        }]}>{this.props.title}</Text>
        <View style={{flex: 1}}/>
      </View>
    );
  },
  _close: function() {
    NavigationStore.goBack();
  }
});

module.exports = ModalTopBar;
