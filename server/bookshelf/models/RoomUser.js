import { bookshelf, knex } from '../connection'
import User from './User'
import Room from './Room'
import MessageCenter from '../../MessageCenter';

export default bookshelf.Model.extend({
  tableName: 'rooms_users',
  hasTimestamps: ['created_at', 'last_read'],
  initialize: function() {
    
    const alertParticipantsChanged = (model, {room_id}) => (
      MessageCenter.alertTopic(`participants_changed_${model.get('room_id')}`, {roomId: model.get('room_id')})
    );
    this.on("created", alertParticipantsChanged);
    this.on("destroying", alertParticipantsChanged);
  },
  user: function() {
    return this.belongsTo(User);
  },
  room: function() {
    return this.belongsTo(Room);
  },
  closestRoom: function() {
    return this.belongsTo(Room, 'closest_room_id');
  },
  unreadCount: function() {
    let lastRead = this.get('last_read');
    return knex('messages').where({room_id: this.get('room_id')}).where('created_at', '>', lastRead).count('id').then((total) => total[0].count)
  },
  markAsRead: function() {
    return this.save({last_read: new Date()}, {patch: true});
  },
  updateClosestRoom(availableRooms) {
    return this.user().fetch().then((user) => {
      let {latitude, longitude} = user.attributes;

      return availableRooms.findNearest({latitude, longitude}).then((closestRoom) => {
        let closest_room_id = closestRoom.get('id');
        return this.save({closest_room_id}, {patch: true});
      });
    });
  }
});
