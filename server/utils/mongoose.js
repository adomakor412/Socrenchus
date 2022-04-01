module.exports = {
  extendSchema(aSchema) {
    aSchema.statics.findAndModify = function (...args) {
      return this.collection.findAndModify(...args);
    };
  }
}
