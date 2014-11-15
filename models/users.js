var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  country: String,
  occupation: String,
  type: String,
  upvotes: {type: Number, default: 0},
  downvotes: {type: Number, default: 0},
  help: Boolean,
  //comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

mongoose.model('User', UserSchema);