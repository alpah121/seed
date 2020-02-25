var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var uniqid = require('@mdenic/uniqid');

var table = "messages";
//messages: to, from, title, body, createdOn, id
let tableTypes = {
	toUser : "string", 
	fromUser : "string",
	title : "string",
	body : "string",
	createdOn : "string",
	id : "string"
	};
let tableFields = Object.keys(tableTypes);
let fallback = "/messages";

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'pi',
	password: 'password',
	database: 'templates'
});

connection.connect();


const types = {
	string : /\w+/,
	number : /^[0-9]/, 
	email : /\S+@\S+\.\S+/,
	phone : /[0-9]{3}-[0-9]{3}-[0-9]{4}/,
	url : /^http/
}


function getAccessLevel(req)
{
if (req.session.job == "admin")
	{
	//admin
	return 3;	
	}
else if (req.session.job != undefined)
	{
	//employee
	return 2;	
	}
else if (req.session.id != undefined)
	{
	//user
	return 1;
	}
else
	{
	//guest
	return 0;	
	}
}

//read from database
module.exports.read = function (req, res) {
connection.query("SELECT * FROM " + table + " WHERE toUser='" + req.session.user.businessName + "';", (error, results, fields) => {	
	res.render('messages', {"successMessage" : req.flash('successMessage'), "messages" : results});
	});
};

//details about a single item
module.exports.detail = function (req, res) {
let id = connection.escape(req.query.id);
connection.query("SELECT * FROM " + table + " WHERE id='" + id + "';", (error, results, fields) => {	
	res.render('message', results[0]);
	});
};

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
		inputObjects[tableField] = connection.escape(userInput);	
		}
	else
		{
		hasErrors = true;
		errors.push(tableField);	
		}
	}
return {hasErrors: hasErrors, errors: errors, inputKeys: inputKeys, inputValues: inputValues, inputObjects: inputObjects};
	
}

//insert into database
module.exports.create = function(req, res) {
if (getAccessLevel(req) == 0) {res.redirect("/");}
console.log("it got to here.");
//add id and from to message object
req.body.id = "1234987";
req.body.fromUser = req.session.user.businessName;
req.body.createdOn = "12-05-1994";
let inputs = checkInputs(tableTypes, req.body);
console.log(inputs.inputValues.toString(", "));
if (inputs.hasErrors)
	{
	console.log("here are the message errors: " + inputs.errors);
	res.redirect(fallback);	
	}
else
	{
	let success = "/messages";
	connection.query("INSERT INTO " + table + " (" + inputs.inputKeys.toString(", ") + ") VALUES (" + inputs.inputValues.toString(", ") + ");", (error, results, fields) => {	
	if (error) throw error;
	req.flash('successMessage', 'Message Sent Successfully');
	console.log("and here.");
	res.redirect(success);
	});	
	}
};


//delete from database
module.exports.delete = (req, res) => {
if (getAccessLevel(req) == 0) {res.redirect("/");}
let inputs = checkInputs(tableTypes, req.query);
if (inputs.hasErrors)
	{
	res.redirect(fallback);	
	}
else
	{
	let success = "/creator/dashboard";
	let sqlSET = sqlSET(inputs.inputObjects);	
	connection.query("DELETE FROM " + table + " WHERE id = " + inputs.inputObjects["id"] + ";", (error, results, fields) => {	
	res.redirect(success);
	});	
	}
	
};


