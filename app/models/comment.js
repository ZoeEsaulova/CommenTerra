/* Database schema for comments*/

// load the things we need
var mongoose = require('mongoose');
var Comment = require('../models/comment');
// define the schema for our user model
var commentSchema = mongoose.Schema({
  id: { type: String, default: "http://giv-geosoft2a.uni-muenster.de:3000/comments/"+this._id},
  title: { type: String },
  dataset: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset' },
  url: String,
  text: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, default: "Anonymous" },
  rating: {type: Number, default: 0},
  date: { type: Date, default: Date.now },
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  markerCoords: [{ type: Number }],
  boundingBox: [{ type: Number}],
  temporalComponent: [ {type: String }]

})


/*
commentSchema.virtual('url').get(function () {
  this.populate('dataset').exec(function(err, comment) {
      if (err) return handleError(err)
      return comment.dataset.url
  })
})
*/
/*
commentSchema.virtual('author').get(function () {
  this.populate('user').exec(function(err, comment) {
      if (err) return handleError(err)
      return comment.user.local.username
  })
})
*/
/*
commentSchema.virtual('author').get(function () {
      mongoose.model('Comment').findOne({ title: this.title })
      .populate('user')
      .exec(function(err, comment) {
          if (err) return handleError(err);
          console.log("Method:" + comment.user.local.username)
          return comment.user.local.username
      });
})*/

/*
commentSchema.virtual('author').get(function () {
    mongoose.model('Comment').findOne({ title : this.title })
      .populate('user')
      .exec(function(err, comment) {
        if (comment.user) {
          console.log("Method:" + comment.user.local.username);
          return comment.user.local.username;
        }  else {
          return "Anonymous"
        }    
      });

     }
   )
*/
/*

commentSchema.methods.findAuthor = function () {
      mongoose.model('Comment').findOne({ title : this.title })
      .populate('user')
      .exec(function(err, comment) {
        if (comment.user) {
          console.log("Method:" + comment.user.local.username);
          return comment.user.local.username;
        }  else {
          return "Anonymous"
        }    
      });
  }

commentSchema.methods.findSimilarTypes = function (cb) {
  return this.model('Comment').find({ title: this.title }, cb);
}



commentSchema.statics = {

  load: function (comment) {
      mongoose.model('Comment').findOne({ title : comment.title })
      .populate('user')
      .exec(function(err, comment) {
        if (comment.user) {
          console.log("Method:" + comment.user.local.username);
          return comment.user.local.username;
        }  else {
          return "Anonymous"
        }    
      });
  }

  }
  */
commentSchema.set('toJSON', { virtuals: true });
// create the model for users and expose it to our app
module.exports = mongoose.model('Comment', commentSchema);
