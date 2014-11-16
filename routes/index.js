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

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;
	var userPasswort = req.body.passwort;
	var User = require('mongoose').model('User');
	var newUser = new User({ username: userName, email: userEmail, passwort: userPasswort });
	newUser.save(function (err) {
		if (err) return console.error(err);
		console.log("Saved!!!");
	});
	console.log(userName);
	console.log(userEmail);
	console.log(userPasswort);
	
});

/* POST to Add Comment Service */
router.post('/addcomment', function(req, res) {
//var monk = require('monk');
//var db = monk('localhost:27017/ComTerDB');
	// Set our internal DB variable
    //var db = req.db;
	//var collection = db.get('comments');
    // Get our form values. These rely on the "name" attributes
    var newTitle = req.body.title;
	var Comment = require('mongoose').model('Comment');
	var newComment = new Comment({ title: newTitle });
	newComment.save(function (err) {
		if (err) return console.error(err);
		console.log("Comment Saved!!!");
	});
	//collection.insert(newComment);
	
	console.log(newTitle);
	
});

module.exports = router;
