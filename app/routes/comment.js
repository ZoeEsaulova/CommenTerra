/* The route used to add, delete, get comments */

var express = require('express'),
	router = express.Router(),		
	Comment = require('../models/comment'),
	User = require('../models/user'),
	Dataset = require('../models/dataset'),
 	_ = require('underscore'),
 	querystring = require('querystring');
		
// get all comments
router.get('/', function(req,res) {
		Comment.find({ comment: undefined}).sort(' -date').exec(function(err, comments) {
		res.jsonp(comments)
	});	
});

// show the new_comment page
router.get('/add/:url?', function(req, res) {
		var url = ""
		if (req.params.url) { 
			readonly = true; 
			url = req.params.url}
		if (req.isAuthenticated()) {
			res.render('new_comment.ejs', { boolean1: true, username: req.user.local.username, action: "/logout", actionName: "Logout", 
				message: req.flash('loginMessage'), urlValue: url, addAction: "/comments/add" })
		} else {
			res.render('new_comment.ejs', { boolean1: false, username: 'Anonymous', action: "#", actionName: "Login", 
				message: req.flash('loginMessage'), urlValue: url, addAction: "/comments/add" })
		}
});

// show the new_comment page to add comment to existing thread
router.get('/addtothread/:commentUrl/:commentId', function(req, res) {
		if (req.isAuthenticated()) {
			res.render('new_comment.ejs', { 
				boolean1: true, 
				username: req.user.local.username, 
				action: "/logout", 
				actionName: "Logout", 
				message: req.flash('loginMessage'), 
				urlValue: req.params.commentUrl, 
				readonly: true, 
				addAction: "/comments/addtothread/"+req.params.commentId })
		} else {
			res.render('new_comment.ejs', { 
				boolean1: false, 
				username: 'Anonymous', 
				action: "#", 
				actionName: "Login", 
				message: req.flash('loginMessage'), 
				urlValue: req.params.commentUrl, 
				readonly: true, 
				addAction: "/comments/addtothread/"+req.params.commentId })
		}
		
});

// add a new comment with an URL   TO BE UPDATED111 - URL PARAMETER
router.post('/add', function(req, res) {
	// Get form values. These rely on the "name" attributes

	if (req.isAuthenticated()) {
	var newTitle = req.body.title,
	    newUrl = req.body.url,
		newText = req.body.text,
	    newDataset = "";
		startdate = new Date(req.body.startdate),
	    enddate = new Date(req.body.enddate);


        Dataset.findOne({ url: newUrl }).exec(function(err, dataset) {
			if (!dataset) {
				newDataset = new Dataset({ url: newUrl })
        		newDataset.save()
				//create new comment
				var newComment = new Comment({ 
					title: newTitle, 
					text: newText, 
					user: req.user._id,
		 			dataset: newDataset, 
		 			authorName: req.user.local.username, 
		 			url: newUrl,
		 			startdate: startdate,
        			enddate: enddate })
				//save the comment in the database
				newComment.save(function (err) {
					if (err) return console.error(err)
				});
				User.findOne({ _id: req.user._id }).exec(function(err, user) {
					user.comments.push(newComment)
					user.save()
				})
				newDataset.comments.push(newComment)
				newDataset.save()
				res.redirect('/')
			} else {
				//create new comment
				var newComment = new Comment({ 
					title: newTitle, 
					text: newText, 
					user: req.user._id,
				 	dataset: dataset, 
				 	authorName: req.user.local.username, 
				 	url: newUrl })
				//save the comment in the database
				newComment.save(function (err) {
					if (err) return console.error(err)
				});
				User.findOne({ _id: req.user._id }).exec(function(err, user) {
					user.comments.push(newComment)
					user.save()
				})
				dataset.comments.push(newComment)
				dataset.save()
				res.redirect('/')
			}
	    });	
	// if not authenticated:
	} else {
	var newTitle = req.body.title,
	    newUrl = req.body.url,
		newText = req.body.text,
	    newDataset = "",
		startdate = new Date(req.body.startdate),
	    enddate = new Date(req.body.enddate);


        Dataset.findOne({ url: newUrl }).exec(function(err, dataset) {
			if (!dataset) {
				newDataset = new Dataset({ url: newUrl })
        		newDataset.save()
        		var newComment = new Comment({ 
        			title: newTitle, 
        			text: newText, 
        			dataset: newDataset, 
        			url: newUrl,
        			startdate: startdate,
        			enddate: enddate
        		})

				newComment.save(function (err) {
					if (err) return console.error(err)		
				})
				newDataset.comments.push(newComment)
				newDataset.save()
				res.redirect('/')
			} else {
				var newComment = new Comment({ title: newTitle, text: newText, dataset: dataset, url: newUrl })
				newComment.save(function (err) {
					if (err) return console.error(err)
				})
				dataset.comments.push(newComment)
				dataset.save()
				res.redirect('/')
			}
	    });	
	}
});

// add comment to existing thread
router.post('/addtothread/:commentId', function(req, res) {

	if (req.isAuthenticated()) {
	//get form values
	var newTitle = req.body.title,
	    newUrl = req.body.url,
	    newText = req.body.text,
	    newDataset = "",
	    newThread = "";

	    Comment.findOne({ _id: req.params.commentId }).exec(function(err, thread) {
	    	newThread = thread
	    })

        Dataset.findOne({ url: newUrl }).exec(function(err, dataset) {
			if (!dataset) {
				newDataset = new Dataset({ url: newUrl })
        		newDataset.save()
			//create new comment
			var newComment = new Comment({ 
				title: newTitle, 
				text: newText, 
				user: req.user._id,
				dataset: newDataset, 
				comment: newThread, 
				authorName: req.user.local.username, 
				url: newUrl })
			//save the comment in the database
			newComment.save(function (err) {
				if (err) return console.error(err)
			});
			User.findOne({ _id: req.user._id }).exec(function(err, user) {
				user.comments.push(newComment)
				user.save()
			})
			newDataset.comments.push(newComment)
			newDataset.save()
			Comment.findOne({ _id: req.params.commentId }).exec(function(err, thread) {
		    	thread.comments.push(newComment)
		    	thread.save()
		    })
			res.redirect('/')
			} else {
				//create new comment
				var newComment = new Comment({ 
					title: newTitle, 
					text: newText, 
					user: req.user._id,
				 	dataset: dataset, 
				 	comment: newThread, 
				 	authorName: req.user.local.username, 
				 	url: newUrl})
				//save the comment in the database
				newComment.save(function (err) {
					if (err) return console.error(err)
				});
				User.findOne({ _id: req.user._id }).exec(function(err, user) {
					user.comments.push(newComment)
					user.save()
				})
				dataset.comments.push(newComment)
				dataset.save()
				Comment.findOne({ _id: req.params.commentId }).exec(function(err, thread) {
			    	thread.comments.push(newComment)
			    	thread.save()
			    })
				res.redirect('/')
			}
	    });	

	} else {
	var newTitle = req.body.title,
	    newUrl = req.body.url,
		newText = req.body.text;
	    newDataset = "",
	    newThread = "";

	    Comment.findOne({ _id: req.params.commentId }).exec(function(err, thread) {
	    	newThread = thread
	    })	    

        Dataset.findOne({ url: newUrl }).exec(function(err, dataset) {
			if (!dataset) {
				newDataset = new Dataset({ url: newUrl })
        		newDataset.save()
        		var newComment = new Comment({ title: newTitle, text: newText, dataset: newDataset, comment: newThread
        		, url: newUrl })
				newComment.save(function (err) {
					if (err) return console.error(err)		
				})
				newDataset.comments.push(newComment)
				newDataset.save()
				res.redirect('/')
			} else {
				var newComment = new Comment({ title: newTitle, text: newText, dataset: dataset, comment: newThread
				,  url: newUrl})
				newComment.save(function (err) {
					if (err) return console.error(err)
				})
				dataset.comments.push(newComment)
				dataset.save()
				Comment.findOne({ _id: req.params.commentId }).exec(function(err, thread) {
	    			thread.comments.push(newComment)
	    			thread.save()
	    		})
				res.redirect('/')
			}
	    });	
	}
});


// get one comment
router.get('/:commentId', function(req,res) {
	Comment.find({ _id : req.params.commentId }).exec(function(err, comment) {
	res.jsonp(comment)
	});
});

// edit a comment
router.put('/:commentId', function(req,res) {
	Comment.find({ _id : req.params.commentId }).exec(function(err, comment) {
		comment = _.extend(comment, req.body)
		comment.save(function(err) {
			res.jsonp(comment)
		})	
	});
})

// edelete a comment
router.delete('/:commentId', function(req,res) {
	/* NOT IMPLEMENTED YET */
})
		

module.exports = router
