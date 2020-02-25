var mysql = require('mysql');

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

const weekAgo = Date.now() - (2000 * 60 * 60 * 24 * 7);

//read the pending applications and this weeks sales from database
module.exports.dashboard = async function (req, res) {
let applications = await sql("SELECT * FROM seedApplications WHERE status = 'pending';");	
let sales = await sql("SELECT * FROM seedSales WHERE createdOn > " + weekAgo + ";");
res.render('adminDashboard', {"applications" : applications, "sales" : sales});

};
