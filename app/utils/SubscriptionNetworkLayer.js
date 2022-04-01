import { RelayNetworkLayer } from 'react-relay-network-layer';
import FCM from 'react-native-fcm';
import WebAPIUtils from './WebAPIUtils';

window.navigator.userAgent = 'react-native';

const io = require('socket.io-client/socket.io');

export default class SubscriptionNetworkLayer extends RelayNetworkLayer {
  constructor(...args) {
    super(...args);

    WebAPIUtils.ensure_login(() => {
      this.socket = io(`http://${process.env.API_HOST}`, {
        transports: ['websocket'],
        forceNew: true,
        query: 'token=' + WebAPIUtils.getCredentials('jwt'),
      });
      this.requests = Object.create(null);
  
      this.socket.on('subscription update', ({ id, data, errors }) => {
        const request = this.requests[id];
        if (errors) {
          console.warn('subscription update error', errors);
          request.onError(errors);
        } else {
          request.onNext(data);
        }
      });
    })
    
    this.refreshFCMUnsubscribe = FCM.on('refreshToken', (token) => {
      WebAPIUtils.update_fcm_token(token)
    });

  }

  sendSubscription(request) {
    const id = request.getClientSubscriptionId();
    this.requests[id] = request;

    this.socket.emit('subscribe', {
      id,
      query: request.getQueryString(),
      variables: request.getVariables(),
    });

    return {
      dispose: () => {
        this.socket.emit('unsubscribe', id);
      },
    };
  }
}