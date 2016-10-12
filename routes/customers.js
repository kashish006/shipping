var express = require('express');
var router = express.Router();
var CustomerCollection = require('../model/CustomerSchema');
var flash = require('connect-flash');
router.use(flash());

router.get('/', function(req, res, next) {
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}
	CustomerCollection.find({},function(error, document){
		if(error){
			console.log("> Getting error in CustomerCollection find query - > ", error);
			throw error;
		}else{
			//console.log("> customer find successfully - > ",document );
			res.render('customers', {customerList: document});
		}
	});
});

router.get('/create', function(req, res, next) {
	if(req.session.user){
		res.render('customer-create', { });
	}else{  
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}
});

router.post('/post', function(req, res, next) {
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}

	req.body.created_by = req.session.user;
	var firstNameInitial = req.body.first_name.substring(0,1);
	var lastNameInitial = req.body.last_name.substring(0,1);
	var phoneNumberLastDigits = req.body.mobile_number%10000;
	req.body.auto_generated_id = firstNameInitial+lastNameInitial+phoneNumberLastDigits;
	//0123456789
	/*first_name
	last_name
	mobile_number

	req.body.auto_generated_id = req.session.user;
	*/CustomerCollection.create(req.body, function (err, result){
		if(err)
		{
			console.log("> Getting error in Customer creation..",err);
			req.flash('error', 'Can not create this customer !');
			res.redirect("/customers/create");
		}
		else
		{	
			console.log("> Customer created..",result);
			req.flash('success', 'Customer created successfully !');
			res.redirect("/customers/");
		}	
	});
});

router.get('/delete_customer/:id', function (req, res, next){
	
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}

	CustomerCollection.findByIdAndRemove(req.params.id, function(error){
		if(!error){
			console.log(req.params.id+"____Removed Successfully.");
			req.flash('success', 'Customer deleted successfully. !!');
			res.redirect('/customers/');
		}
		else{
			console.log("Getting Error in /delete_customer");
			req.flash('error', 'Can not delete this customer.');				
			res.redirect('/customers/');		
		}
	});	
});

router.get('/update_customer', function (req, res, next){
	
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}

	CustomerCollection.findById(req.query.id, function(error, document){
		if(error){
			console.log("> Getting Error in /update_customer - >",error);
			throw error;
		}
		else{
			res.render('customer-update',{customerDetails: document});
		}
	});
});


router.post('/update_customer', function (req, res, next){
	
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}

	CustomerCollection.update(req.query.id, req.body, 
		function (error, document){
			if(error){
				console.log("> Getting Error in /update_customer POST - > ",error);
				req.flash('error', 'Can not updated this customer !!');
				res.redirect('/customers/');
			}
			else{
				req.flash('success', 'Customer updated successfully !!');
				res.redirect('/customers/');
			}
		}
	);
});

module.exports = router;
