require('dotenv').load();
import {schema, graphql} from './graphql';
import { graphqlSubscribe } from 'graphql-relay-subscription';
import MessageCenter from './MessageCenter';

var http = require('./http')(require('http'));
var port = process.env.PORT || 3000;

const server = http.listen(port, function(){
  console.log('listening on *:' + port);
});

const io = require('socket.io')(server, {
  serveClient: false,
});

io.use(require('socketio-jwt').authorize({
  secret: process.env.JWT_SECRET,
  handshake: true
}));

function addNotifier(userId, onEvent) {
  const id = MessageCenter.subscribe(onEvent, userId);
  return () => MessageCenter.clear(id, userId);
}

io.on('connection', socket => {
  console.log('Socket connected');
  const topics = Object.create(null);
  const unsubscribeMap = Object.create(null);
  const userId = socket.decoded_token.user_id;

  const removeNotifier = addNotifier(userId, ({ topic, data }) => {
    const topicListeners = topics[topic];
    if (!topicListeners) return;

    console.log(`Updating subscibers for topic '${topic}'`);
    topicListeners.forEach(({ id, query, variables }) => {
      graphql(
        schema,
        query,
        data,
        null,
        variables
      ).then((result) => {
        socket.emit('subscription update', { id, ...result });
      });
    });
  });

  socket.on('subscribe', ({ id, query, variables }) => {
    function unsubscribe(topic, subscription) {
      const index = topics[topic].indexOf(subscription);
      if (index === -1) return;

      topics[topic].splice(index);

      console.log(
        'Removed subscription for topic %s. Total subscriptions for topic: %d',
        topic,
        topics[topic].length
      );
    }

    function subscribe(topic) {
      topics[topic] = topics[topic] || [];
      const subscription = { id, query, variables };

      topics[topic].push(subscription);

      unsubscribeMap[id] = () => {
        unsubscribe(topic, subscription);
      };

      console.log(
        'New subscription for topic %s. Total subscriptions for topic: %d',
        topic,
        topics[topic].length
      );
    }

    graphqlSubscribe({
      schema,
      query,
      variables,
      context: { subscribe },
    }).then((result) => {
      if (result.errors) {
        console.error('Subscribe failed', result.errors);
      }
    });
  });

  socket.on('unsubscribe', (id) => {
    const unsubscribe = unsubscribeMap[id];
    if (!unsubscribe) return;

    unsubscribe();
    delete unsubscribeMap[id];
    socket.emit('subscription closed', id);
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnect');
    removeNotifier();
  });
});