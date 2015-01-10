/* The main route used for home page and authentication */

module.exports = function(app, passport) {

var User = require('../models/user');
var Comment = require('../models/comment');
var _ = require('underscore');
// normal routes ===============================================================

	// show the home page. The contant of the home page depends on whether the user is authenticatedd
	app.get('/', function(req, res) {
		Comment.find({ comment: undefined }).populate('user').populate('dataset').populate('comments').sort(' -date').exec(function(err,comments) {

			if (req.isAuthenticated()) {
			res.render('Home.ejs', { 
				boolean1: true, 
				username: req.user.local.username,
				userId: req.user._id,
				action: "/logout", 
				actionName: "Logout", 
				message: req.flash('loginMessage'), 
				comments: comments })
		} else {
			res.render('Home.ejs', { boolean1: false, username: 'Anonymous', action: "#", actionName: "Login", 
				message: req.flash('loginMessage'), comments: comments })
		} 
		})		
	});

	/* show the own profile page
	app.get('/myprofile', isLoggedIn, function(req, res) {

		if (req.isAuthenticated()) {
			res.render('profile.ejs', { 
				boolean1: true, 
				username: req.user.local.username, 
				action: "/logout", 
				actionName: "Logout", 
				message: req.flash('loginMessage'), 
				comments: req.user.comments })
		} else {
			res.redirect('/')
		} 
	}); */

	// show the profile page of another user
	app.get('/profile/:userId', function(req, res) {
		User.findOne({ '_id' : req.params.userId }).exec(function(err, foundedUser) {
			var query = Comment.find({ comment: undefined, user: foundedUser }).populate('user').populate('dataset').populate('comments')
			query.exec(function(err,comments) {
			if (req.isAuthenticated()) {				
				res.render('profile.ejs', { 
				user: req.user,
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
				user: foundedUser, 
				action: "/login", 
				actionName: "Login", 
				message: req.flash('loginMessage'), 
				comments: comments,
				 })
		} })
		})
	});

	

	// logout
	app.get('/logout', function(req, res) {
		req.logout()
		res.redirect('/')
	});

	//map_viewer
	app.get('/mapviewer', function(req,res) {
		if (req.isAuthenticated()) {
			res.render('map_viewer.ejs', { boolean1: true, username: req.user.local.username, action: "/logout", actionName: "Logout", 
				message: req.flash('loginMessage')  })
		} else {
			res.render('map_viewer.ejs', { boolean1: false, username: 'Anonymous', action: "#", actionName: "Login", 
				message: req.flash('loginMessage') })
		} 
	})

	//FAG
	app.get('/faq', function(req,res) {
		if (req.isAuthenticated()) {
			res.render('faq.ejs', { boolean1: true, username: req.user.local.username, action: "/logout", actionName: "Logout", 
				message: req.flash('loginMessage')  })
		} else {
			res.render('faq.ejs', { boolean1: false, username: 'Anonymous', action: "#", actionName: "Login", 
				message: req.flash('loginMessage') })
		} 
	})

	/* ADVANCED SEARCH
	app.get('/advancedsearch', function(req,res) {
		if (req.isAuthenticated()) {
			res.render('advanced_search.ejs', { boolean1: true, username: req.user.local.username, action: "/logout", actionName: "Logout", 
				message: req.flash('loginMessage')  })
		} else {
			res.render('advanced_search.ejs', { boolean1: false, username: 'Anonymous', action: "#", actionName: "Login", 
				message: req.flash('loginMessage') })
		} 
	}) */

	//ABOUT and CONTACT
	app.get('/about', function(req,res) {
		if (req.isAuthenticated()) {
			res.render('about.ejs', { boolean1: true, username: req.user.local.username, action: "/logout", actionName: "Logout", 
				message: req.flash('loginMessage')  })
		} else {
			res.render('about.ejs', { boolean1: false, username: 'Anonymous', action: "#", actionName: "Login", 
				message: req.flash('loginMessage') })
		} 
	})

	app.post('/profile/:userId', function(req,res) {
		User.findOne({ '_id' : req.params.userId }).populate('comments').exec(function(err, foundedUser) {
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
				/*
				if (req.body.username) {
					foundedUser.local.username = req.body.username
					for (comment in foundedUser.comments) {
						comment.authorName = req.body.username
					}
				} */

							
			
			

		//foundedUser = _.extend(foundedUser, req.body);

		foundedUser.save();
var query = Comment.find({ comment: undefined, user: foundedUser }).populate('user').populate('dataset').populate('comments')
			query.exec(function(err,comments) {
	
				res.render('profile.ejs', { 
				user: req.user,
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



// =============================================================================
// AUTHENTICATE ==================================================
// =============================================================================

		// LOGIN ===============================
		// process the login form
		app.post('/login', passport.authenticate('local-login', {
			successRedirect : '/', 
			failureRedirect : '/', 
			failureFlash : true // allow flash messages
		}));

		// SIGNUP =================================
		// process the signup form
		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect : '/', 
			failureRedirect : '/', 
			failureFlash : true // allow flash messages
		}));

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next()
	res.redirect('/')
}
}



