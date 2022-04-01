import { bookshelf, knex } from '../connection'
import Room from './Room'
import RoomUser from './RoomUser'
import Message from './Message'
import Topic from './Topic'
import FCM from 'fcm-node'

const fcm = new FCM(process.env.FCM_SERVER_KEY);

export default bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: ['created_at', 'updated_at'],
  rooms: function() {
    return this.belongsToMany(Room);
  },
  messages: function() {
    return this.hasMany(Message, 'author_id');
  },
  recommendedTopics: function() {
    return this.load(['rooms']).then(
      (user) => user.related('rooms').models.map((room) => room.get('topic_id'))
    ).then((topicIDs) =>
      Topic.query((qb) => qb.whereNotIn('id', topicIDs)).fetchAll()
    );
  },
  searchTopics: function(search) {
    return Topic.query((qb) => qb.whereRaw(`title ~* '.*${knex.raw(search)}.*'`)).fetchAll();
  },
  updateLocation: function({latitude, longitude}) {
    return this.save({latitude, longitude}, {patch: true}).then(() => {
      return this.rooms().fetch().then((rooms) => {
        return rooms.kMeansIteration();
      });
    });
  },
  updateFCMToken: function(fcm_token) {
    return this.save({fcm_token}, {patch: true});
  },
  sendPushNotification: function(notification) {
    if (this.get('notifications_enabled')) {
      const token = this.get('fcm_token');
      fcm.send({
        to: token, 
        ...notification
      }, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
      });
    }
  },
  isAnonymous: function() {
    // Check for any login info
    const isEmpty = (value) => !value || value == '';
    const facebook_id = this.get('facebook_id');
    return isEmpty(facebook_id);
  }
},{
  findOrCreate: function(query, rest, options = {}) {
    const queryType = ('where' in query) ? 'query' : 'where';
    return this[queryType](query).fetch().then((result) => {
      let baseAssign = query;
      if (queryType == 'query') {
        baseAssign = Object.assign({}, query.where, query.orWhere);
      }
      
      if (result) {
        let newAttrs = Object.assign(baseAssign, rest);
        if (options.overwrite === false) {
          const isEmpty = (value) => !value || value == '';
          newAttrs = Object.keys(rest).reduce((attrs, key) => isEmpty(result.attributes[key]) ? {[key]:rest[key], ...attrs} : attrs, {});
        }
        return result.save(newAttrs, {patch: true});
      }
      
      return this.forge(Object.assign(baseAssign, rest)).save();
    });
  }
});
