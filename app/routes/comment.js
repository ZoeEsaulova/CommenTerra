/* The route used to add, delete, get comments */

var express = require('express'),
	router = express.Router(),		
	Comment = require('../models/comment'),
 	_ = require('underscore'),
 	querystring = require('querystring');

//set statoc content
router.use(express.static(__dirname + '/public'));

		
// GET ALL COMMENTS
router.get('/', function(req,res) {
	Comment.find().exec(function(err, comments) {
	res.jsonp(comments)
	});
});

// ADD COMMENT ===========================
router.get('/add', function(req, res) {
	res.render("AddNewComment.ejs")
});

// process the add comment form
router.post('/add', function(req, res) {
	// Get form values. These rely on the "name" attributes
	var newTitle = req.body.title,
	    newUrl = req.body.url,
		newText = req.body.text;

	if (req.isAuthenticated()) {
		//create new comment
		var newComment = new Comment({ title: newTitle, url: newUrl, text: newText, author: req.user._id })
		//save the comment in the database
		newComment.save(function (err) {
			if (err) return console.error(err)
			console.log("Comment Saved!!!")
		});
		res.redirect('/');
	} else {
		var newComment = new Comment({ title: newTitle, url: newUrl, text: newText })
		newComment.save(function (err) {
		if (err) return console.error(err)
		console.log("Comment Saved!!!")
		})
		res.redirect('/')
	}
});

// GET ONE COMMENT
router.get('/:commentId', function(req,res) {
	Comment.find({ _id : req.params.commentId }).exec(function(err, comment) {
	res.jsonp(comment)
	});
});

// EDIT A COMMENT
router.put('/:commentId', function(req,res) {
	Comment.find({ _id : req.params.commentId }).exec(function(err, comment) {
		comment = _.extend(comment, req.body)
		comment.save(function(err) {
			res.jsonp(comment)
		})	
	});
})

// DELETE A COMMENT
router.delete('/:commentId', function(req,res) {
	/* NOT IMPLEMENTED YET */
})
		

module.exports = router