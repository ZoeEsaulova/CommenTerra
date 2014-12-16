/* The route used to add, delete, get comments */

var express = require('express'),
	router = express.Router(),		
	Comment = require('../models/comment'),
	Dataset = require('../models/dataset'),
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
		if (req.isAuthenticated()) {
			res.render('new_comment.ejs', { boolean1: true, username: req.user.local.username, action: "/logout", actionName: "Logout", 
				message: req.flash('loginMessage')  })
		} else {
			res.render('new_comment.ejs', { boolean1: false, username: 'Anonymous', action: "#", actionName: "Login", 
				message: req.flash('loginMessage') })
		}
});

// process the add comment form
router.post('/add', function(req, res) {
	// Get form values. These rely on the "name" attributes
	var newTitle = req.body.title,
	    newUrl = req.body.url,
		newText = req.body.text,
		newDataset = new Dataset({ url: newUrl });

	if (req.isAuthenticated()) {
		console.log(req.user.local.username);
		//create new comment
		var newComment = new Comment({ title: newTitle, url: newUrl, text: newText, userx: req.user._id, 
			dataset: newDataset })
		//save the comment in the database
		newComment.save(function (err) {
			if (err) return console.error(err)
			console.log("Comment Saved!!!")
		});
		res.redirect('/');
	} else {
		var newComment = new Comment({ title: newTitle, url: newUrl, text: newText, dataset: newDataset, author: 'anonymous' })
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