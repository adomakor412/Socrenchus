import React from 'react';
import clamp from 'clamp';

import {
  View,
  Animated,
  PanResponder,
} from 'react-native';


var SWIPE_THRESHOLD = 120;

var Flix = React.createClass({
  getInitialState: function() {
    return {
      pan: new Animated.ValueXY(),
    };
  },

  _sendAction: function() {
    let { onFlick } = this.props;
    if (onFlick) onFlick();
  },

  componentWillMount: function() {
    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: (e, {vx, vy}) => vx > vy,
      onMoveShouldSetPanResponderCapture: (e, {vx, vy}) => vx > vy,

      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value});
        this.state.pan.setValue({x: 0, y: 0});
      },

      onPanResponderMove: Animated.event([
        null, {dx: this.state.pan.x, dy: this.state.pan.y},
      ]),

      onPanResponderRelease: (e, {vx, vy}) => {
        this.state.pan.flattenOffset();
        var velocity;

        if (vx > 0) {
          velocity = clamp(vx, 3, 5);

          if (Math.abs(this.state.pan.x._value) > SWIPE_THRESHOLD) {
            Animated.spring(this.state.pan, {
              toValue: {x: 500, y: 0},
              friction: 9
            }).start(this._resetState)
          } else {
            Animated.spring(this.state.pan, {
              toValue: {x: 0, y: 0},
              friction: 4
            }).start()
          }
        } else {
          Animated.spring(this.state.pan, {
            toValue: {x: 0, y: 0},
            friction: 4
          }).start()
        }

      },

      onPanResponderTerminate: (evt, gestureState) => {
        Animated.spring(this.state.pan, {
          toValue: {x: 0, y: 0},
          friction: 4
        }).start()
      },
    })
  },

  _resetState: function() {
    this.state.pan.setValue({x: 0, y: 0});
    this._sendAction();
  },

  render: function() {
    let { pan } = this.state;

    let [translateX, translateY] = [pan.x, pan.y];

    let opacity = pan.x.interpolate({inputRange: [0, 200], outputRange: [1, 0.5]})

    let animatedCardStyles = {
      transform: [
        {translateX},
      ], opacity};

    return (
      <View style={this.props.style}>
        <Animated.View style={animatedCardStyles} {...this._panResponder.panHandlers}>
          {this.props.children}
        </Animated.View>
      </View>
    );
  }
});

module.exports = Flix;
