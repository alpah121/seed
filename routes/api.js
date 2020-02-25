var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/login', function (req, res) {
if (req.isAuthenticated())
	{
	res.json({loggedIn : true});	
	}
else
	{
	res.json({loggedIn : false});		
	}
});

module.exports = router;
