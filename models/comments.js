var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  title: String,
  url: Url,
  text: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: {type: Number, default: 0},
  date: Date,
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }
});

//mongoose.model('Comment', CommentSchema);
module.exports = mongoose.model(Comment, CommentSchema);