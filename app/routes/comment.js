/* The route used to add, delete, get comments */

var express = require('express'),
	router = express.Router(),		
	Comment = require('../models/comment'),
	User = require('../models/user'),
	Dataset = require('../models/dataset'),
 	_ = require('underscore'),
 	querystring = require('querystring');
 	request = require('request'),
 	xml2js = require('xml2js'),
	resp = {},
	resptext = "No properties found. Check the format of your url",
	coords = { minx: "", miny: "", maxx: "", maxy: "" };

// Thumb up/down rating
router.get('/votes', function(req,res) {
	Comment.findOne({ _id: req.query.id }).exec(function(err, comment) {
		User.findOne({ _id: req.user._id }).exec(function(err, user) {
			User.findOne({ "local.username": comment.authorName }).exec(function(err, author) { 				
			var save = true
			var weight = ""
			if (user.status=="Expert") {
				weight = 3
			} else {
				weight = 1
			}
			for (var i=0; i<user.votedUp.length; i++) {			
					if (JSON.stringify(comment._id)==JSON.stringify(user.votedUp[i])) {
						save = false
						break
					} 
			}
			for (var i=0; i<user.votedDown.length; i++) {
						if (JSON.stringify(comment._id)==JSON.stringify(user.votedDown[i])) {
							save = false
							break
						} 
			}
			if (author && save) {
				if (req.query.action=="up") {
						author.upvotes = author.upvotes + weight
				}
				if (req.query.action=="down") {
						author.downvotes = author.downvotes - weight 
			}
				author.save()
			}

			if (req.query.action=="up") {
							 
				if (save) { 
					user.votedUp.push(comment)
					user.save()
					comment.upvotes = comment.upvotes + weight
					comment.save()
					res.send(comment.upvotes.toString())
				} else {
					res.send(comment.upvotes.toString())
				}
				
			}

			if (req.query.action=="down") {
					 
					if (save) { 
					user.votedDown.push(comment)
					user.save()
					comment.downvotes = comment.downvotes - weight
					comment.save()
					res.send(comment.downvotes.toString())
				} else {
					res.send(comment.downvotes.toString())
				}
			}		
	})
})
})
})
/* PARSER 
*  wms example: http://www.wms.nrw.de/umwelt/boden/stobo?
*  wfs example: 
*/
router.get('/', function(req,res) {
 	var url = ""
 	resptext = "No properties found. Check the format of your url"
 	var format = req.query.select
 	var version = "VERSION"
 	/*
 	if (req.query.select=="wcs") {
 		version = "AcceptVersions"
 	}*/
 	// check the url format, append an GetCapability request if necessary
 	if (req.query.url.indexOf("kml")!=(-1)) {
 		url = req.query.url
 	} else if (req.query.url.indexOf("?")==(-1)) {
		url = req.query.url + "?REQUEST=GetCapabilities&" + version + "=1.1.0&SERVICE=" + format 
	} else if (!(req.query.url.indexOf("GetCapabilities")==(-1))) {
		url = req.query.url
	} else {
		url = req.query.url.slice(0,req.query.url.indexOf("?")) + "?REQUEST=GetCapabilities&" + version + "=1.1.0&SERVICE=" + format 
	}

	// send an GetCapabilities request 
  	request(
    	{ method: 'GET'
    	, uri: url
    	, gzip: true
    	}
  	, function (error, response, body) {
  		
  		//console.log(body)
  		if (!error && body) {
  			console.log(body)
  		  // Parse the response XML-data ("body") as JSON, stringify JSON and save in resptext
		  var parser = new xml2js.Parser({explicitArray : false});
		  parser.parseString(body, function(err,result) {
		  	
			  //traverse(result)
			  if (result) {
			  	findAttr(result, format)
				if (resp.LatLonBoundingBox) {
					coords.minx = resp.LatLonBoundingBox.$.minx
					coords.miny = resp.LatLonBoundingBox.$.miny
					coords.maxx = resp.LatLonBoundingBox.$.maxx
					coords.maxy = resp.LatLonBoundingBox.$.maxy
				} if (resp.LowerCorner) {
					coords.minx = resp.LowerCorner.split(' ')[0]
					coords.miny = resp.LowerCorner.split(' ')[1]
					coords.maxx = resp.UpperCorner.split(' ')[0]
					coords.maxy = resp.UpperCorner.split(' ')[1]
				}
				var newString = JSON.stringify(result);
				var replace1 = newString.replace(/{/g, "\n { \n")
				var replace2 = replace1.replace(/}/g, "\n }")
				var splitten = replace2.split(",");
				resptext = "";
				for(var i = 0; i < splitten.length; i++){
					resptext += splitten[i]  + "\n";
			  } 
  		  })
  		} 
	  	resp = {}
	  if (req.isAuthenticated()) {
	    res.render('new_comment.ejs', { 
	    	boolean1: true, 
	    	username: req.user.local.username,
	    	userId:  req.user.local.username,
	    	coords: coords,
	    	action: "/logout", 
	    	actionName: "Logout", 
			message: req.flash('loginMessage'), 
			urlValue: "", 
			addAction: "/comments/add", 
			// send response to clinet
			XMLresponse: resptext ,
			urlResult: req.query.url }) }
	   else {
		 res.render('new_comment.ejs', { 
	    		boolean1: false, 
	    		username: 'Anonymous', 
	    		action: "#", 
	    		actionName: "Login", 
	    		coords: coords,
				message: req.flash('loginMessage'), 
				urlValue: "", 
				addAction: "/comments/add", 
				// send response to clinet
				XMLresponse: resptext ,
				urlResult: req.query.url })	
		}
	})
})

// show the new_comment page
router.get('/add/:url?', function(req, res) {
		var url = ""

		if (req.params.url) { 
			readonly = true; 
			url = req.params.url}
		if (req.isAuthenticated()) {
			res.render('new_comment.ejs', { userId: req.user.local.username, boolean1: true, username: req.user.local.username, action: "/logout", actionName: "Logout", 
				message: req.flash('loginMessage'), urlValue: url, addAction: "/comments/add", XMLresponse: "",
				urlResult: "Your URL will be shown here after you validate it!" })
		} else {
			res.render('new_comment.ejs', { boolean1: false, username: 'Anonymous', action: "#", actionName: "Login", 
				message: req.flash('loginMessage'), urlValue: url, addAction: "/comments/add", XMLresponse: "",
				urlResult: "Your URL will be shown here after you validate it!" })
		}
});

// add a new comment with an URL   TO BE UPDATED111 - URL PARAMETER
router.post('/add', function(req, res) {
	
	// Get form values. These rely on the "name" attributes
	    if (req.body.startdate && req.body.enddate) {
			var splitdate1 = req.body.startdate.split('/')
			var splitdate2 = req.body.enddate.split('/')
			var startdate1 = new Date(splitdate1[2], parseInt(splitdate1[0])-1, parseInt(splitdate1[1])+1)
			var enddate1 = new Date(splitdate2[2], parseInt(splitdate2[0])-1, parseInt(splitdate2[1])+1)
	    } else if ( req.body.startdate) {
	    	var splitdate1 = req.body.startdate.split('/')
			var startdate1 = new Date(splitdate1[2], parseInt(splitdate1[0])-1, parseInt(splitdate1[1])+1)
			var enddate1 = new Date(splitdate1[2], parseInt(splitdate1[0])-1, parseInt(splitdate1[1])+1)
	    } else if ( req.body.enddate) {
			var splitdate2 = req.body.enddate.split('/')
			var startdate1 = new Date(splitdate2[2], parseInt(splitdate2[0])-1, parseInt(splitdate2[1])+1)
			var enddate1 = new Date(splitdate2[2], parseInt(splitdate2[0])-1, parseInt(splitdate2[1])+1)
	    } else {
	    	var startdate1 = new Date()
	    	var enddate1 = new Date()
	    	//startdate1.setHours(0,0,0,0)
	    	//enddate1.setHours(0,0,0,0)
	    	startdate1 = new Date(startdate1.getUTCFullYear(), parseInt(startdate1.getUTCMonth()), startdate1.getUTCDate()+1)
	    	enddate1 = new Date(enddate1.getUTCFullYear(), parseInt(enddate1.getUTCMonth()), enddate1.getUTCDate()+1)
	    	
	    }
	    var newTitle = req.body.title,
	    	newUrl = req.body.url,
			newText = req.body.text,
			boundingBox = [],
			markerCoords = [],
			markerX = 0,
			markerY = 0,
			rating = 0,
			datasetRating = 0,
			newDataset = "";

			if (req.body.rectangle) {
				coords2 = createString(req.body.rectangle)
				console.log("coords: " + coords.minx + " " + coords.miny + " " + coords.maxx + " " + coords.maxy)
				coords = {}
				coords["minx"] = coords2[1]
				coords["miny"] = coords2[0]
				coords["maxx"] = coords2[5]
				coords["maxy"] = coords2[2]
				console.log("coords: " + coords.minx + " " + coords.miny + " " + coords.maxx + " " + coords.maxy)
			}
			if (req.body.rating) {
				rating = Number(req.body.rating)
				datasetRating = Number(req.body.rating)
			}
			if (coords.minx) {
				boundingBox = [ Number(coords.minx), Number(coords.miny),  Number(coords.maxx), Number(coords.maxy) ]
				markerCoords = [ Number(coords.minx) + (Number(coords.maxx) - Number(coords.minx))/2,
			 					Number(coords.miny) + (Number(coords.maxy) - Number(coords.miny))/2 ]
			 markerX = markerCoords[0]
			 markerY = markerCoords[1]

			}			    	
	    	coords = {}
		
		if (req.isAuthenticated()) {

        Dataset.findOne({ url: newUrl }).exec(function(err, dataset) {
			if (!dataset) {
				newDataset = new Dataset({ url: newUrl, rating: rating })
        		newDataset.save()
				//create new comment
				if (markerCoords.length>0) {
					var newComment = new Comment({ 
					title: newTitle, 
					text: newText, 
					user: req.user._id,
		 			dataset: newDataset, 
		 			datasetRating: datasetRating,
		 			authorName: req.user.local.username, 
		 			url: newUrl,
		 			markerCoords: markerCoords,
		 			markerX: markerX,
		 			markerY: markerY,
		 			boundingBox: boundingBox,
		 			startdate: startdate1,
        			enddate: enddate1 })
				} else {
					var newComment = new Comment({ 
					title: newTitle, 
					text: newText, 
					user: req.user._id,
		 			dataset: newDataset, 
		 			datasetRating: datasetRating,
		 			authorName: req.user.local.username, 
		 			url: newUrl,
		 			startdate: startdate1,
        			enddate: enddate1 })

				}
				
				//save the comment in the database
				newComment.save(function (err) {
					if (err) return console.error(err)
				});
				User.findOne({ _id: req.user._id }).exec(function(err, user) {
					user.posts.push(newComment)
					user.save()
				})
				newDataset.comments.push(newComment)
				newDataset.save()
				res.redirect('/')
			} else {
				if (rating!=0) {
					dataset.rating = Math.round((dataset.rating + rating) / 2)
				} 				
				datasetRating = dataset.rating
				//create new comment
				if (markerCoords.length>0) {
					var newComment = new Comment({ 
					title: newTitle, 
					text: newText, 
					user: req.user._id,
				 	dataset: dataset, 
				 	datasetRating: datasetRating,
				 	authorName: req.user.local.username,
				 	markerCoords: markerCoords, 
				 	markerX: markerX,
		 			markerY: markerY,
				 	boundingBox: boundingBox,
				 	datasetRating: datasetRating,
				 	url: newUrl, startdate: startdate1, enddate: enddate1})
				} else {
					var newComment = new Comment({ 
					title: newTitle, 
					text: newText, 
					user: req.user._id,
				 	dataset: dataset, 
				 	datasetRating: datasetRating,
				 	authorName: req.user.local.username,
				 	url: newUrl, startdate: startdate1, enddate: enddate1})

				}
				
				//save the comment in the database
				newComment.save(function (err) {
					if (err) return console.error(err)
				});
				User.findOne({ _id: req.user._id }).exec(function(err, user) {
					user.posts.push(newComment)
					user.save()
				})
				dataset.comments.push(newComment)
				dataset.save()
				res.redirect('/')
			}
	    });	
	// if not authenticated:
	} else {

        Dataset.findOne({ url: newUrl }).exec(function(err, dataset) {
			if (!dataset) {
				newDataset = new Dataset({ url: newUrl, rating: rating  })
        		newDataset.save()

        		if (markerCoords.length>0) {
        			var newComment = new Comment({ 
        			title: newTitle, 
        			text: newText, 
        			dataset: newDataset, 
        			url: newUrl,
        			datasetRating: datasetRating,
        			startdate: startdate1,
        			enddate: enddate1,
        			markerCoords: markerCoords,
        			boundingBox: boundingBox

        		})
        		} else {
        			var newComment = new Comment({ 
        			title: newTitle, 
        			text: newText, 
        			dataset: newDataset, 
        			url: newUrl,
        			datasetRating: datasetRating,
        			startdate: startdate1,
        			enddate: enddate1
        		})
        		}
        		
				newComment.save(function (err) {
					if (err) return console.error(err)		
				})
				newDataset.comments.push(newComment)
				newDataset.save()
				res.redirect('/')
			} else {
				if (rating!=0) {
					dataset.rating = Math.round((dataset.rating + rating) / 2)
				}			
				datasetRating = dataset.rating
				if (markerCoords.length>0) {

					
					var newComment = new Comment({ title: newTitle, text: newText, dataset: dataset, url: newUrl, 
				startdate: startdate1, enddate: enddate1, 
				markerCoords: markerCoords, boundingBox: boundingBox,
				datasetRating: datasetRating })
				} else {
					var newComment = new Comment({ title: newTitle, text: newText, dataset: dataset, url: newUrl, 
				startdate: startdate1, enddate: enddate1,
				datasetRating: datasetRating})

				}
				
				newComment.save(function (err) {
					if (err) return console.error(err)
				})
				dataset.comments.push(newComment)
				dataset.save()
				res.redirect('/')
			}
	    });	
	}
});

// add comment to existing thread
router.post('/addtothread/:commentId', function(req, res) {

	if (req.isAuthenticated()) {	
	var newUrl = "",
	    newText = req.body.text,
	    newDataset = "",
	    newThread = "";

	    Comment.findOne({ _id: req.params.commentId }).exec(function(err, thread) {
	    	newThread = thread
	    	newUrl = thread.url
	    })

        Dataset.findOne({ url: newUrl }).exec(function(err, dataset) {
			if (!dataset) {
				newDataset = new Dataset({ url: newUrl })
        		newDataset.save()
			//create new comment
			var newComment = new Comment({ 
				text: newText, 
				user: req.user._id,
				dataset: newDataset, 
				comment: newThread, 
				authorName: req.user.local.username, 
				url: newUrl })
			//save the comment in the database
			newComment.save(function (err) {
				if (err) return console.error(err)
			});
			User.findOne({ _id: req.user._id }).exec(function(err, user) {
				user.comments.push(newComment)
				user.save()
			})
			newDataset.comments.push(newComment)
			newDataset.save()
			} else {
				//create new comment
				var newComment = new Comment({  
					text: newText, 
					user: req.user._id,
				 	dataset: dataset, 
				 	comment: newThread, 
				 	authorName: req.user.local.username, 
				 	url: newUrl})
				//save the comment in the database
				newComment.save(function (err) {
					if (err) return console.error(err)
				});
				User.findOne({ _id: req.user._id }).exec(function(err, user) {
					user.comments.push(newComment)
					user.save()
				})
				dataset.comments.push(newComment)
				dataset.save()
			}
			Comment.findOne({ _id: req.params.commentId }).exec(function(err, thread) {
	    			thread.comments.push(newComment)
	    			thread.save()
	    	})
				res.redirect('/')

	    });	

	} else {
	
	var newUrl = "",
		newText = req.body.text;
	    newDataset = "",
	    newThread = "";

	    Comment.findOne({ _id: req.params.commentId }).exec(function(err, thread) {
	    	newThread = thread
	    	newUrl = thread.url
	    })	    

        Dataset.findOne({ url: newUrl }).exec(function(err, dataset) {
			if (!dataset) {
				newDataset = new Dataset({ url: newUrl })
        		newDataset.save()
        		var newComment = new Comment({ text: newText, dataset: newDataset, comment: newThread
        		, url: newUrl })
				newComment.save(function (err) {
					if (err) return console.error(err)		
				})
				newDataset.comments.push(newComment)
				newDataset.save()
				res.redirect('/')
			} else {
				var newComment = new Comment({ text: newText, dataset: dataset, comment: newThread
				,  url: newUrl})
				newComment.save(function (err) {
					if (err) return console.error(err)
				})
				dataset.comments.push(newComment)
				dataset.save()
			}
			Comment.findOne({ _id: req.params.commentId }).exec(function(err, thread) {
	    			thread.comments.push(newComment)
	    			thread.save()
	    	})
				res.redirect('/')
	    });	
	}
});

//Find coordinates for bounding box and marker
function findAttr(o, format) {
	if (format=="wms") {
		for (i in o) {
        	if (typeof(o[i])=="object") { 
        		if (i=="LatLonBoundingBox") {         
            	if (resp.LatLonBoundingBox==undefined) {
            		resp["LatLonBoundingBox"] = o[i] 
            	return      	
            	}
        		}

        	findAttr(o[i], format );
        	}
        }
	} else if (format=="wfs") {
		for (i in o) {
		if (typeof(o[i])=="object") {
			findAttr(o[i], format )
		}
		if (typeof(o[i])=="string") {
			if (i=="ows:LowerCorner") {        
            	if (resp.LowerCorner==undefined) {
            		resp["LowerCorner"] = o[i]             	      	
            	}
        	}
        	if (i=="ows:UpperCorner") {        
            	if (resp.UpperCorner==undefined) {
            		resp["UpperCorner"] = o[i]             	      	
            	}
        	}
		}
	} } else if (format="wcs") {
		for (i in o) {
		if (typeof(o[i])=="object") {
			if (i=="ows:WGS84BoundingBox") {
				console.log("WGS84: " + o[i])
			}
			findAttr(o[i], format )
		}
		}
	}
}

function createString(input) {
	var rectangle = []
	var rectangle2 = []
	var bb = input.split('LatLng')
	
	rectangle = bb.slice(1, bb.length)
	for (var i=0; i<rectangle.length; i++) {
		var x = rectangle[i].split(',')[0]
		var y = rectangle[i].split(',')[1]
		rectangle2.push(x.slice(1,x.length))
		rectangle2.push(y.slice(0,y.length-1))
	}
	for (var i=0; i<rectangle2.length; i++) {
		console.log("coord: " + rectangle2[i])
	}

	return rectangle2
}

module.exports = router
