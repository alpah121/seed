var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var uniqid = require('@mdenic/uniqid');

var table = "seedApplications";
//applications: firstname, lastName, email, status, services, website, usp
let tableTypes = {
	firstName : "string",
	lastName : "string", 
	email : "string",
	status : "string",
	services : "string",
	website : "string",
	usp : "string"
	};
let tableFields = Object.keys(tableTypes);
let fallback = "/";

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'pi',
	password: 'password',
	database: 'templates'
});

connection.connect();

const types = {
	bool : /true|false/,
	string : /\w+/,
	number : /^[0-9]/, 
	email : /\S+@\S+\.\S+/,
	phone : /[0-9]{3}-[0-9]{3}-[0-9]{4}/,
	url : /^http/
}





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

//add in startedOn and fullfilled
req.body.status = "pending";
let inputs = checkInputs(tableTypes, req.body);
if (inputs.hasErrors)
	{
	console.log('inputs have errors: ' + inputs.errors);
	req.flash('errorMessage', 'an error occured');
	res.redirect("/dashboard");	
	}
else
	{
	let success = "/dashboard";
	connection.query("INSERT INTO " + table + " (" + inputs.inputKeys.toString(", ") + ") VALUES (" + inputs.inputValues.toString(", ") + ");", (error, results, fields) => {	
	if (error) throw error;
	console.log('request submitted successfully');
	req.flash('successMessage','request created successfully');
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
	let success = "/dashboard";	
	connection.query("DELETE FROM " + table + " WHERE id = " + inputs.inputObjects["id"] + ";", (error, results, fields) => {	
	res.redirect(success);
	});	
	}
	
};
