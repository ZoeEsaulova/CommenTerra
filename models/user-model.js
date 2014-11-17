var mongoose = require('mongoose');
//var Email = mongoose.SchemaTypes.Email;

//Define the Database schema for "users" collection
var UserSchema = new mongoose.Schema({
  username: {
	  type: String, 
	  unique: true,
	  required: true,
	  // trim removes empty spaces
	  trim: true
  },
  passwort: {
	  type: String,
	  required: true,
	  trim: true	  
  },
  email: {
	  type: String, 
	  unique: true,
	  required: true,
	  trim: true
  },
  country: String,
  occupation: String,
  type: String,
  upvotes: { type: Number, default: 0},
  downvotes: { type: Number, default: 0},
  help: { type: Boolean, default: 0 },
  //Comments created by the user
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});

//mongoose.model('User', UserSchema);
module.exports = mongoose.model("User", UserSchema);

