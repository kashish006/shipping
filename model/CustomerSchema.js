// This Model will consist all the required variables for Customer info //
// variable names must be self explanatory //

var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

// We will implement this later //
//var shipment = require('./model/ShipmentSchema');

var Customer = new Schema(
{
	first_name : String, 
	last_name : String,
	mobile_number : {type : Number, unique : true },
	email : String,
	address : String, 
	comments : String, 
	// All above fields will be present in the form for the user to Input values // 
	

	// shipments : [ shipment ], // this will be used later and needs to pop up at edit customer 


	// Following values will be automatically detected and assigned //
	auto_generated_id : String, // Initials of the customer and last 4 digit of phone number
	created_at : { type: Date, default: Date.now },
	created_by : String,  // The User Id 
	
});

Customer.method.details = function()
{
	return {
		first_name : this.first_name,
		last_name : this.last_name,
		mobile_number : this.mobile_number,
		email : this.email,
		address : this.address,
		comments : this.comments,
		auto_generated_id : this.auto_generated_id,
		created_at : this.created_at,
		created_by : this.created_by
	}
};

Customer.method.create = function(  req )
{
	var customerObj = new Customer ({
		first_name : req.body.first_name,
		last_name : req.body.last_name,
		mobile_number : req.body.mobile_number,
		email : req.body.email,
		address : req.body.address,
		comments : req.body.comments,
		auto_generated_id : req.body.auto_generated_id,
		//created_at : req.body.created_at,
		created_by : req.body.created_by
	});
	return customerObj
};

Customer.plugin(uniqueValidator);
module.exports = mongoose.model('Customer', Customer);