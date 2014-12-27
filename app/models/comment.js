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
  authorName: String,
  rating: {type: Number, default: 0},
  date: { type: Date, default: Date.now },
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  markerCoords: [{ type: Number }],
  boundingBox: [{ type: Number}],
  temporalComponent: [ {type: String }]

})

commentSchema.virtual('dateString').get(function () {
  var d = this.date;
  var m_names = new Array("January", "February", "March", 
"April", "May", "June", "July", "August", "September", 
"October", "November", "December");
  var curr_date = d.getDate();
  var curr_month = d.getMonth();
  var curr_year = d.getFullYear();
  var h = d.getHours();
  var m = d.getMinutes();
  if (m.toString().length==1) {
    var result = curr_date + "." + m_names[curr_month]  + " " + curr_year + "  " + h + ":" + "0" + m;
  } else {
    var result = curr_date + "." + m_names[curr_month]  + " " + curr_year + "  " + h + ":" + m;
  }
  
  return result;
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

commentSchema.virtual('username').get(function () {
  
  mongoose.model('Comment').findOne({ title : this.title }).populate('user').exec(function(err,comment) {
    if (comment.user!=undefined) {
      console.log(comment.user.local.username)
      return comment.user.local.username
    } else {
      return "Anonymous"
    }
  })
  })
/*
  var comment = ""
  return query.exec(function(err, com) {
      if (com.user) {
    console.log("Ja")
      return query.populate('user').exec(function(err, comment) {
      return comment.user.local.username
    
  })
  } else {
    return "Anonymous"
  }
  })
*/



/*
commentSchema.virtual('username2').get(function () {
  return this.findAuthor(function(err, comment) {
                        if (comment.user) {
                          return comment.user.local.username;
                        }  else {
                          return "Anonymous"
                        }    
                      } )
  })


commentSchema.methods.findAuthor = function (cb) {

      mongoose.model('Comment').findOne({ title : this.title })    
      .populate('user')
      .exec(cb);
  }

/*
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
commentSchema.set('toObject', { virtuals: true });
// create the model for users and expose it to our app
module.exports = mongoose.model('Comment', commentSchema);
