import React from 'react';
import {
  View,
  Platform
} from 'react-native';
import KeyboardSpacer from 'react-native-keyboard-spacer'

export default function({platform}) {
  if (platform) {
    if (platform == Platform.OS) {
      return <KeyboardSpacer/>;
    } else {
      return <View/>;
    }
  } else {
    return <KeyboardSpacer/>;
  }
  
}