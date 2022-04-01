import React from 'react';
import Relay from 'react-relay';
import {
  Alert,
  Text,
  TouchableHighlight,
  View,
  Switch
} from 'react-native';
import styles from '../../styles/shared';
import Avatar from '../shared/Avatar';
import NavigationStore from '../../stores/NavigationStore';
import UserSettingsMutation from '../../mutations/UserSettingsMutation';
import {FBLoginManager} from 'react-native-facebook-login';
import Texture from '../shared/Texture';

function SideMenu({viewer, relay}) {
  
  return (
    <Texture style={[styles.container, {backgroundColor: '#4DA7B2', elevation: 1}]} source={{uri: 'patternbg_blue'}} height={297} width={299}>
    <View style={{flexDirection: 'row', alignItems: 'center',}}>
      <Avatar size={60} style={{borderRadius: 30, margin: 20}} author={viewer}/>
      <Text style={[styles.fonts.PT_SANS[700], {fontSize: 20}]}>{viewer.name}</Text>
    </View>
    <View style={{flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 10, padding: 20}}>
      <View style={{flexDirection: 'row', marginBottom: 10}}>
        <Switch value={viewer.notifications_enabled} onValueChange={(value) => {
          relay.commitUpdate(
            new UserSettingsMutation({
              viewer,
              notifications_enabled: value
            }), {
              onFailure: (transaction) => {
                var error = transaction.getError() || new Error('Mutation failed.');
                console.error(error);
              }
            }
          );
        }}/>
        <Text style={[styles.fonts.ADELLE[600], {fontSize: 20, marginLeft: 20}]}>Notifications</Text>
      </View>
    </View>
    <View style={{flexDirection: 'row'}}>
      <TouchableHighlight style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#82c1c9',
        margin: 10,
      }} onPress={() => {
        Alert.alert(
          'Are you sure?',
          'Come back soon...',
          [
            {text: "Stay", onPress: () => {}, style: 'cancel'},
            {text: "Leave", onPress: () => {
              FBLoginManager.logout(function(error, data){
                NavigationStore.goTo.login()
              });
            }},
          ]
        )
      }}><Text style={[styles.fonts.PT_SANS[400], {fontSize: 20, margin: 20}]}>Logout</Text></TouchableHighlight>
    </View>
    </Texture>
  );
}

export default Relay.createContainer(SideMenu, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        id
        name
        email
        avatar_url
        notifications_enabled
        ${UserSettingsMutation.getFragment('viewer')}
      }
    `
  }
})