import React from 'react';
import {
  ActivityIndicator,
  Text
} from 'react-native';
import styles from '../../styles/shared.js';
import TimeAgo from '../shared/TimeAgo';

export default function MessageTimestamp({createdAt}) {
  if (createdAt) {
    return <TimeAgo date={new Date(createdAt)} style={[styles.baseText, styles.fonts.PT_SANS[400], {fontSize: 16, color: '#8F8F8F', marginLeft: 10}]}/>;
  } else {
    return <ActivityIndicator style={{marginLeft: 10}}/>;
  }
}
