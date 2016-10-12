// This Model will consist all the required variables for Journey info //
// variable names must be self explanatory //

var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var Journey = new Schema(
{
	name: {type : String, unique : true, require : true },
	ship_id : String,
	//shipments: []
	/*
	
	*/

	source_port : String,
	destination_port : String,
	status : { type: String, default: 'NotStarted' }, // Initial value is NotStarted. It can be set to Started or Finished
	comments : String, 
	// All above fields will be present in the form for the user to Input values // 
	
	// Following values will be automatically detected and assigned //
	created_at : { type: Date, default: Date.now },
	created_by : String,  // The User Id 
	start_date : { type: Date, default: '' },  // When the "started" value is set to TRUE , Automatically detects the date and time and save it 
	end_date : { type: Date, default: '' }    // When the "ended" value is set to TRUE , Automatically detects the date and time and save it.
});

Journey.method.details = function()
{
	return {
		ship_id : this.ship_id,
		source_port : this.source_port,
		destination_port : this.destination_port,
		started : this.started,
		ended : this.ended,
		comments : this.comments,
		created_at : this.created_at,
		created_by : this.created_by,
		start_date : this.start_date,
		end_date : this.end_date
	}
};

Journey.method.create = function(  req )
{
	var jouneyObj = new Journey ({
		ship_id : req.body.ship_id,
		source_port : req.body.source_port,
		destination_port : req.body.destination_port,
		started : req.body.started,
		ended : req.body.ended,
		comments : req.body.comments,
		created_by : req.session.user,
		start_date : req.body.start_date,
		end_date : req.body.end_date
	});
	return jouneyObj
};

Journey.plugin(uniqueValidator);
module.exports = mongoose.model('Journey', Journey);