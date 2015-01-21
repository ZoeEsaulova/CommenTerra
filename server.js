
// set up ======================================================================
// get all the tools we need
var express  = require('express'),
    app      = express(),
    port     = process.env.PORT || 80,
 	mongoose = require('mongoose'),
 	passport = require('passport'),
 	flash    = require('connect-flash'),
 	morgan       = require('morgan'),
 	cookieParser = require('cookie-parser'),
 	bodyParser   = require('body-parser'),
 	session      = require('express-session'),
 	configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

//set static content
app.use(express.static(__dirname + '/public'));
app.use('/comments', express.static(__dirname + '/public'));
app.use('/comments/add', express.static(__dirname + '/public'));
app.use('/comments/addtothread/:commentUrl/:commentId', express.static(__dirname + '/public'));
app.use('/api/v1/search', express.static(__dirname + '/public'));
app.use('/api/v1/search?', express.static(__dirname + '/public'));
app.use('/profile', express.static(__dirname + '/public'));
app.use('/api/v1/simplesearch', express.static(__dirname + '/public'));

// required for passport (used for auth)
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes/home.js')(app, passport); // load our routes and pass in our app and fully configured passport
var comment = require('./app/routes/comment'),
    profile = require('./app/routes/profile'),
    search = require('./app/routes/search');
app.use('/comments', comment); // define route for /comments page
app.use('/api/v1', search); //define route for search
app.use('/profile', profile); //define route for profile page

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);


