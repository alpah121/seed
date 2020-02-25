var passport = require('passport');
var mysql = require('mysql');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
var uniqid = require('@mdenic/uniqid');

passport.serializeUser(function (user, done) {
    done(null, user.email);
});

passport.deserializeUser(function (email, done) {
    connection.query('SELECT * FROM users WHERE email="' + email + '";', function (error, results, fields) 
    {
	if (error) throw error;
    done(error, results[0]);
	});
});

var table = "users";
//users: imageLink, id, businessName, ceoName, serviceCategory, email, password
let tableTypes = {
	imageLink : "string", 
	id : "string",
	businessName : "string",
	ceoName : "string",
	serviceCategory : "string",
	email : "email",
	password : "string"
	};
let tableFields = Object.keys(tableTypes);
let fallback = "/";

const types = {
	string : /\w+/,
	number : /^[0-9]/, 
	email : /\S+@\S+\.\S+/,
	phone : /[0-9]{3}-[0-9]{3}-[0-9]{4}/,
	url : /^http/
}

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'pi',
	password: 'password',
	database: 'templates'
});

//check inputs
function checkInputs(typesObject, input)
{
let typesKeys = Object.keys(typesObject);
let inputKeys = [];
let inputValues = [];
let inputObjects = {};
let hasErrors = false;
let errors = [];

for(i = 0; i < typesKeys.length; i++)
	{
	let tableField = typesKeys[i];
	let tableType = typesObject[tableField];
	let type = types[tableType];
	let userInput = input[tableField];
	if (type.test(userInput)) 
		{
		inputKeys.push(tableField);	
		inputValues.push(connection.escape(userInput));
		inputObjects[tableField] = userInput;	
		}
	else
		{
		hasErrors = true;
		errors.push(tableField);	
		}
	}
return {hasErrors: hasErrors, errors: errors, inputKeys: inputKeys, inputValues: inputValues, inputObjects: inputObjects};
	
}

passport.use('local.signUp', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    
    
    connection.query('SELECT * FROM users WHERE email="' + email + '";', function (error, results, fields) {
        if (error) {
			console.log("an error occured in sql server(1)");
            return done(err);
        }
        if (results.length == 1) {
			console.log("email already in use. email: " + email);
            return done(null, false, {messages: ['Email is already in use.']});
        }
        
        req.body.password = bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
        req.body.id = uniqid();
        var inputs = checkInputs(tableTypes, req.body);
        if (inputs.hasErrors)
			{
			console.log('form has input errors ' + inputs.errors);
			return done(null, false, {errorMessage: 'form has input errors'});	
			}
		else
			{
			connection.query("INSERT INTO " + table + " (" + inputs.inputKeys.toString(", ") + ") VALUES (" + inputs.inputValues.toString(", ") + ");", (error, results, fields) => 		
				{
				if (error) 
					{
					console.log("an error occured in sql server(2)");
					return done(error);
					}
				else
					{
					console.log("successfully inserted user");
					console.log("also, here is the resulting object " + results[0]);
					return done(null, inputs.inputObjects, {successMessage: 'User Created Successfully'});	
					}
				});
			
			}
        
        });
        
    }));



passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
        
    connection.query('SELECT * FROM users WHERE email="' + email + '";', function (error, results, fields) {
        
        if (error) {
			console.log("an error occured in login sql")
            return done(error);
        }
        if (results.length == 0) {
			console.log("no user found")
            return done(null, false, {message: 'No user found.'});
        }
        console.log(password + " | " + results[0].password);
        bcrypt.compare(password, results[0].password, function(err, res) 
			{
			
			if (err) 
				{
				console.log("an error occured in comparing passwords");	
				done(err);	
				}
			else if (res == true)
				{
				console.log("user logged In");
				req.session.user = results[0];
				done(null, results[0]);	
				}
			else if (res == false)
				{
				console.log("wrong password");
				done(null, false, { message: "incorrect password"});	
				}
			});
         
        
        
    });
}));
