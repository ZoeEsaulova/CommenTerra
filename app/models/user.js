// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
    	username : String,
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
		name: {
			first: String,
			last: String
		},
		country: String,
		occupation: String,
		status: String,
		upvotes: { type: Number, default: 0},
		downvotes: { type: Number, default: 0},
		help: { type: Boolean, default: 0 },
		//Comments created by the user
		comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    },
    
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
