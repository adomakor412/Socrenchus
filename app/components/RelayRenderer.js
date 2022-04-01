import React from 'react';
import Relay from 'react-relay';
import RelaySubscriptions from 'relay-subscriptions';
import {
  retryMiddleware,
  urlMiddleware,
  authMiddleware 
} from 'react-relay-network-layer';
import WebAPIUtils from '../utils/WebAPIUtils';
import SubscriptionNetworkLayer from '../utils/SubscriptionNetworkLayer';
import NavigationStore from '../stores/NavigationStore';
import LoadingScreen from './LoadingScreen';
import ErrorPage from './ErrorPage';
import { AppState } from 'react-native';
    
const environment = new RelaySubscriptions.Environment();
environment.injectNetworkLayer(new SubscriptionNetworkLayer([
  urlMiddleware({
    url: `http://${process.env.API_HOST}/graphql`,
    batchUrl: `http://${process.env.API_HOST}/graphql/batch`
  }),
  retryMiddleware(),
  authMiddleware({
    token: () => WebAPIUtils.getCredentials('jwt'),
    prefix: 'JWT ',
    tokenRefreshPromise: (req) => {
      console.log('[client.js] resolve token refresh', req);
      return WebAPIUtils.authenticate({
        access_token: WebAPIUtils.getCredentials('facebook')
      }).catch(err => {
        console.log('[client.js] ERROR can not refresh token', err);
        NavigationStore.goTo.login();
      });
    },
  })
], { disableBatchQuery: false }));

let appStateListener, currentContainer;
function handleAppStateChange(currentAppState) {
  if (currentAppState == 'active' && !!currentContainer) {
    currentContainer.forceFetch();
  }
}

export default function RelayRenderer({Component, variables}) {
  if (!appStateListener) {
    appStateListener = AppState.addEventListener('change', handleAppStateChange) || true;
  }
  return <Relay.Renderer
    environment={environment}
    Container={Component}
    forceFetch={true}
    queryConfig={Object.assign({}, {
      name:'MainRoute',
      queries: {
        viewer: (Component, args) => Relay.QL`
          query {
            viewer {
              ${Component.getFragment('viewer', args)}
            }
          }
        `
      },
      params: variables || {}
    })}
    render={({done, error, props, retry, stale}) => {
      if (error) {
        return <ErrorPage />;
      } else if (props) {
        return <Component ref={(containerRef) => currentContainer = containerRef} {...props}/>;
      } else {
        return <LoadingScreen />;
      }
    }} />;
}