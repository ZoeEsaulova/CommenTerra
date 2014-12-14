/* The route used for search */

var express = require('express'),
 	router = express.Router(),
 	Comment = require('../models/comment'),
 	querystring = require('querystring');

router.get('/search', function(req,res) {
	var split = req.query.q.split(' '),
	    split2 = req.query.q.split(''),
		regex = new RegExp(req.query.q, 'i');
	
	if (req.query.count) {
		
		//exact phrase search (e.g. "Germany map")
		if ( split2[0]==='"' ) {
			var q2 = req.query.q.slice(1,split2.length-2), //remove quotation marks from request string
			    regex2 = new RegExp(q2, 'i');
			return Comment.find( { $or:[{ title: regex2 }, {text: regex2}] }, 'title text').limit(req.query.count).exec(function(err,q) {
			return res.send(q)
		})
		}

		// one of the words serach
		var result = [];
		for (j = 0; j < split.length; j++) { 
			var regexX = new RegExp(split[j], 'i');
    		Comment.find( { $or:[ { title: regexX }, { text: regexX }] }, 'title text').limit(req.query.count).exec(function(err,q) {
				for (i = 0; i < q.length; i++) { 
    				result.push(q[i])
				}				
			})
		}
		return Comment.find( { $or:[{ title: regex }, {text: regex}] }, 'title text').exec(function(err,q) {
			res.contentType('application/json')
			return res.send(result)
		})
		//without "count" parameter 
	} else {

		//exact phrase search (e.g. "Germany map")
		if ( split2[0]==='"' ) {
			var q2 = req.query.q.slice(1,split2.length-2),
			    regex2 = new RegExp(q2, 'i');
			return Comment.find( { $or:[{ title: regex2 }, {text: regex2}] }, 'title text').exec(function(err,q) {
			return res.send(q)
		})
		}
		// one of the words search
		var result = [];
		for (j = 0; j < split.length; j++) { 
			var regexX = new RegExp(split[j], 'i');
    		Comment.find( { $or:[ { title: regexX }, { text: regexX }] }, 'title text').exec(function(err,q) {
				for (i = 0; i < q.length; i++) { 
    				result.push(q[i])
				}				
			})
		}
		return Comment.find( { $or:[{ title: regex }, {text: regex}] }, 'title text').exec(function(err,q) {
			res.contentType('application/json')
			return res.send(result)
		})
	}	
})

//get all search parameters and add them to search permalink
router.post('/', function(req,res) {
	console.log(querystring.stringify(req.body))
	res.redirect('/api/v1/search?'+ querystring.stringify(req.body))
})


module.exports = router