import React from 'react';
import {
  Text,
  View,
  Image,
  TouchableHighlight
} from 'react-native';
import { FBLogin, FBLoginManager } from 'react-native-facebook-login';
import Icon from './shared/Icon'
import NavigationStore from '../stores/NavigationStore';
import WebAPIUtils from '../utils/WebAPIUtils.js';
import styles from '../styles/shared.js';
import FCM from 'react-native-fcm';

navigator.geolocation.getCurrentPosition(
  (loc) => { WebAPIUtils.update_location(loc); },
  (error) => console.warn(JSON.stringify(error)),
  {enableHighAccuracy: true, timeout: 60000, maximumAge: 86400000}
);

var LoginView = React.createClass({
  getInitialState: function() {
    return { error: undefined };
  },
  render: function() {
    var _this = this;
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#dbb030'}}>
        <View style={{height: 100}}>
          <Image style={{height: 52, width: 62, alignSelf: 'center'}} source={{uri: 'logo'}}/>
        </View>
        <View style={{alignItems: 'stretch'}}>
          <FBLogin style={{ marginBottom: 10, }}
            permissions={["email","user_friends"]}
            loginBehavior={FBLoginManager.LoginBehaviors.Native}
            onLogin={this._loginWithFacebook}
            onLogout={this._loginWithFacebook}
            onLoginFound={this._loginWithFacebook}
            onLoginNotFound={this._loginWithFacebook}
            onError={function(data){
              _this.setState({error: "An unexpected error occured"});
            }}
            onCancel={function(){
              _this.setState({error: "Looks like you canceled the login."});
            }}
            onPermissionsMissing={function(data){
              _this.setState({error: "Seems like we don't have enough permissions"});
            }}
          />
          <TouchableHighlight
            style={{backgroundColor: 'black', padding: 10, marginBottom: 10}}
            onPress={this._tryWithoutLogin}
            >
            <Text style={{
              color: 'white',
              textAlign: 'center' }}>Try without Login</Text>
          </TouchableHighlight>
        </View>
        <Text style={[styles.text, {color: 'black', backgroundColor: 'red'}]}>{this.state.error}</Text>
      </View>
    );
  },
  _loginWithFacebook: function({credentials}) {
    if (!credentials) return;
    credentials.access_token = credentials.token;
    delete credentials["token"];
    
    FCM.requestPermissions(); // for iOS
    FCM.getFCMToken().then(fcm_token => {
      WebAPIUtils.authenticate(credentials, fcm_token).then(function(credentials) {
        NavigationStore.goTo.main();
      }).catch((error) => {
        this.setState({error: error.message || 'Unknown error'});
      });
    });
  },
  _tryWithoutLogin: function() {
    FCM.requestPermissions(); // for iOS
    FCM.getFCMToken().then(fcm_token => {
      WebAPIUtils.try_without_login(fcm_token).then(function() {
        NavigationStore.goTo.main();
      }).catch((error) => {
        this.setState({error: error.message || 'Unknown error'});
      });
    });
  }
});

module.exports = LoginView;
