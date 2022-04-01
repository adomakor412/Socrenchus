import {bookshelf} from '../../bookshelf/connection';
var knex = bookshelf.knex;
import { User } from '../../bookshelf';

module.exports = {
  knex,
  bookshelf,
  currentUser() {
    let email = 'user@example.com';
    let name = 'Joe Shmoe';
    let latitude = 1;
    let longitude = 1;

    return User.findOrCreate({ email }, { name, latitude, longitude });
  }
}
