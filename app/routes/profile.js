/* The route used to show profile page ans edit profile settings */

var express = require('express'),
	router = express.Router(),		
	Comment = require('../models/comment'),
	User = require('../models/user'),
	Dataset = require('../models/dataset');


	// show the profile page 
	router.get('/:username', function(req, res) {
		User.findOne({ 'local.username' : req.params.username }).exec(function(err, foundedUser) {
			var query = Comment.find({ comment: undefined, user: foundedUser }).populate('user').populate('dataset').populate('comments')
			query.exec(function(err,comments) {
			if (req.isAuthenticated()) {				
				res.render('profile.ejs', { 
				user: req.user,
				userId: req.user.local.username,
				pageowner: foundedUser,
				boolean3: foundedUser.local.username==req.user.local.username,
				boolean1: true, 
				action: "/logout", 
				actionName: "Logout", 
				message: req.flash('loginMessage'), 
				comments: comments,
				})
		} else {
				res.render('profile.ejs', { 
				boolean1: false, 
				pageowner: foundedUser, 
				action: "/login", 
				actionName: "Login", 
				message: req.flash('loginMessage'), 
				comments: comments,
				 })
		} })
		})
	});

	// edit profile settings
	router.post('/:userId', function(req,res) {

		User.findOne({ '_id' : req.params.userId }).populate('comments').exec(function(err, foundedUser) {
			// process form values
			if (req.body.firstname) {
				foundedUser.firstname = req.body.firstname
			}
			if (req.body.lastname) {
				foundedUser.lastname = req.body.lastname
			}
			if (req.body.profession) {
				foundedUser.profession = req.body.profession
			}
			if (req.body.country) {
				foundedUser.country = req.body.country
			}
			if (req.body.about) {
				foundedUser.about = req.body.about
			}
			if (req.body.email) {
				foundedUser.local.email = req.body.email
			}

			foundedUser.save();
			// show all comments posted by this user
			var query = Comment.find({ comment: undefined, user: foundedUser })
				.populate('user')
				.populate('dataset')
				.populate('comments')

			query.exec(function(err,comments) {	
				res.render('profile.ejs', { 
				user: req.user,
				userId: req.user.local.username,
				pageowner: foundedUser,
				boolean3: foundedUser._id.toHexString()==req.user._id.toHexString(),
				boolean1: true, 
				action: "/logout", 
				actionName: "Logout", 
				message: req.flash('loginMessage'), 
				comments: comments,
				})
			})

		})
	})

module.exports = router