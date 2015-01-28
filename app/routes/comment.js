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

/* WMS PARSER 
*  wms example: http://www.wms.nrw.de/umwelt/boden/stobo?
*  wfs example: 
*/
router.get('/', function(req,res) {
 	var url = ""
 	resptext = "No properties found. Check the format of your url"
 	var format = req.query.select
 	// check the url format, append an GetCapability request if necessary
	if (req.query.url.indexOf("?")==(-1)) {
		url = req.query.url + "?REQUEST=GetCapabilities&VERSION=1.1.0&SERVICE=" + format 
	} else if (!(req.query.url.indexOf("GetCapabilities")==(-1))) {
		url = req.query.url
	} else {
		url = req.query.url.slice(0,req.query.url.indexOf("?")) + "?REQUEST=GetCapabilities&VERSION=1.1.0&SERVICE=" + format 
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
				resptext = JSON.stringify(result)
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
			rating = 0,
			newDataset = "";

			if (req.body.rating) {
				rating = Number(req.body.rating)
			}
			if (coords.minx) {
				boundingBox = [ Number(coords.minx), Number(coords.miny),  Number(coords.maxx), Number(coords.maxy) ]
				markerCoords = [ Number(coords.minx) + (Number(coords.maxx) - Number(coords.minx))/2,
			 					Number(coords.miny) + (Number(coords.maxy) - Number(coords.miny))/2 ]
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
		 			authorName: req.user.local.username, 
		 			url: newUrl,
		 			markerCoords: markerCoords,
		 			boundingBox: boundingBox,
		 			startdate: startdate1,
        			enddate: enddate1 })
				} else {
					var newComment = new Comment({ 
					title: newTitle, 
					text: newText, 
					user: req.user._id,
		 			dataset: newDataset, 
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
					user.comments.push(newComment)
					user.save()
				})
				newDataset.comments.push(newComment)
				newDataset.save()
				res.redirect('/')
			} else {
				dataset.rating = Math.round((dataset.rating + rating) / 2)
				//create new comment
				if (markerCoords.length>0) {
					var newComment = new Comment({ 
					title: newTitle, 
					text: newText, 
					user: req.user._id,
				 	dataset: dataset, 
				 	authorName: req.user.local.username,
				 	markerCoords: markerCoords, 
				 	boundingBox: boundingBox,
				 	url: newUrl, startdate: startdate1, enddate: enddate1})
				} else {
					var newComment = new Comment({ 
					title: newTitle, 
					text: newText, 
					user: req.user._id,
				 	dataset: dataset, 
				 	authorName: req.user.local.username,
				 	url: newUrl, startdate: startdate1, enddate: enddate1})

				}
				
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
				dataset.rating = Math.round((dataset.rating + rating) / 2)
				if (markerCoords.length>0) {

					
					var newComment = new Comment({ title: newTitle, text: newText, dataset: dataset, url: newUrl, 
				startdate: startdate1, enddate: enddate1, markerCoords: markerCoords, boundingBox: boundingBox })
				} else {
					var newComment = new Comment({ title: newTitle, text: newText, dataset: dataset, url: newUrl, 
				startdate: startdate1, enddate: enddate1 })

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
            	console.log("FOUND!:   " + i, o[i])   
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
            		console.log("FOUND low!:   " + i, o[i])              	      	
            	}
        	}
        	if (i=="ows:UpperCorner") {        
            	if (resp.UpperCorner==undefined) {
            		resp["UpperCorner"] = o[i]
            		console.log("FOUND up!:   " + i, o[i])              	      	
            	}
        	}
		}
	} }
}

module.exports = router
