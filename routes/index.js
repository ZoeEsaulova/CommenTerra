var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'CommenTerra' });
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

/* GET New User page. */
router.get('/newcomment', function(req, res) {
    res.render('newcomment', { title: 'Add New Comment' });
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    	// Get form values. These rely on the "name" attributes
    	var userName = req.body.username;
    	var userEmail = req.body.useremail;
	var userPasswort = req.body.passwort;
	//get model "User"
	var User = require('mongoose').model('User');
	//create new user document
	var newUser = new User({ username: userName, email: userEmail, passwort: userPasswort });
	
	/*Save new user in databse. New users will be saved in "users" collection of the "ComTerDB"
	You can check whether the user was saved using following commands in MongoDB shell:
	use ComTerDB
	db.users.find().pretty() */
	newUser.save(function (err) {
		if (err) return console.error(err);
		console.log("Saved!!!");
	});
});

/* POST to Add Comment Service */
router.post('/addcomment', function(req, res) {
	
        // Get form values. These rely on the "name" attributes
        var newTitle = req.body.title;
        //get "Comment" model
	var Comment = require('mongoose').model('Comment');
	//create new comment document
	var newComment = new Comment({ title: newTitle });
	
	/*Save new comment in databse. New comments will be saved in "comments" collection of the "ComTerDB"
	You can check whether the comment was saved using following commands in MongoDB shell:
	use ComTerDB
	db.comments.find().pretty() */
	newComment.save(function (err) {
		if (err) return console.error(err);
		console.log("Comment Saved!!!");
	});
	
	console.log(newTitle);
	
});

module.exports = router;
