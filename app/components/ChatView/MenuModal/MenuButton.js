import React from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Text,
  ActivityIndicator
} from 'react-native';
import Icon from '../../shared/Icon';

var MenuButton = React.createClass({
  getInitialState: () => ({
    loading: false
  }),
  render: function() {
    let {children, icon, onPress} = this.props;
    return (
      <TouchableWithoutFeedback onPress={(...args) => {
        if (!this.state.loading) {
          this.setState({loading: true});
          return Promise.resolve(onPress(...args)).then(() => {
            this.setState({loading: false});
          });
        }
      }} style={{margin: 10, flex: 1}}>
        <View style={{alignItems: 'center', margin: 10}}>
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 1,
            borderColor: '#F8F8F8',
            borderStyle: 'solid',
            justifyContent: 'center'
          }}>
          { (this.state.loading) ? <ActivityIndicator/> : <Icon
            name={icon}
            style={{
              left: 1,
              color: '#F8F8F8',
              fontSize: 42,
              textAlign: 'center',
              backgroundColor: 'transparent',
            }}/> }
        </View>
        <Text style={{color: '#F8F8F8', marginTop: 10}}>
          {children}
        </Text>
      </View>
      </TouchableWithoutFeedback>
    )
  }
});

module.exports = MenuButton;
