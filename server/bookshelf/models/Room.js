import { bookshelf, knex } from '../connection'
import User from './User'
import Topic from './Topic'
import RoomUser from './RoomUser'
import Message from './Message'
import MessageCenter from '../../MessageCenter';
import { Rooms } from '../collections';

var Room = bookshelf.Model.extend({
  tableName: 'rooms',
  hasTimestamps: ['created_at', 'updated_at'],
  topic: function() {
    return this.belongsTo(Topic);
  },
  users: function() {
    return this.belongsToMany(User);
  },
  closestUsers: function() {
    return this.belongsToMany(User, 'rooms_users', 'closest_room_id');
  },
  memberships: function() {
    return this.hasMany(RoomUser);
  },
  messages: function() {
    return this.hasMany(Message);
  },
  message_connection: function() {
    return this.hasMany(Message);
  },
  updateLocation: function() {
    return this.closestUsers().fetch().then((users) => {
      return users.reduceThen((sumVector, users) => {
        let {latitude, longitude} = users.attributes;
        return [latitude, longitude].map((x, i) => x + sumVector[i]);
      }, [0, 0])
      .then((sumVector) => sumVector.map((x) => x/users.length))
      .then(([latitude, longitude]) => {
        return this.save({latitude, longitude}, {patch: true})
      });
    });
  },
  addUser: function(user_id, options = {}) {
    let { isClosestRoom } = options;
    let room_id = this.id;
    let closest_room_id;
    if (isClosestRoom) closest_room_id = room_id;
    return RoomUser.forge({
      room_id,
      user_id,
      closest_room_id
    }).save();
  },
  lastMessage: function() {
    return this.clone().load({messages: (qb) => {
      qb.orderBy('created_at', 'DESC');
      qb.limit(1);
    }}).then((model) => model.related('messages').at(0));
  },
  membership: function(user_id) {
    return RoomUser.forge({
      user_id: user_id,
      room_id: this.get('id')
    }).fetch();
  },
  sendMessage: function({text, author_id}) {
    let room_id = this.get('id');
    let message = new Message({text, author_id, room_id});
    return message.save().then((result) => {
      return this.save({updated_at: new Date()},{patch: true}).then((room) => {
        MessageCenter.alertTopic(`create_message_${room_id}`, {roomId: room_id});
        return room.fetch({withRelated: ['topic', 'messages']}).then(() => {
          room.users().fetch().then((users) => {
            users.models.map((user) => {
              const userId = user.get('id')
              if (!MessageCenter.isOnline(userId)) {
                user.sendPushNotification({
                  collapse_key: `create_message_${room_id}`,
              
                  notification: {
                    title: room.related('topic').get('title'), 
                    body: text
                  },
                });
              }
            });
          })
          return room;
        });
      });
    }).then((room) => ({
      room,
      message: room.related('messages').find((m) => m.get('id') == message.get('id'))
    }));
  },
  popularity: function() {
    return knex('rooms_users').where({room_id: this.get('id')}).count('id').then((total) => parseInt(total[0].count))
  },
  closestUserCount: function() {
    return knex('rooms_users').where({closest_room_id: this.get('id')}).count('id').then((total) => parseInt(total[0].count))
  },
  updateClosestUsers() {
    return this.load(['memberships', 'topic.rooms']).then(() => {
      return this.related('memberships').invokeThen('updateClosestRoom', this.related('topic').related('rooms'));
    });
  },
  distanceFrom({latitude, longitude}) {
    let X = [latitude, longitude];
    let Y = [this.get('latitude'), this.get('longitude')];
    let sum = 0
    let n = X.length

    while (n--) {
      sum += (Y[n] - X[n]) * (Y[n] - X[n]);
    }

    return sum;
  },
  split() {
    const offset = 0.015;
    let topic_id = this.get('topic_id');
    let latitude = this.get('latitude') + offset;
    let longitude = this.get('latitude') + offset;
    return Room.forge({topic_id, latitude, longitude}).save();
  }
});

Room.collection = function (models, options) {
  return new Rooms(models || [], Object.assign({}, options, {model: Room}));
};

export default Room;
