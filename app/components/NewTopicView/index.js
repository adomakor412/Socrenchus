import React from 'react';
import {
  ListView,
  View
} from 'react-native';
import TextInput from '../shared/TextInput'
import Texture from '../shared/Texture';
import TopicListItem from '../shared/TopicListItem';
import ModalTopBar from '../shared/ModalTopBar';
import CreateTopicForm from './CreateTopicForm';
import Relay from 'react-relay';
import styles from '../../styles/shared';

var ds = new ListView.DataSource({
  rowHasChanged: function(r1, r2) {
    return (
      r1.title !== r2.title ||
      r1.description !== r2.description ||
      r1.popularity !== r2.popularity ||
      r1.distance !== r2.distance
    );
  },
});

var NewTopicView = React.createClass({
  getInitialState: function() {
    return {
      hideForm: true
    }
  },
  render: function() {
    return (
      <Texture style={[styles.container, {backgroundColor: '#FFC21F'}]} source={{uri: 'patternbg_orange'}} height={301} width={301}>
        <ListView
          style={{flex: 1, backgroundColor: 'rgba(0,0,0,0)'}}
          dataSource={ds.cloneWithRows(this.props.viewer.topics)}
          renderRow={this._renderRow}
          renderHeader={this._renderHeader}
          renderFooter={this._renderFooter}
          enableEmptySections={true}
        />
      </Texture>
    );
  },
  _renderHeader: function() {
    return (
      <View>
        <ModalTopBar title={'Join a Topic!'}/>
        <TextInput autoFocus={true} placeholder={'Search or create by title'} onChangeText={this._triggerSearch} />
    </View>
    );
  },
  _renderFooter: function() {
    var { hideForm } = this.state;

    if (!hideForm) {
      return (
        <View style={{height: 400}}>
          <CreateTopicForm style={{flex: 1}} viewer={this.props.viewer} searchText={this.props.relay.variables.searchText}/>
        </View>
      );
    }
  },

  _renderRow: function(rowData) {
    return (
      <TopicListItem topic={rowData} viewer={this.props.viewer}/>
    );
  },

  _triggerSearch: function(searchText) {
    this.setState({hideForm: true});
    if (this.delayedShow) clearTimeout(this.delayedShow);
    this.delayedShow = setTimeout(() => {
      if (searchText && searchText.length > 0) {
        let compareText = searchText.toLowerCase();
        let equal = false;
        this.props.viewer.topics.forEach(({title}) => {
          equal = (compareText == title.toLowerCase());
        });
        this.setState({hideForm: equal});
      }
    }, 1000);
    this.props.relay.setVariables({searchText});
  },
});

export default Relay.createContainer(NewTopicView, {
  initialVariables: {
    searchText: ''
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        ${TopicListItem.getFragment('viewer')}
        ${CreateTopicForm.getFragment('viewer')}
        topics(search: $searchText) {
          title
          ${TopicListItem.getFragment('topic')}
        }
      }
    `
  }
});