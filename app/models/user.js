/* Database schema for users*/

// load the things we need
var mongoose = require('mongoose'),
    bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
    	username : { type: String, unique: true },
        email        : { 
			type: String,
			unique: true,
			required: true,
			trim: true
		},
        password     : {
			type: String,
			unique: true,
			required: true,
			trim: true
		},

    },
    	firstname: { type: String, default: "" },
    	lastname: { type: String, default: "" },
		country: { type: String, default: "" },
		upvotes: { type: Number, default: 0},
		downvotes: { type: Number, default: 0},
		help: { type: Boolean, default: 0 },
		profession: { type: String, default: "" },
		about: String,
		//Comments created by the user
		comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
		posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
		votedUp: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
		votedDown: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
    
});

userSchema.virtual('status').get(function () {
	
	if (this.downvotes!=0) {
		if ((this.posts.length > 1) && (this.upvotes > 2) && (this.upvotes/Math.abs(this.downvotes) > 0.7 )) {
		return "Expert"
		} 
	} else if ((this.posts.length > 1) && (this.upvotes > 2)) {
		return "Expert"
	} else {
		return ""
	}
})

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password)
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema)
