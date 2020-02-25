var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var uniqid = require('@mdenic/uniqid');

var table = "seedSales";
//sales: id, firstName, email, belongsTo, influencerID, createdOn, isPaid
let tableTypes = {
	firstName : "string", 
	email : "string",
	belongsTo : "string",
	influencerID : "string",
	createdOn : "string",
	isPaid : "bool",
	id : "string"
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

function sql(sql)
{
return new Promise(function(resolve, reject) 
{
	connection.query(sql, function(error, results, fields) 
		{
		if (error) 
			{
			reject(error);
			}
		else
			{
			resolve(results);
			}
		});
	});
}

const types = {
	bool : /true|false/,
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

function sqlSET(inputs)
{
let result = "";
let keys = Object.keys(inputs);
let firstKey = keys[0];
let firstInput = inputs[firstKey];
result = firstKey + " = " + firstInput + " ";

if (keys.length > 1)
	{
	for(i = 0; i < keys.length; i++)
		{
		let key = keys[i];
		let input = inputs[key];
		result += ", " + key + " = " + input + " "; 		
		}
	}
return result;
}

//insert into database
module.exports.create = function(req, res) {
if (req.params.hasOwnProperty("campaignTitle") && req.params.hasOwnProperty("influencerID") && req.params.campaignTitle != "" && req.params.influencerID != "")
	{
	//add in id, belongsTo, influencerID, createdOn, isPaid
	req.body.id = uniqid();
	req.body.belongsTo = req.params.campaignTitle;
	req.body.influencerID = req.params.influencerID;
	req.body.createdOn = Date.toDateString();
	req.body.isPaid = false;
	let inputs = checkInputs(tableTypes, req.body);
	if (inputs.hasErrors)
		{
		console.log('inputs have errors: ' + inputs.errors);
		res.redirect("/campaign/" + req.params.campaignTitle);	
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
	}
};

//update the database
module.exports.update = function(req, res) {
if (getAccessLevel(req) == 0) {res.redirect("/");}

let inputs = checkInputs(tableTypes, req.body);
if (inputs.hasErrors)
	{
	res.redirect(fallback);	
	}
else
	{
	let success = "/dashboard";
	let sqlSET = sqlSET(inputs.inputObjects);	
	connection.query("UPDATE " + table + " SET " + sqlSET + " WHERE id = " + inputs.inputObjects["id"] + ";", (error, results, fields) => {	
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

module.exports.dashboard = (req, res) => {
	connection.query("SELECT * FROM " + table + " WHERE authorName='" + req.session.user.businessName + "';", (error, results, fields) => {
	if (error) throw error;	
	res.render('dashboard', {"courses": results, "errorMessage" : req.flash("errorMessage"), "successMessage" : req.flash("successMessage")});
	});	
}
