var express = require('express');
var router = express.Router();
var JourneyCollection = require('../model/JourneySchema');
var flash = require('connect-flash');
router.use(flash());

router.get('/', function(req, res, next) {
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}
	JourneyCollection.find ({},function(error, document){
		if(error){
			console.log("> Getting error in JourneyCollection find query - > ", error);
			throw error;
		}else{
			//console.log("> journey find successfully - > ",document );
			res.render('journey',{journeyList: document});
		}
	});

});

router.get('/create', function(req, res, next) {
	if(req.session.user)
	{
		JourneyCollection.find()
      		.distinct('user_id')
      		.count(function (err, count) 
      		{
      			console.log("the total number of journeys are " + count );
      			++count;
      			var journeyName = "HS-JRN-" + count;
          		res.render('journey-create', {journeyName : journeyName });   
    	  	});
		//res.render('journey-create', { });
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
	JourneyCollection.create(req.body, function (err, result){
		if(err)
		{
			console.log("> Getting error in Journey creation..",err);
			req.flash('error', 'Can not create this journey !');
			res.redirect("/journey/create");
		}
		else
		{	
			console.log("> Journey created..",result);
			req.flash('success', 'Journey created successfully !');
			res.redirect("/journey/");
		}	
	});
});

router.get('/delete_journey/:id', function (req, res, next){
	
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}

	JourneyCollection.findByIdAndRemove(req.params.id, function(error){
		if(!error){
			console.log(req.params.id+"____Removed Successfully.");
			req.flash('success', 'Journey deleted successfully. !!');
			res.redirect('/journey/');
		}
		else{
			console.log("Getting Error in /delete_journey");
			req.flash('error', 'Can not delete this journey.');				
			res.redirect('/journey/');		
		}
	});	
});

router.get('/update_journey', function (req, res, next){
	
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}

	JourneyCollection.findById(req.query.id, function(error, document){
		if(error){
			console.log("> Getting Error in /update_journey - >",error);
			throw error;
		}
		else{
			res.render('journey-update',{journeyDetails: document});
		}
	});
});


router.post('/update_journey', function (req, res, next){
	
	if(!req.session.user){
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}
	console.log(req.query.id);
	console.log("the journey details to be updated are " + JSON.stringify(req.body) );
	JourneyCollection.update({_id: req.query.id}, req.body, 
		function (error, document){
			if(error){
				console.log("> Getting Error in /update_journey POST - > ",error);
				req.flash('error', 'Can not updated this journey !!');
				res.redirect('/journey/');
			}
			else{
				console.log("result of updated journey is " + JSON.stringify(document) );
				req.flash('success', 'Journey updated successfully !!');
				res.redirect('/journey/');
			}
		}
	);
});

router.get('/updateJourneyStatus', function(req, res, next){
	
	var updateObj = '';
	if(req.query.status=='Started'){
	 	updateObj = {
						status: req.query.status, 
						start_date: new Date()
					}	
	}else if(req.query.status=='Finished'){
		updateObj = {
						status: req.query.status, 
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
});

module.exports = router;
