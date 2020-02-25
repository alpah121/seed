var express = require('express');
var router = express.Router();
var passport = require("passport");
var navbar = [];

var messages = require('./messages');
var api = require('./api');
var crud = require('./crud');
var test = require('./test');

function getSQLResponse(fallback, sql)
{
//make query
connection.query(sql, (error, results, fields) => {
	//handle error
	if (error) {}
	//return results
	
	});
}


router.get('/', function(req, res) {
	res.render('home');
	});

router.get('/apply', function(req, res) {
	res.render('apply');
	});


router.get('/signUp', (req, res) => {
res.render('signUp');	
});

router.get('/login', (req, res) => {
res.render('login');	
});

router.get('/test', test.admin);

router.post('/signUp', passport.authenticate('local.signUp', {
successRedirect: '/login',
failureRedirect: '/signUp',
failureFlash: true	
}));

router.post('/login', passport.authenticate('local.login', {
successRedirect: '/dashboard',
failureRedirect: '/login',
failureFlash: true	
}));

router.get('/logout', isLoggedIn, function(req, res, next) {
req.logout();
res.redirect('/');	
});

router.get('/csv', isLoggedIn, crud.detail);

//router.get('/request', isLoggedIn, crud.detail);

router.post('thankyou', crud.create);

router.post('/request/update', isLoggedIn, crud.update);

router.get('/request/delete', isLoggedIn, crud.delete);

router.get('/dashboard', isLoggedIn, crud.dashboard);	


router.get('/messages', isLoggedIn, messages.read);

router.get('/message', isLoggedIn, messages.detail);

router.post('/message/new', isLoggedIn, messages.create);

router.get('/message/delete', isLoggedIn, messages.delete);

//messages: to, from, title, body, createdOn, id
router.get('/testMessages', (req, res) => {
	res.render('testMessages', {messages : 
		[
		{to : "raven", fromUser : "raven", title : "hello", body : "this is a test", createdOn : "12-05-1994", id : "1"},
		{to : "raven", fromUser : "raven", title : "hola", body : "this is another test", createdOn : "12-05-1994", id : "2"},
		{to : "raven", fromUser : "raven", title : "mi gusto", body : "this is a longer paragraph showing how this element deals with longer text.", createdOn : "12-05-1994", id : "3"}
		]
	});
});

function isLoggedIn(req, res, next)
{
if (req.isAuthenticated())
	{
	return next();		
	}
else
	{
	console.log("user not logged in");
	res.redirect('/');	
	}
}

module.exports = router;
