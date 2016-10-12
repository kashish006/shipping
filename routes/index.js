var express = require('express');
var router = express.Router();
var flash = require('connect-flash');
router.use(flash());
router.use(function (req, res, next){
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

/*GET home page. */
router.get('/', function(req, res, next) {
	if(req.session.user){
		res.render('index', { });
	}else{  
		req.flash('error', 'Please login first !');
		res.redirect('/login');
	}
});

router.get('/login', function(req, res, next){
	console.log("ON LOGIN PAGE");
	res.render('login', { });
});

router.get('/logout', function (req, res){
	req.session = null;
	res.redirect('/login');
});

router.post('/login', function(req, res, next){
	console.log("LOGIN PAGE POST");
	//if(req.body.email=="vidit@gmail.com" &&  req.body.password=="vidit_admin")
	if(req.body.email=="admin@gmail.com" && req.body.password == "admin")
	{
		console.log("> Successfully logged in !");
		req.session.user = req.body.email;
		req.flash('success', 'Welcome '+req.session.user);
		res.redirect('/');
	}else{
		console.log("> Username/Password incorrect !");
		req.flash('error', 'Username/Password incorrect !');
		res.redirect('/login');
	}
});

module.exports = router;
