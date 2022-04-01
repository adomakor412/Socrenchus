import {
  BackAndroid
} from 'react-native';

class NavigationStore {
  inject (router, {LoginView, MainView, NewTopicView, ChatView, ParticipantsList}) {
    this._router = router;
    this.routeStack = [];
    this.defaultRoute = { Component: LoginView };
    this.goTo = {
      login: this.setCurrentRoute(() => {
        return this.defaultRoute
      }, {clear: true}),
      newTopic: this.setCurrentRoute(() => {return {
        Component: NewTopicView,
        useRelay: true,
      }}),
      main: this.setCurrentRoute(() => {
        return {
          Component: MainView,
          useRelay: true,
      }}, {clear: true}),
      chat: this.setCurrentRoute((topicId) => {return {
        Component: ChatView,
        useRelay: true,
        passProps: {
          topicId
        }
      }}),
      participantsList: this.setCurrentRoute((topicId) => ({
        Component: ParticipantsList,
        useRelay: true,
        passProps: {topicId}
      }))
    }
  }

  setCurrentRoute (routeGenerator, options = {}) {
    return ((...args) => {
      const currentRoute = routeGenerator(...args);
      setTimeout(() => this._router.setState({currentRoute}), 0);
      if (options.clear) {
        this.routeStack = [];
      } else {
        this.routeStack.push(this._router.state.currentRoute);
      }
    })
  }
  
  goBack() {
    const currentRoute = this.routeStack.pop();
    if (currentRoute) this._router.setState({currentRoute});
  }
}

const navStore = new NavigationStore();

BackAndroid.addEventListener('hardwareBackPress', function() {
  navStore.goBack();
  return true;
});

module.exports = navStore;
