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
	// placeholder
	var keywords = "search term"
	var url = "search for url"
	var user = "search for user"
	var startdate = "time frame (start)"
	var enddate = "time frame (end)"
	var gps = "coordinates (in decimal degrees)"
	var score = 0
	if (req.query.q) {
		keywords = req.query.q
	} 
	if (req.query.url) {
		url = req.query.url
	}
	if (req.query.authorName) {
		user = req.query.authorName
	}
	if (req.query.gps) {
		gps = req.query.gps
	}
 			
			request(
		    	{ method: 'GET'
		    	, uri: "http://giv-geosoft2b.uni-muenster.de/api/v1/search" + "?" + querystring.stringify(req.query)
		    	//, gzip: true
		    	}
		  	, function (error, response, body) {
		  		

		  		console.log(body)
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
			    query = Comment.find( { $and: [{comment: undefined}, {$or:[{ title: regex2 }, {text: regex2}, {url: regex2}]}]  }).
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
				query = query.where( { $or:[{ title: regexX }, {text: regexX}, {url: regexX}]  })					
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
		var markers = ""
				for (var i=0; i<comments.length; i++) {
					if (comments[i].markerCoords[0]) {
						markers = markers +  comments[i].markerCoords[0] + "," +  comments[i].markerCoords[1] + "," + comments[i].title 
						
					}
				}
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
				markers: markers,
				score:score,
				query: querystring.stringify(req.query),
			//update placeholder 
				keywordsPH: keywords,
				urlPH: url,
				startdatePH: startdate,
				enddatePH: enddate,
				gpsPH: gps,
				userPH: user})
		} else {
			res.render('advanced_search.ejs', { 
				comments: comments, 
				metamaps: metamaps,
				boolean1: false, 
				username: 'Anonymous', 
				action: "#", 
				actionName: "Login", 
				markers: markers,
				message: req.flash('loginMessage'),
			    query: querystring.stringify(req.query),
			    //update placeholder 
				keywordsPH: keywords,
				urlPH: url,
				score: score,
				startdatePH: startdate,
				enddatePH: enddate,
				gpsPH: gps,
				userPH: user })
		}
	})
	})		
})
// search functionality
router.get('/search', function(req,res) {
	// placeholder
	var keywords = "search term"
	var url = "search for url"
	var user = "search for user"
	var startdate = "time frame (start)"
	var enddate = "time frame (end)"
	var gps = "coordinates (in decimal degrees)"
	var score = 0
	if (req.query.q) {
		keywords = req.query.q
	} 
	if (req.query.url) {
		url = req.query.url
	}
	if (req.query.authorName) {
		user = req.query.authorName
	}
	if (req.query.gps) {
		gps = req.query.gps
	}
	if (req.query.datasetRating) {
		score = req.query.datasetRating
	}
	
	// keyword search
	if (!req.query.q) {	
	
		var query = Comment.find({ comment: undefined }).populate('user').populate('comments').populate('dataset')
		if (req.query.datasetRating) {
			query.where('datasetRating').equals(req.query.datasetRating)
		}

		if (req.query.url) {
			var regexY = new RegExp(req.query.url, 'i');
			query.where({ url: regexY })
		}
		if (req.query.authorName) {
			var regexU = new RegExp(req.query.url, 'i');
			query.where({ authorName: regexU })
		}

			if (req.query.startdate && req.query.enddate) {
				startdate = req.query.startdate
				enddate = req.query.enddate
				console.log("Startdate?")
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
			    query = Comment.find( { $and: [{comment: undefined}, {$or:[{ title: regex2 }, {text: regex2}, {url: regex2}]}]  }).
			    populate('user').populate('dataset').populate('comments')
		} else {
// one of the words search
		var query = Comment.find({ comment: undefined }).populate('user').populate('dataset').populate('comments')
			for (j = 0; j < split.length; j++) { 
				var regexX = new RegExp(split[j], 'i');
				query = query.where( { $or:[{ title: regexX }, {text: regexX}, {url: regexX}]  })					
			}
		}

		
			if (req.query.startdate && req.query.enddate) {
				startdate = req.query.startdate
				enddate = req.query.enddate
				var splitdate1 = req.query.startdate.split('/')
				var splitdate2 = req.query.enddate.split('/')
				var start = new Date(splitdate1[2], parseInt(splitdate1[0])-1, parseInt(splitdate1[1])+1)
				var end = new Date(splitdate2[2], parseInt(splitdate2[0])-1, parseInt(splitdate2[1])+1)

				query.where({$or: [ { "startdate": {"$gte": start, "$lte": end } }, { $and: [ { "startdate": { "$lte": start } }, { "enddate": { "$gte": start } } ] } ] }  )
						
			}
			
			if (req.query.datasetRating) {
			query.where('datasetRating').equals(req.query.datasetRating)
		}

		if (req.query.url) {
			var regexY = new RegExp(req.query.url, 'i');
			query.where({ url: regexY })
		}
		if (req.query.authorName) {
			var regexU = new RegExp(req.query.url, 'i');
			query.where({ authorName: regexU })
		}
	}

	if (req.query.count) {
		query.limit(Number(req.query.count))
	}	 
				
	// show advanced_search page with search results
	query.sort(' -date').exec(function(err, comments) {
		if (comments) {
			var markers = ""
				for (var i=0; i<comments.length; i++) {
					if (comments[i].markerCoords[0]) {
						markers = markers +  comments[i].markerCoords[0] + "," +  comments[i].markerCoords[1] + "," + comments[i].title 
						
					}
				}
		}
		
		if (req.isAuthenticated()) {
			res.render('advanced_search.ejs', { 
				comments: comments, 
				metamaps: [],
				boolean1: true, 
				username: req.user.local.username, 
				userId: req.user.local.username,
				action: "/logout", 
				actionName: "Logout", 
				markers: markers,
				message: req.flash('loginMessage'),
				query: querystring.stringify(req.query),
				//update placeholder 
				keywordsPH: keywords,
				urlPH: url,
				startdatePH: startdate,
				enddatePH: enddate,
				gpsPH: gps,
				userPH: user,
				score: score
				 })
		} else {
			res.render('advanced_search.ejs', { 
				comments: comments, 
				boolean1: false, 
				metamaps: [],
				username: 'Anonymous', 
				action: "#", 
				actionName: "Login", 
				markers: markers,
				message: req.flash('loginMessage'),
			    query: querystring.stringify(req.query),
			//update placeholder 
				keywordsPH: keywords,
				urlPH: url,
				startdatePH: startdate,
				enddatePH: enddate,
				gpsPH: gps,
				userPH: user,
				score: score
			})
		}
	})
})

//get all search parameters and add them to search permalink
router.post('/', function(req,res) {
	res.redirect('/api/v1/search?'+ querystring.stringify(req.body))
})


module.exports = router