import React from 'react';
import NavigationStore from '../stores/NavigationStore';
import LoginView from './LoginView';
import MainView from './MainView';
import ChatView from './ChatView';
import ParticipantsList from './ParticipantsList';
import NewTopicView from './NewTopicView';
import RelayRenderer from './RelayRenderer';
import WebAPIUtils from '../utils/WebAPIUtils';

var Router = React.createClass({
  componentWillMount: function() {
    WebAPIUtils.setServerUrl(process.env.API_HOST);
  },
  getInitialState: function() {
    NavigationStore.inject(this, {
      LoginView,
      MainView,
      NewTopicView,
      ChatView,
      ParticipantsList
    });
    return {
      currentRoute: NavigationStore.defaultRoute
    }
  },
  render: function() {
    let { Component, passProps, useRelay } = this.state.currentRoute;
    if (useRelay) {
      return RelayRenderer({Component, variables: passProps});
    } else {
      return (<Component {...passProps}/>);
    }
  },
});

module.exports = Router;
