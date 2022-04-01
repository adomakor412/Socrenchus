import Relay from 'react-relay';
import React from 'react';
import {
  ListView,
  Text,
  TouchableHighlight,
} from 'react-native';
import Icon from '../shared/Icon';
import Texture from '../shared/Texture';
import RoomListItem from './RoomListItem';
import TopicListItem from '../shared/TopicListItem';
import SideMenu from './SideMenu';
import TopBar from './TopBar';
import styles from '../../styles/shared';
import NavigationStore from '../../stores/NavigationStore';
import Drawer from 'react-native-drawer';

var ds = new ListView.DataSource({
  rowHasChanged: function(r1, r2) {
    return true;
  },
  sectionHeaderHasChanged: function(s1, s2) {
    return false;
  }
});

class MainView extends React.Component {
  constructor() {
    super();
    this._renderRow = this._renderRow.bind(this);
    this._renderSectionHeader = this._renderSectionHeader.bind(this);
  }
  
  render() {
    return (<Drawer
      type="static"
      ref={(ref) => this._drawer = ref}
      tapToClose={true}
      content={<SideMenu viewer={this.props.viewer}/>}
      openDrawerOffset={100}
      tweenHandler={Drawer.tweenPresets.parallax}
      >
        { this._renderMain() }
    </Drawer>);
  }
  
  _renderMain() {
    const datasource = ds.cloneWithRowsAndSections({
      "MY ROOMS": this.props.viewer.rooms,
      "EXPLORE TOPICS": this.props.viewer.topics
    });
    
    return (
      <Texture style={[styles.container, {backgroundColor: '#FFC21F', elevation: 0}]} source={{uri: 'patternbg_orange'}} height={301} width={301}>
        <ListView
          style={{flex: 12, backgroundColor: 'rgba(0,0,0,0)'}}
          dataSource={datasource}
          renderRow={this._renderRow}
          renderSectionHeader={this._renderSectionHeader}
          enableEmptySections={true}
          renderHeader={() => <TopBar openDrawer={() => this._drawer.open()} key={0}/>}
        />
        <TouchableHighlight
          onPress={this._createTopic}
          style={[styles.dropShadow, {
            elevation: 6,
            padding: 22,
            width: 72,
            height: 72,
            borderRadius: 36,
            alignSelf: 'flex-end',
            margin: 15,
            marginTop: -87,
            backgroundColor: '#00BCD4',
          }]}
          >
          <Icon
            name={'newChat'}
            style={{
              left: 1,
              color: '#F8F8F8',
              fontSize: 28,
              textAlign: 'center',
              backgroundColor: 'transparent',
          }}/>
      </TouchableHighlight>
    </Texture>
    );
  }
  
  _renderSectionHeader(sectionData, sectionID) {
    return (
      <Text style={[styles.baseText, {
        backgroundColor: 'rgba(0,0,0,0)',
        color: 'rgba(58, 58, 58, 0.8)',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '300',
        padding: 5,
        elevation: 1,
        shadowOffset: { height: 6, width: 0 },
        shadowOpacity: 0.1}]}>
          {sectionID}
      </Text>
    );
  }
  _renderRow(rowData, sectionID, rowID) {
    if (rowData.topic !== undefined) {
      return (
        <RoomListItem room={rowData} viewer={this.props.viewer}/>
      );
    } else {
      return (
        <TopicListItem topic={rowData} viewer={this.props.viewer}/>
      );
    }
  }
  _createTopic() {
    NavigationStore.goTo.newTopic();
  }
}

export default Relay.createContainer(MainView, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        ${RoomListItem.getFragment('viewer')}
        ${TopicListItem.getFragment('viewer')}
        ${SideMenu.getFragment('viewer')}
        id
        rooms {
          ${RoomListItem.getFragment('room')}
          membership {
            unreadCount
          }
          id
          users {
            name
          }
          topic {
            id
            title
          }
        }
        topics {
          ${TopicListItem.getFragment('topic')}
          id
          title
          description
          popularity
        }
    }`
  }
});