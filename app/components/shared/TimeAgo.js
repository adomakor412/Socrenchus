import React from 'react';
import {
  Text
} from 'react-native';
const timeago = require('time-ago')().ago;

export default function TimeAgo({date, ...props}) {
  return <Text {...props}>{(new Date() > date) ? timeago(date) : 'now'}</Text>;
}