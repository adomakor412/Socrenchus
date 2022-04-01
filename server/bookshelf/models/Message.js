import { bookshelf } from '../connection'
import Room from './Room'
import User from './User'

export default bookshelf.Model.extend({
  tableName: 'messages',
  hasTimestamps: ['created_at', 'updated_at'],
  room: function() {
    return this.belongsTo(Room);
  },
  author: function() {
    return this.belongsTo(User, 'author_id');
  }
});
