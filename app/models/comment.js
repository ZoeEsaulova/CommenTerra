/* Database schema for comments*/

// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var commentSchema = mongoose.Schema({
  id: { type: String, default: "http://giv-geosoft2a.uni-muenster.de:3000/comments/"+this._id},
  title: { type: String },
  dataset: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset' },
  text: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: {type: Number, default: 0},
  date: Date,
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  markerCoords: [{ type: Number }],
  boundingBox: [{ type: Number}],
  temporalComponent: [ {type: String }]

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Comment', commentSchema);
