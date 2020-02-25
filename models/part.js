var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	imagePath: {type: String, required: true},
	name: {type: String, required: true},
	goesTo: {type: String, required: true},
	keywords: {type: String, required: true}
	
	});
	
module.exports = mongoose.model('Product', schema);
