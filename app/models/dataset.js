/* Database schema for datasets*/

var mongoose = require('mongoose');


var datasetSchema = mongoose.Schema({
  url: { 
			type: String,
			required: true,
			trim: true
		},
  rating: { type: Number, default: 0 },
  //Comments, refering this dataset
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

// create the model for datasets and expose it to our app
module.exports = mongoose.model('Dataset', datasetSchema);