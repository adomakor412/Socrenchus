import React from 'react';
import {
  TextInput as RNTextInput,
  View
} from 'react-native';
import styles from '../../styles/shared';

export default function TextInput({style, wrapperProps, wrapperStyle, ...rest}) {
  const wrapperStyles = [{
    height: 40,
    backgroundColor: '#FFFFFF',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    margin: 11,
    padding: 0
  }, wrapperStyle];
  return <View {...wrapperProps} style={wrapperStyles}>
    <RNTextInput {...rest} style={[styles.baseText, {
        flex: 1,
        padding: 10
      }, style]}
      underlineColorAndroid={'#FFFFFF'}
      placeholderTextColor={'#D3D3D3'}
      />
  </View>
}