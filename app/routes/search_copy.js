/* The route used for search */

var express = require('express'),
 	router = express.Router(),
 	Comment = require('../models/comment'),
 	_ = require('underscore'),
 	querystring = require('querystring');

router.get('/searchapi', function(req, res) {
	if (req.query.q) {
		var split = req.query.q.split(' ')

		// one of the words search
		var query = Comment.find({ comment: undefined })
			for (j = 0; j < split.length; j++) { 
				var regexX = new RegExp(split[j], 'i');
				query = query.where( { $or:[{ title: regexX }, { text: regexX } ]  })					
			}
		if (req.query.count) {
		query.limit(Number(req.query.count))
		}
		query.sort(' -date').exec(function(err, comments) {
			res.jsonp({ resource: "http://giv-geosoft2a.uni-muenster.de/", comments: comments})	
		})	
	} else {
		res.send({})
	}
})

router.get('/simplesearch', function(req, res) { 
 			
			request(
		    	{ method: 'GET'
		    	, uri: "http://giv-geosoft2b.uni-muenster.de/api/v1/search" + "?" + querystring.stringify(req.query)
		    	//, gzip: true
		    	}
		  	, function (error, response, body) {
		  		var metamaps = []
		  		var json = JSON.parse(body)
		  		metamaps = json.comments
		  		console.log(metamaps)

				var split = req.query.q.split(' '),
	    split2 = req.query.q.split(''),
		regex = new RegExp(req.query.q, 'i');

		//exact phrase search (e.g. "Germany map")
		if ( split2[0]==='"' ) {
			var q2 = req.query.q.slice(1,split2.length-2),
			    regex2 = new RegExp(q2, 'i');
			    query = Comment.find( { $and: [{comment: undefined}, {$or:[{ title: regex2 }, {text: regex2}]}]  }).
			    populate('user').populate('dataset').populate('comments')

			 if (req.query.startdate && req.query.enddate) {
				var splitdate1 = req.query.startdate.split('/')
				var splitdate2 = req.query.enddate.split('/')
				var start = new Date(splitdate1[2], parseInt(splitdate1[0])-1, parseInt(splitdate1[1])+1)
				var end = new Date(splitdate2[2], parseInt(splitdate2[0])-1, parseInt(splitdate2[1])+1)
				query.where({$or: [ { "startdate": {"$gte": start, "$lte": end } }, { $and: [ { "startdate": { "$lte": start } }, { "enddate": { "$gte": start } } ] } ] }  )
						
			}

		} else {

		// one of the words search
		var query = Comment.find({ comment: undefined }).populate('user').populate('dataset').populate('comments')
			if (req.query.startdate && req.query.enddate) {
				var splitdate1 = req.query.startdate.split('/')
				var splitdate2 = req.query.enddate.split('/')
				var start = new Date(splitdate1[2], parseInt(splitdate1[0])-1, parseInt(splitdate1[1])+1)
				var end = new Date(splitdate2[2], parseInt(splitdate2[0])-1, parseInt(splitdate2[1])+1)

				query.where({$or: [ { "startdate": {"$gte": start, "$lte": end } }, { $and: [ { "startdate": { "$lte": start } }, { "enddate": { "$gte": start } } ] } ] }  )
						
			}
			for (j = 0; j < split.length; j++) { 
				var regexX = new RegExp(split[j], 'i');
				query = query.where( { $or:[{ title: regexX }, {text: regexX}]  })					
			}
			for (var key in req.query) {	
				if (key!="startdate" && key!="enddate" && key!="count" && key!="q" && req.query[key]) {
					query.where(key).equals(req.query[key])
				}	
		
			}

		}
	if (req.query.count) {
		query.limit(Number(req.query.count))
	}	 
			
	
	
	// show advanced_search page with search results
	query.sort(' -date').exec(function(err, comments) {
		if (req.isAuthenticated()) {
			res.render('advanced_search.ejs', { 
				comments: comments, 
				metamaps: metamaps,
				boolean1: true, 
				username: req.user.local.username, 
				userId: req.user.local.username,
				action: "/logout", 
				actionName: "Logout", 
				message: req.flash('loginMessage'),
				query: querystring.stringify(req.query) })
		} else {
			res.render('advanced_search.ejs', { 
				comments: comments, 
				metamaps: metamaps,
				boolean1: false, 
				username: 'Anonymous', 
				action: "#", 
				actionName: "Login", 
				message: req.flash('loginMessage'),
			    query: querystring.stringify(req.query) })
		}
	})
	})		
})
// search functionality
router.get('/search', function(req,res) {

	// keyword search
	if (!req.query.q) {		
		var query = Comment.find({ comment: undefined }).populate('user').populate('comments').populate('dataset')
		for (var key in req.query) {			
			if (key!="count" && key!="startdate" && key!="enddate" && req.query[key]) {
				query.where(key).equals(req.query[key])
			}		
		}
			if (req.query.startdate && req.query.enddate) {
				var splitdate1 = req.query.startdate.split('/')
				var splitdate2 = req.query.enddate.split('/')
				var start = new Date(splitdate1[2], parseInt(splitdate1[0])-1, parseInt(splitdate1[1])+1)
				var end = new Date(splitdate2[2], parseInt(splitdate2[0])-1, parseInt(splitdate2[1])+1)
				console.log("Start: " + start + " End: " + end)
				query.where({$or: [ { "startdate": {"$gte": start, "$lte": end } }, { $and: [ { "startdate": { "$lte": start } }, { "enddate": { "$gte": start } } ] } ] }  )
						
			}
		
	// search for keywords, url, user
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

			 if (req.query.startdate && req.query.enddate) {
				var splitdate1 = req.query.startdate.split('/')
				var splitdate2 = req.query.enddate.split('/')
				var start = new Date(splitdate1[2], parseInt(splitdate1[0])-1, parseInt(splitdate1[1])+1)
				var end = new Date(splitdate2[2], parseInt(splitdate2[0])-1, parseInt(splitdate2[1])+1)
				query.where({$or: [ { "startdate": {"$gte": start, "$lte": end } }, { $and: [ { "startdate": { "$lte": start } }, { "enddate": { "$gte": start } } ] } ] }  )
						
			}

		} else {

		// one of the words search
		var query = Comment.find({ comment: undefined }).populate('user').populate('dataset').populate('comments')
			if (req.query.startdate && req.query.enddate) {
				var splitdate1 = req.query.startdate.split('/')
				var splitdate2 = req.query.enddate.split('/')
				var start = new Date(splitdate1[2], parseInt(splitdate1[0])-1, parseInt(splitdate1[1])+1)
				var end = new Date(splitdate2[2], parseInt(splitdate2[0])-1, parseInt(splitdate2[1])+1)

				query.where({$or: [ { "startdate": {"$gte": start, "$lte": end } }, { $and: [ { "startdate": { "$lte": start } }, { "enddate": { "$gte": start } } ] } ] }  )
						
			}
			for (j = 0; j < split.length; j++) { 
				var regexX = new RegExp(split[j], 'i');
				query = query.where( { $or:[{ title: regexX }, {text: regexX}]  })					
			}
			for (var key in req.query) {	
				if (key!="startdate" && key!="enddate" && key!="count" && key!="q" && req.query[key]) {
					query.where(key).equals(req.query[key])
				}	
		
			}

		}
	}



	if (req.query.count) {
		query.limit(Number(req.query.count))
	}	 
			
	
	
	// show advanced_search page with search results
	query.sort(' -date').exec(function(err, comments) {
		if (req.isAuthenticated()) {
			res.render('advanced_search.ejs', { 
				comments: comments, 
				metamaps: [],
				boolean1: true, 
				username: req.user.local.username, 
				userId: req.user.local.username,
				action: "/logout", 
				actionName: "Logout", 
				message: req.flash('loginMessage'),
				query: querystring.stringify(req.query) })
		} else {
			res.render('advanced_search.ejs', { 
				comments: comments, 
				boolean1: false, 
				metamaps: [],
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