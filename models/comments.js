var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  url: Url,
  body: String,
  author: String,
  rating: {type: Number, default: 0},
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }
});

mongoose.model('Comment', CommentSchema);