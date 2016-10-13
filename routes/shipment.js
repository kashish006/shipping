var express = require('express');
var router = express.Router();
var ShipmentCollection = require('../model/ShipmentSchema');
var CustomerCollection = require('../model/CustomerSchema');
var JourneyCollection = require('../model/JourneySchema');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var Printer = require('node-printer');
var str2json = require('string-to-json');
var flash = require('connect-flash');
var shortid = require('shortid');
router.use(flash());

var bwipjs = require('bwip-js');
/*bwipjs.loadFont('Inconsolata', 108,
            require('fs').readFileSync('./public/fonts/Inconsolata.otf', 'binary'));*/

router.get('/', function(req, res, next) {
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}
	
	ShipmentCollection 
		.find({})
		.populate('for_journey')
		.populate('sender')
		.exec (function(error, document){
		if(error){
			console.log("> Getting error in ShipmentCollection find query - > ", error);
			throw error;
		}else{
			//console.log("> shipment find successfully - > ",document );
			res.render('shipment',{shipmentList: document});

		}
	});
});

router.get('/create', function(req, res, next) {
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}

	CustomerCollection.find({}, function (error, customers){
		if(error){
			console.log("Getting Error in /shipment/create customers");
			throw error;
		}
		else{
			JourneyCollection.find({status:"NotStarted"}, function (error2, journeys){
				if(error2){
					console.log("Getting Error in /shipment/create journeys");
					throw error2;
				}
				else{
					ShipmentCollection.find()
      					.distinct('user_id')
      					.count(function (err, count) 
      					{
      						console.log("the total number of shipments are " + count );
      						++count;
      						var shipmentName = "Inovice No.- " + count;
          					res.render('shipment-create', {customerlist: customers, journeylist: journeys, shipmentName : shipmentName});   
    	  				});
					}
			});
		}
	});
});

router.post('/post', multipartMiddleware, function(req, res, next) {
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}

	
	
	createCargo(req.body, function(shipmentDetails){
		if(!shipmentDetails.is_orphan){
			shipmentDetails.is_orphan = false;
			shipmentDetails.was_orphan = false;
		}
		else{
			shipmentDetails.is_orphan = true;
			shipmentDetails.was_orphan = true;
			shipmentDetails.for_journey = null;	
		}
		
		shipmentDetails.created_by = req.session.user;
		shipmentDetails.cash_collected_by = [req.session.user],
		

		assignSenderAsReceiver(shipmentDetails, function(shipmentDetails){
			console.log("> FINAL DETAILS - > ",shipmentDetails);
			//process.exit();
			ShipmentCollection.create(shipmentDetails, (error, result)=>{
				if(error){
					console.log("Error: Getting error in Creating Shipment - > ",error);
					req.flash('error', 'Can not create this shipment !');
					res.redirect("/shipment/create");
				}else{
					console.log("Success: Shipment added successfully - > ",result);
					req.flash('success', 'Shipment created successfully !');
					res.redirect("/shipment/");
				}
			})
		})
				
	})
});

function assignSenderAsReceiver(shipmentDetails, callback){
	if(shipmentDetails.is_sender)
	{
		shipmentDetails.is_sender = true;
		CustomerCollection.findById({_id: shipmentDetails.sender}, function (error, customer){
			if(error){
				console.log("Getting Error in /shipment/create customers");
				throw error;
			}
			else{
				console.log("the customer fetched is " + customer );
				shipmentDetails.receiver_name = customer.first_name + " " + customer.last_name;
				console.log(shipmentDetails.receiver_name );
				shipmentDetails.receiver_contact = customer.mobile_number + " , " + customer.alternate_mobile_number;
				shipmentDetails.receiver_address_line1 = customer.address;
				shipmentDetails.receiver_address_city = customer.address_city;
  				shipmentDetails.receiver_address_state = customer.address_state;
  				shipmentDetails.receiver_address_zip = customer.address_zip;
  				callback(shipmentDetails);
			}
		//console.log("process exit()");
		//process.exit();
		});
	}
	else{
		callback(shipmentDetails);
	}
}

function createCargo(shipment, callback){
	console.log("--> SHIPMENTS ARE - > ",shipment);
	
	shipment.cargos.forEach((item, index)=>{
		item.cargoId = shortid.generate();
		item.expected_cost_price = item.shipment_cost;
		getBarcode(item.cargoId, (barcodeBuffer)=>{
			item.barcode = {
				data: barcodeBuffer,
				contentType: 'image/png'
			}
			// return response, when whole array is processed
			if(index==(shipment.cargos.length-1)){
				callback(shipment);
			}
		})
	})
}

function getBarcode(text, callback){
	bwipjs.toBuffer({
        bcid:        'code128',       // Barcode type 
        text:        text,    // Text to encode 
        scale:       2,               // 3x scaling factor 
        height:      5,              // Bar height, in millimeters 
        includetext: true,            // Show human-readable text 
        textxalign:  'center',        // Always good to set this 
        textfont:    'Inconsolata',   // Use your custom font 
        textsize:    10               // Font size, in points 
    }, function (err, png) {
        if (err) {
        	console.log("Getting error while trying to generate barcode. - > ",err);
        } else {
        	
        	/*var base64 = png.toString('base64');
        	console.log("->"+base64);*/
        	//callback("data:image/png;base64,"+base64);
        	console.log("> SENDING BARCODE :");
        	callback(png);
        	//res.end(png);
            // `png` is a Buffer 
            // png.length           : PNG file length 
            // png.readUInt32BE(16) : PNG image width 
            // png.readUInt32BE(20) : PNG image height 
        }
    });
}

router.get('/print_barcode', function (req, res, next){
	//console.log("> barcode is - > ",req.query.barcode);
	// Get available printers list
	console.log("> PRINTER LIST IS - > ",Printer.list());
	// Create a new Pinter from available devices
	var printer = new Printer('EPSON_SX510');

	// Print from a buffer, file path or text./
	//var fileBuffer = fs.readFileSync('/path/to/file.ext');
	var jobFromBuffer = printer.printBuffer(req.query.barcode);

/*	var filePath = 'package.json';
	var jobFromFile = printer.printFile(filePath);
*/
/*	var text = 'Print text directly, when needed: e.g. barcode printers'
	var jobFromText = printer.printText(text);*/

	// Cancel a job
	//jobFromFile.cancel();

	// Listen events from job
	jobFromBuffer.once('sent', function() {
	    jobFromBuffer.on('completed', function() {
	        console.log('JOB ' + jobFromBuffer.identifier + 'HAS BEEN PRINTED.');
	        jobFromBuffer.removeAllListeners();

	        res.send("success");
	    });
    });

});

router.get('/delete_shipment/:id', function (req, res, next){
	
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}
	console.log(req.params.id );
	ShipmentCollection.findByIdAndRemove(req.params.id, function(error){
		if(!error){
			console.log(req.params.id+"____Removed Successfully.");
			req.flash('success', 'Shipment deleted successfully. !!');
			res.redirect('/shipment/');
		}
		else{
			console.log("Getting Error in /delete_shipment");
			req.flash('error', 'Can not delete this shipment.');				
			res.redirect('/shipment/');		
		}
	});	
});

router.get('/scan_code', function(req, res, next) {
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}

	res.render('scan-code.ejs',{});
});

router.get('/update_shipment', function (req, res, next){
	
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}

	ShipmentCollection.findById(req.query.id)
		.populate('for_journey')
		.populate('sender')
		.exec (function(error, document){
	 	if(error){
			console.log("> Getting Error in /update_shipment - >",error);
			throw error;
		}
		else{
				CustomerCollection.find({}, function (error, customers){
				if(error){
					console.log("Getting Error in /shipment/update_shipment/fetching customers ");
					throw error;
				}
				else{
					JourneyCollection.find({status:"NotStarted"}, function (error2, journeys){
						if(error2){
							console.log("Getting Error in /shipment/update_shipment/fetching journeys");
							throw error2;
						}
						else{
							console.log("the shipment read details is " + document );
							res.render('shipment-update', {shipmentDetails: document , customerlist: customers, journeylist: journeys});
						}
					});
				}
			});
		}
	});
});


router.get('/update_shipment_cargo/:shipment_id/:cargo_id', function (req, res, next){
	
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}
	console.log(req.params);
	ShipmentCollection.findById({_id : req.params.shipment_id, 'cargos._id' : req.params.cargo_id }, function(error, document){
		if(error){
			console.log("> Getting Error in /update_shipment_cargo - >",error);
			throw error;
		}
		else{
			//console.log("value of cargo is " + document.cargos );
			res.render('cargo-update',{ cargoDetails: document.cargos[0] });
		}
	});
});


router.post('/update_shipment_cargo/:shipment_id', function (req, res, next){
	
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}

	JourneyCollection.update(req.query.id, req.body, 
		function (error, document){
			if(error){
				console.log("> Getting Error in /update_journey POST - > ",error);
				req.flash('error', 'Can not updated this journey !!');
				res.redirect('/journey/');
			}
			else{
				req.flash('success', 'Journey updated successfully !!');
				res.redirect('/journey/');
			}
		}
	);
});

/*
router.get('/updateJourneyStatus', function(req, res, next){
	
	var updateObj = '';
	if(req.query.startedValue=='true' && req.query.endedValue=='false'){
	 	updateObj = {
						started: req.query.startedValue, 
						ended: req.query.endedValue,
						start_date: new Date()
					}	
	}else if(req.query.startedValue=='true' && req.query.endedValue=='true'){
		updateObj = {
						started: req.query.startedValue, 
						ended: req.query.endedValue,
						end_date: new Date()
					}
	}
	JourneyCollection.update({_id: req.query.journeyId}, updateObj, 
		function(error, document){
			if(error){
				console.log("> Getting Error in /updateJourneyStatus - > ", error);
				res.send("error");
			}
			else{
				res.send("success");	
			}
		}
	);
});*/


module.exports = router;
