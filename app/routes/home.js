/* The main route used for home page and authentication */

module.exports = function(app, passport) {

var User = require('../models/user');
var Comment = require('../models/comment');
var Dataset = require('../models/dataset');
var _ = require('underscore');
var coords = { minx: "", miny: "", maxx: "", maxy: "" };
// normal routes ===============================================================

	// show the home page
	app.get('/', function(req, res) {
		
		Comment.find({ comment: undefined }).populate('user').populate('dataset').populate('comments').sort(' -date')
		.exec(function(err,comments) {
			var markers = ""
				for (var i=0; i<comments.length; i++) {
					if (comments[i].markerCoords[0]) {
						markers = markers +  comments[i].markerCoords[0] + "," +  comments[i].markerCoords[1] + "," + comments[i].title + ','					
					}
					console.log("Raty: " + comments[i].datasetRating + " " + comments[i].dataset.rating)
					comments[i].datasetRating = comments[i].dataset.rating
					console.log("Raty danach " + comments[i].datasetRating + " " + comments[i].dataset.rating)
					comments[i].save()
				}

			
			if (req.isAuthenticated()) {			
				res.render('Home.ejs', { 
					boolean1: true, 
					username: req.user.local.username,
					userId: req.user.local.username,
					action: "/logout", 
					actionName: "Logout", 
					message: req.flash('loginMessage'), 
					comments: comments,
					markers: markers
				})
		} else {
			res.render('Home.ejs', { 
				boolean1: false, 
				username: 'Anonymous', 
				action: "#", 
				actionName: "Login", 
				message: req.flash('loginMessage'), 
				comments: comments,
				markers: markers
			})
		} 
		})	
	})	

	// logout
	app.get('/logout', function(req, res) {
		req.logout()
		res.redirect('/')
	});

	//show map_viewer page
	app.get('/mapviewer/:commentId', function(req,res) {

		Comment.findOne({ "_id" : req.params.commentId}).exec(function(err, comment) {
			coords["minx"] = comment.xLowRight.toString()
			coords["miny"] = comment.yLowRight.toString()
			coords["maxx"] = comment.xUpLeft.toString()
			coords["maxy"] = comment.yUpLeft.toString()
			var markers = ""
			if (comment.markerCoords[0]) {
				markers = markers +  comment.markerCoords[0] + "," +  comment.markerCoords[1] + "," + comment.title + ','					
			}
			console.log("TEST 145: " + coords.minx + " " + coords.miny + " " + coords.maxx + " " + coords.maxy)
			if (req.isAuthenticated()) {
			res.render('map_viewer.ejs', { boolean1: true, username: req.user.local.username, action: "/logout", actionName: "Logout", 
				message: req.flash('loginMessage'), userId: req.user.local.username, url: comment.url,
				coords: coords, markers: markers })
		} else {
			res.render('map_viewer.ejs', { boolean1: false, username: 'Anonymous', action: "#", actionName: "Login", 
				message: req.flash('loginMessage'), url: comment.url, coords: coords, markers: markers})
		} 

		})
		
	})

	//show FAQ page
	app.get('/faq', function(req,res) {
		if (req.isAuthenticated()) {
			res.render('faq.ejs', { userId: req.user.local.username, boolean1: true, username: req.user.local.username, action: "/logout", actionName: "Logout", 
				message: req.flash('loginMessage')  })
		} else {
			res.render('faq.ejs', { boolean1: false, username: 'Anonymous', action: "#", actionName: "Login", 
				message: req.flash('loginMessage') })
		} 
	})

	//show about page
	app.get('/about', function(req,res) {
		if (req.isAuthenticated()) {
			res.render('about.ejs', { userId: req.user.local.username, boolean1: true, username: req.user.local.username, action: "/logout", actionName: "Logout", 
				message: req.flash('loginMessage')  })
		} else {
			res.render('about.ejs', { boolean1: false, username: 'Anonymous', action: "#", actionName: "Login", 
				message: req.flash('loginMessage') })
		} 
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



