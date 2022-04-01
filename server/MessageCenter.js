import Redis from 'redis';

const REDIS_CHANNEL = 'updates';
export default class MessageCenter {
  static subscriptions = [];
  static users = [];
  static subscribe (callback, userId) {
    MessageCenter.subscriptions.push(callback);
    MessageCenter.changeUserStatus(userId, true);
    return callback;
  }

  static clear (callback, userId) {
    MessageCenter.changeUserStatus(userId, false);
    let index = MessageCenter.subscriptions.indexOf(callback);
    if (index !== -1)
      MessageCenter.subscriptions.slice(index, 1);
  }

  static alertSession (topic, data) {
    return function(callback) {
      if (callback) callback({topic, data});
    }
  }

  static alertLocal (topic, data) {
    MessageCenter.subscriptions.map(MessageCenter.alertSession(topic, data));
  }

  static alertTopic (topic, data) {
    MessageCenter.publisher.publish(REDIS_CHANNEL, JSON.stringify({topic, data}));
  }
  
  static changeLocalUserStatus (userId, isOnline) {
    const userIndex = MessageCenter.users.indexOf(userId);
    const userInList = userIndex > -1;
    if (isOnline && !userInList) {
      MessageCenter.users.push(userId);
    } else if (!isOnline && userInList) {
      MessageCenter.users.splice(userIndex, 1);
    }
  }
  
  static changeUserStatus (userId, isOnline) {
    MessageCenter.publisher.publish(REDIS_CHANNEL, JSON.stringify({userId, isOnline}));
  }
  
  static isOnline(userId) {
    return MessageCenter.users.indexOf(userId) > -1;
  }
}
MessageCenter.publisher = Redis.createClient(process.env.REDIS_URL);
MessageCenter.subscriber = Redis.createClient(process.env.REDIS_URL);
MessageCenter.subscriber.subscribe(REDIS_CHANNEL);

MessageCenter.subscriber.on('message', (channel, message) => {
  const {
    topic,
    data,
    userId,
    isOnline
  } = JSON.parse(message);
  if (topic) {
    MessageCenter.alertLocal(topic, data);
  } else {
    MessageCenter.changeLocalUserStatus(userId, isOnline);
  }
});