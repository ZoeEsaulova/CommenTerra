var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  title: String,
  url: Url,
  body: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: {type: Number, default: 0},
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }
});

mongoose.model('Comment', CommentSchema);