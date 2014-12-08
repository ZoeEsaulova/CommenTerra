module.exports = function(app, passport) {

// normal routes ===============================================================

	// show the home page (will also have our login links)
	app.get('/', function(req, res) {
		if (req.isAuthenticated()) {
			res.render('Home.ejs', { username: req.user.local.username, action: "/logout", actionName: "Logout"  });
		} else {
			res.render('Home.ejs', { username: 'Anonymous', action: "/login", actionName: "Login" });
		}
		
	});

	// PROFILE SECTION =========================
	app.get('/profile', function(req, res) {
		res.render('profile.ejs', {
			user : req.user
		});
	});

	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	/*
	app.get('/home', function(req, res) {
		res.render('Home.ejs');
	}); */
	
	

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

	// locally --------------------------------
		// LOGIN ===============================
		// show the login form
		app.get('/login', function(req, res) {
			res.render('login.ejs', { message: req.flash('loginMessage') });
		});

		// process the login form
		app.post('/login', passport.authenticate('local-login', {
			successRedirect : '/', // redirect to the secure profile section
			failureRedirect : '/login', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

		// SIGNUP =================================
		// show the signup form
		app.get('/signup', function(req, res) {
			res.render('signup.ejs', { message: req.flash('signupMessage') });
		});

		// process the signup form
		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/signup', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

/*
		// process the signup form
		app.post('/home/signup', passport.authenticate('local-signup', {
			console.log("Ich bin in post Methode")			
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/signup', // redirect back to the signup page if there is an error

			failureFlash : true // allow flash messages
		}));
*/
		
		// process the add comment form
		/*
		app.post('/addcomment', function(req, res) {
			// Get form values. These rely on the "name" attributes
			var newTitle = req.body.title;
			//get "Comment" model
			var rekuire = require('rekuire');
			var Comment = rekuire('models/comment');
			if (req.isAuthenticated()) {
				//create new comment document
				console.log(req.user.local.email);
				console.log(req.user.local.username);
				var newComment = new Comment({ title: newTitle, author: req.user._id });
			} else {
				var newComment = new Comment({ title: newTitle });
			}
			/*Save new comment in databse. New comments will be saved in "comments" collection of the "ComTerDB"
			You can check whether the comment was saved using following commands in MongoDB shell:
			use ComTerDB
			db.comments.find().pretty() */
			/*
			newComment.save(function (err) {
				if (err) return console.error(err);
				console.log("Comment Saved!!!");
			});
			res.redirect('/profile');
		}); */

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

	// locally --------------------------------
		app.get('/connect/local', function(req, res) {
			res.render('connect-local.ejs', { message: req.flash('loginMessage') });
		});
		app.post('/connect/local', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

	// local -----------------------------------
	app.get('/unlink/local', isLoggedIn, function(req, res) {
		var user            = req.user;
		user.local.email    = undefined;
		user.local.password = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}



