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
	var regex = new RegExp(req.query.q, 'i');
	
		if (req.query.count) {
			return Comment.find( { $or:[{ title: regex }, {text: regex}] }).limit(req.query.count).exec(function(err,q) {
				return res.send(q)
			})
	} else {
		return Comment.find( { $or:[{ title: regex }, {text: regex}] }, function(err,q) {
		res.send(q)
		});
	}	
})

router.post('/', function(req,res) {
	console.log(querystring.stringify(req.body));
	res.redirect('/api/v1/search?'+ querystring.stringify(req.body));
})


module.exports = router;