// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var commentSchema = mongoose.Schema({
  title: { type: String },
  url: String,
  text: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: {type: Number, default: 0},
  date: Date,
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Comment', commentSchema);
