/* The route used for search */

var express = require('express'),
 	router = express.Router(),
 	Comment = require('../models/comment'),
 	_ = require('underscore'),
 	querystring = require('querystring');
//set statoc content
router.use(express.static(__dirname + '/public'));


router.get('/search', function(req,res) {

	
	if (!req.query.q) {
		
		var query = Comment.find({ comment: undefined }).populate('user').populate('dataset').populate('comments')
			for (var key in req.query) {			
				if (key!="count" && req.query[key]) {
					query.where(key).equals(req.query[key])
				}				
			}
	} else {
	var split = req.query.q.split(' '),
	    split2 = req.query.q.split(''),
		regex = new RegExp(req.query.q, 'i');
		//exact phrase search (e.g. "Germany map")
		if ( split2[0]==='"' ) {
			var q2 = req.query.q.slice(1,split2.length-2),
			    regex2 = new RegExp(q2, 'i');
			    query = Comment.find( { $and: [{comment: undefined}, {$or:[{ title: regex2 }, {text: regex2}]}]  }).
			    populate('user').populate('dataset').populate('comments')
		} else {
		// one of the words search
		//var result = [];
		var query = Comment.find({ comment: undefined }).populate('user').populate('dataset').populate('comments')
		// MULTIPLE KEYWORDS SEARCH NOT IMPLEMENTED YET
			for (j = 0; j < split.length; j++) { 
			var regexX = new RegExp(split[j], 'i');
			query = query.where( { $or:[{ title: regexX }, {text: regexX}]  })					
			}
			for (var key in req.query) {	
				if (key!="count" && key!="q" && req.query[key]) {
					query.where(key).equals(req.query[key])
				}				
			}
		}
	}
	

	if (req.query.count) {
		query.limit(Number(req.query.count))
	}	 
	
	query.sort(' -date').exec(function(err, comments) {
		if (req.isAuthenticated()) {
			res.render('advanced_search.ejs', { 
				comments: comments, 
				boolean1: true, 
				username: req.user.local.username, 
				action: "/logout", 
				actionName: "Logout", 
				message: req.flash('loginMessage'),
				query: querystring.stringify(req.query) })
		} else {
			res.render('advanced_search.ejs', { 
				comments: comments, 
				boolean1: false, 
				username: 'Anonymous', 
				action: "#", 
				actionName: "Login", 
				message: req.flash('loginMessage'),
			    query: querystring.stringify(req.query) })
		}
	})
	})
//get all search parameters and add them to search permalink
router.post('/', function(req,res) {
	res.redirect('/api/v1/search?'+ querystring.stringify(req.body))
})


module.exports = router