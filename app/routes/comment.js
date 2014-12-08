var express = require('express');
var router = express.Router();	
var routes = require('../routes.js');	
//var rekuire = require('rekuire');
var Comment = require('../models/comment');
var _ = require('underscore');
var querystring = require('querystring');

router.use(express.static(__dirname + '/public'));

		// GET ALL COMMENTS

		router.get('/', function(req,res) {
			Comment.find().exec(function(err, comments) {
				res.jsonp(comments);
			});
		});

		// ADD COMMENT ===========================
		router.get('/add', function(req, res) {
			res.render("AddNewComment.ejs");
		});

		// process the add comment form
		router.post('/add', function(req, res) {
			// Get form values. These rely on the "name" attributes
			var newTitle = req.body.title;
			var newUrl = req.body.url;
			var newText = req.body.text;
			//get "Comment" model

			//create new comment document
			if (req.isAuthenticated()) {
				//create new comment document
				console.log(req.user.local.email);
				console.log(req.user.local.username);
				var newComment = new Comment({ title: newTitle, url: newUrl, text: newText, author: req.user._id });
				newComment.save(function (err) {
				if (err) return console.error(err);
				console.log("Comment Saved!!!");
			});

			res.redirect('/profile');
			} else {
				var newComment = new Comment({ title: newTitle, url: newUrl, text: newText });

				newComment.save(function (err) {
				if (err) return console.error(err);
				console.log("Comment Saved!!!");
			});

			//res.redirect('/search?'+ querystring.stringify(req.body));
			res.redirect('/');
			}
	
			/*Save new comment in databse. New comments will be saved in "comments" collection of the "ComTerDB"
			You can check whether the comment was saved using following commands in MongoDB shell:
			use ComTerDB
			db.comments.find().pretty() */

		});
// GET ONE COMMENT
router.get('/:commentId', function(req,res) {
	Comment.find({ _id : req.params.commentId }).exec(function(err, comment) {
		res.jsonp(comment);
	});
});

// EDIT A COMMENT
router.put('/:commentId', function(req,res) {
	Comment.find({ _id : req.params.commentId }).exec(function(err, comment) {

		comment = _.extend(comment, req.body);
		comment.save(function(err) {
			res.jsonp(comment);
		})	
	});

})

// DELETE A COMMENT
router.delete('/:commentId', function(req,res) {

})
		

module.exports = router;