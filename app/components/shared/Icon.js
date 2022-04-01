import React from 'react';
import {
  Text,
} from 'react-native';
import styles from '../../styles/shared.js';

const ICON_MAP = {
  close: {
    fontFamily: '02-status-n',
    value: ''
  },
  closerRoom: {
    fontFamily: '52-locations-n',
    value: ''
  },
  exit: {
    fontFamily: '04-login-n',
    value: ''
  },
  participants: {
    fontFamily: '07-users-n',
    value: ''
  },
  search: {
    fontFamily: '01-content-edition-n',
    value: ''
  },
  settings: {
    fontFamily: '03-settings-n',
    value: ''
  },
  newChat: {
    fontFamily: '10-messages-chat-n',
    value: ''
  },
  menu: {
    fontFamily: '17-navigation-n',
    value: ''
  },
  hamburger: {
    fontFamily: '17-navigation-n',
    value: ''
  },
  ghost: {
    fontFamily: '78-video-games-n',
    value: ''
  }
};

var Icon = React.createClass({
  setNativeProps: function(props) {
    this.refs['icon'].setNativeProps(props);
  },
  render: function() {
    let {name, style, ...props} = this.props;
    let {value, fontFamily} = ICON_MAP[name];

    return (
      <Text ref='icon' {...props} style={[styles.baseText, styles.icon, {fontFamily}, style]}>{value}</Text>
    );
  }
});

module.exports = Icon;
