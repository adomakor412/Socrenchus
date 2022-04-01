import React from 'react';
import {
  Image
} from 'react-native';
import md5 from 'md5';

var Avatar = React.createClass({
  render: function() {
    let {author, style, size, ...props} = this.props;
    let {avatar_url, email} = author;

    if (!avatar_url || avatar_url == '') {
      avatar_url = `http://www.gravatar.com/avatar/${md5(email)}.jpg?s=${size}&d=retro`
    }

    return (
      <Image {...props} style={[{height: size, width: size}, style]} source={{uri:avatar_url}}/>
    );
  }
});

module.exports = Avatar;
