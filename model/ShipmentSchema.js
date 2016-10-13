// This Model will consist all the required variables for Customer info //
// variable names must be self explanatory //

var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;
// We will implement this later //

var Cargo = new Schema(
{
	cargoId: {type: String},
	type: {type: String},
	main_type: {type: String},
	subtype: {type: String},
	sub_type: {type: String},
	sub_subtype: {type: String},
	sub_sub_type: {type: String},
	expected_cost_price: {type: Number},
	vehicle_id_no: {type: String},
	vin_error: {type: String},
	vin_make: {type: String},
	vin_manufacturer: {type: String},
	vin_model: {type: String},
	vin_modelyear: {type: String},
	value_added: {type: Number},
	inspection_fee: {type: Number},
	quantity: {type: Number},
	barcode:{
		data:{type:Buffer},
		contentType:{type: String}
	}
});

var Shipment = new Schema(
{
	name: {type: String, require: true },  //usr
	is_orphan: {type: Boolean},  //usr
	was_orphan: {type: Boolean},  //back
	/*If is_orphan is true hide for_journey dropdown*/
	
	is_sender: {type: Boolean},
	for_journey:{type : Schema.Types.ObjectId, ref: 'Journey'},  //usr
	/* In drop down show all journeyIds with status not started */
	
	// - > status in joruney 
	sender : {type : Schema.Types.ObjectId, ref: 'Customer'},  //usr //store id //dropdown
	//We need to populate a drop down of all customers Id with search functionality for the user to select //
	
	//receiver details 
	//receiver:{
		receiver_name: String,
		receiver_contact: Number,
		receiver_address_line1: String,
		receiver_address_line2: String,
		receiver_address_city: String,
		receiver_address_state: String,
		receiver_address_zip: Number,
		
	//},
	
	cargos:[Cargo],

	comment : String,   //usr
	shipment_cost : Number,//usr
	payment_status : String, // 3 options " Paid , Partial , Not Paid "    //usr
	amount_paid : Number , //usr
	amount_balance : Number, //back
	cash_collected_by: [{type:String}],//back //current users email address
	cash_collected_on: { type: Date, default: Date.now },//back
	created_at : { type: Date, default: Date.now },//back
	created_by : String,  // The User Id 	//back
});


Shipment.plugin(uniqueValidator);
module.exports = mongoose.model('Shipment', Shipment);