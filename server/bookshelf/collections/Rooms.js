import { bookshelf } from '../connection'
import Room from '../models/Room'

export default bookshelf.Collection.extend({
  model: Room,
  findNearest({latitude, longitude}) {
    return this.reduceThen(({distance, room}, aRoom) => {
      let aDistance = aRoom.distanceFrom({latitude, longitude});
      if (aDistance < distance) {
        return {distance: aDistance, room: aRoom};
      } else {
        return {distance, room};
      }
    }, {distance: Infinity, room: this.at(0)}).then(({room}) => room);
  },
  findOrCreateNearest({latitude, longitude}) {
    if (this.length === 0) {
      let topic_id = this.get('topic_id');
      return this.create({topic_id, latitude, longitude});
    } else {
      return this.findNearest({latitude, longitude});
    }
  },
  updateClosestRooms() {
    return this.invokeThen('updateClosestUsers');
  },
  updateRoomLocations() {
    return this.invokeThen('updateLocation');
  },
  breakUpLargeRooms() {
    return this.reduceThen((newRooms, room) => {
      return room.closestUserCount().then((count) => {
        if (count > 15) newRooms.push(room.split());
        return newRooms;
      });
    }, []).then((newRoomPromises) => {
      return Promise.all(newRoomPromises).then((newRooms) => {
        let result = this.add(newRooms);
        if (newRooms.length > 0) {
          result.kMeansAlgorithm();
        }
        return result;
      });
    });
  },
  kMeansIteration() {
    // Assignment step: update 'closestRoom' on RoomUser
    return this.updateClosestRooms()
      .then(this.updateRoomLocations.bind(this));
      // Update step: recalculate each room's location (the centroid)
  },
  kMeansAlgorithm() {
    const ITERATIONS = 10;

    let promiseChain = Promise.resolve(true);
    let then = (fn) => promiseChain = promiseChain.then(fn);
    for (let i = 0; i < ITERATIONS; ++i) {
      then(() => this.kMeansIteration());
    }

    return promiseChain;
  }
});
