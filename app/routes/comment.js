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
	coords = {};

/* WMS PARSER 
*  wms example: http://www.wms.nrw.de/umwelt/boden/stobo?
*  wfs example: 
*/
router.get('/', function(req,res) {
 	var url = ""
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
    	//, gzip: true
    	}
  	, function (error, response, body) {
  		//console.log(body)
  		if (body) {

  		  // Parse the response XML-data ("body") as JSON, stringify JSON and save in resptext
		  var parser = new xml2js.Parser({explicitArray : false});
		  parser.parseString(body, function(err,result) {
			  console.log("RESULTS:_________________________")
			  //traverse(result)
			  findAttr(result)
			  console.log("resp" + resp.LatLonBoundingBox.$)
			  coords = resp.LatLonBoundingBox.$
			  //showAttr(resp)
			  //console.log("getownPropertyNames: " + Object.getOwnPropertyNames ( result ))
			  


			  /*console.log(result.WMT_MS_Capabilities.Service)
			  resp = result.WMT_MS_Capabilities.Service  	
			  
			  if (!(result.WMT_MS_Capabilities==undefined))  {
			  	resptext = JSON.stringify(resp)
			  } */
			  resptext = JSON.stringify(result)


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
		/*.on('data', function(data) {
		    // decompressed data as it is received
		    //console.log('decoded chunk: ' + data)
		  })
		  .on('response', function(response) {
		    // unmodified http.IncomingMessage object
		    response.on('data', function(data) {
		      // compressed data as it is received
		      //console.log('received ' + data.length + ' bytes of compressed data')
		      //res.send(data)
		      res.render('new_comment.ejs', { boolean1: false, username: 'Anonymous', action: "#", actionName: "Login", 
						message: req.flash('loginMessage'), urlValue: "", addAction: "/comments/add", XMLresponse:  JSON.stringify(resp),
						urlResult: req.query.url})
			});
		  }) */

		//});

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

// show the new_comment page to add comment to existing thread
router.get('/addtothread/:commentUrl/:commentId', function(req, res) {
		if (req.isAuthenticated()) {
			res.render('new_comment.ejs', { 
				boolean1: true, 
				username: req.user.local.username, 
				action: "/logout", 
				actionName: "Logout", 
				message: req.flash('loginMessage'), 
				urlValue: req.params.commentUrl, 
				readonly: true, 
				addAction: "/comments/addtothread/"+req.params.commentId })
		} else {
			res.render('new_comment.ejs', { 
				boolean1: false, 
				username: 'Anonymous', 
				action: "#", 
				actionName: "Login", 
				message: req.flash('loginMessage'), 
				urlValue: req.params.commentUrl, 
				readonly: true, 
				addAction: "/comments/addtothread/"+req.params.commentId })
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
	    	newDataset = "";

	if (req.isAuthenticated()) {

        Dataset.findOne({ url: newUrl }).exec(function(err, dataset) {
			if (!dataset) {
				newDataset = new Dataset({ url: newUrl })
        		newDataset.save()
				//create new comment
				var newComment = new Comment({ 
					title: newTitle, 
					text: newText, 
					user: req.user._id,
		 			dataset: newDataset, 
		 			authorName: req.user.local.username, 
		 			url: newUrl,
		 			startdate: startdate1,
        			enddate: enddate1 })
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
				//create new comment
				var newComment = new Comment({ 
					title: newTitle, 
					text: newText, 
					user: req.user._id,
				 	dataset: dataset, 
				 	authorName: req.user.local.username, 
				 	url: newUrl, startdate: startdate1, enddate: enddate1})
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
				newDataset = new Dataset({ url: newUrl })
        		newDataset.save()
        		var newComment = new Comment({ 
        			title: newTitle, 
        			text: newText, 
        			dataset: newDataset, 
        			url: newUrl,
        			startdate: startdate1,
        			enddate: enddate1
        		})

				newComment.save(function (err) {
					if (err) return console.error(err)		
				})
				newDataset.comments.push(newComment)
				newDataset.save()
				res.redirect('/')
			} else {
				var newComment = new Comment({ title: newTitle, text: newText, dataset: dataset, url: newUrl, 
				startdate: startdate1, enddate: enddate1 })
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
	    	console.log("Find 1")
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
					console.log("Find 2")
	    			thread.comments.push(newComment)
	    			thread.save()
	    	})
				res.redirect('/')
	    });	
	}
});


// get one comment
router.get('/:commentId', function(req,res) {
	Comment.find({ _id : req.params.commentId }).exec(function(err, comment) {
	res.jsonp(comment)
	});
});

// edit a comment
router.put('/:commentId', function(req,res) {
	Comment.find({ _id : req.params.commentId }).exec(function(err, comment) {
		comment = _.extend(comment, req.body)
		comment.save(function(err) {
			res.jsonp(comment)
		})	
	});
})

// edelete a comment
router.delete('/:commentId', function(req,res) {
	/* NOT IMPLEMENTED YET */
})

function findAttr(o ) {
	
    for (i in o) {
        if (typeof(o[i])=="object") { 
                if (i=="LatLonBoundingBox") {         
            	if (resp.keywords==undefined) {
            		resp["LatLonBoundingBox"] = o[i]
            	console.log("FOUND!:   " + i, o[i])   
            	return      	
            }
        }          
            findAttr(o[i] );
        }
        /*if ((i=="Title") && (typeof(o[i])=="string")) {
        	//console.log(i, o[i])          
            	if (resp.title==undefined) {
            		resp["Title"] = o[i]
            	//console.log("FOUND!:   " + i, o[i])         	
            }
        }
        if ((i=="Abstract") && (typeof(o[i])=="string")) {
        	//console.log(i, o[i])          
            	if (resp.abstract==undefined) {
            		resp["Abstract"] = o[i]
            	//console.log("FOUND!:   " + i, o[i])         	
            }
        } */
                
    }
}

function showAttr(o ) {
    for (i in o) {
            console.log(i, o[i])
    }
}

function traverse(o ) {
    for (i in o) {
        if (typeof(o[i])=="object") {
            console.log(i, o[i])
            traverse(o[i] );
        }
    }
} 




module.exports = router
