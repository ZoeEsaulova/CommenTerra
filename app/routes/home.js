/* The main route used for home page and authentication */

module.exports = function(app, passport) {

// normal routes ===============================================================

	// show the home page. The contant of the home page depends on whether the user is authenticatedd
	app.get('/', function(req, res) {
		
		if (req.isAuthenticated()) {
			res.render('Home.ejs', { boolean1: true, username: req.user.local.username, action: "/logout", actionName: "Logout", 
				message: req.flash('loginMessage')  })
		} else {
			res.render('Home.ejs', { boolean1: false, username: 'Anonymous', action: "#", actionName: "Login", 
				message: req.flash('loginMessage') })
		}  
		
	});

	// show the profile page
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user
		});
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

	// ADVANCED SEARCH
	app.get('/advancedsearch', function(req,res) {
		if (req.isAuthenticated()) {
			res.render('advanced_search.ejs', { boolean1: true, username: req.user.local.username, action: "/logout", actionName: "Logout", 
				message: req.flash('loginMessage')  })
		} else {
			res.render('advanced_search.ejs', { boolean1: false, username: 'Anonymous', action: "#", actionName: "Login", 
				message: req.flash('loginMessage') })
		} 
	})

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



