var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'pi',
	password: 'password',
	database: 'templates'
});

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

//admin dashboard loads data from applications and sales
module.exports.admin = async (req, res) => {
var results = await sql("SELECT * FROM requests;");
res.json({"winners" : results});
}
