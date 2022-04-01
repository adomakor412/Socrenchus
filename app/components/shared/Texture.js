import React from 'react';
import {
  Image,
  View,
} from 'react-native';

var Texture = React.createClass({
  _onLayout: function(event) {
    let tileWidth = this.props.width;
    let tileHeight = this.props.height;
    let {width, height} = event.nativeEvent.layout;
    let tilesWide = Math.ceil(width / tileWidth);
    let tilesHigh = Math.ceil(height / tileHeight);
    if (this.state.tilesWide != tilesWide ||
        this.state.tilesHigh !=tilesHigh) {
      this.setState({tilesWide, tilesHigh});
    }
  },
  getInitialState: function() {
    return {
      tilesWide: 2,
      tilesHigh: 2
    };
  },
  render: function() {
    let { style, children} = this.props;
    return (
      <View onLayout={this._onLayout} style={style}>
        <View style={{position: 'absolute', top: 0, left: 0, flexWrap: 'nowrap', flexDirection: 'column'}}>
          {(Array.apply(null, Array(this.state.tilesHigh))).map(this._renderRow)}
        </View>
        {children}
      </View>
    );
  },
  _renderRow() {
    return (
      <View key={arguments[1]} style={{flexWrap: 'nowrap', flexDirection: 'row'}}>
        {(Array.apply(null, Array(this.state.tilesWide))).map(this._renderColumn)}
      </View>
    )
  },
  _renderColumn() {
    let {width, height, source} = this.props;
    return (<Image key={arguments[1]} source={source} style={{width, height}}/>);
  }
});

module.exports = Texture;
