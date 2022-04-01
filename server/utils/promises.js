module.exports = {
  thenToJSON (promise) {
    return promise.then((result) => result.toJSON());
  }
}
