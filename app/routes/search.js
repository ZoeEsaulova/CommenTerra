var express = require('express');
var router = express.Router();
var Comment = require('../models/comment');
var querystring = require('querystring');
/*
router.get('/:keyword', function(req,res) {
    var regex = new RegExp(req.params.keyword, 'i');  // 'i' makes it case insensitive
    return Comment.find({ title: regex}, function(err,q){
        return res.send(q);
    });
});
*/
/* Loop
router.get('/search', function(req,res) {
	var regex = new RegExp(req.query.q, 'i');
	return Comment.find( { $or:[{ title: regex }, {text: regex}] }, function(err,q) {
		if (req.query.count) {
			var result = []
			for (i = 0; i < req.query.count; i++) { 
    			result.push(q[i])
			}
		res.contentType('application/json');
		res.send(result);
	} else {
		return res.send(q)
	}
	})
})
*/

/*
router.get('/', function(req,res) {
	res.send(req.query);
	//req.jsonp(req.query);
});
*/

router.get('/search', function(req,res) {
	var split = req.query.q.split(' ');
	var split2 = req.query.q.split('');
	var regex1 = new RegExp(split[0], 'i');
	var regex2 = new RegExp(split[1], 'i');

	var regex = new RegExp(req.query.q, 'i');
	
		if (req.query.count) {

		
		//all words search
		if ( split2[0]==='"' ) {
			var q2 = req.query.q.slice(1,split2.length-2)
			console.log("q2: " + q2)
			var regex2 = new RegExp(q2, 'i');
			return Comment.find( { $or:[{ title: regex2 }, {text: regex2}] }, 'title text').limit(req.query.count).exec(function(err,q) {
			return res.send(q);
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
		res.contentType('application/json');
		return res.send(result);
		})
	} else {
		
		//all words search
		if ( split2[0]==='"' ) {
			var q2 = req.query.q.slice(1,split2.length-2)
			console.log("q2: " + q2)
			var regex2 = new RegExp(q2, 'i');
			return Comment.find( { $or:[{ title: regex2 }, {text: regex2}] }, 'title text').exec(function(err,q) {
			return res.send(q);
		})
		}

		// one of the words serach
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
		res.contentType('application/json');
		return res.send(result);
		})
	}	
})

router.post('/', function(req,res) {
	console.log(querystring.stringify(req.body));
	res.redirect('/api/v1/search?'+ querystring.stringify(req.body));
})


module.exports = router;