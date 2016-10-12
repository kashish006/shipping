

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var cookieSession = require('cookie-session');

var mydb = require('./model/db');
var routes = require('./routes/index');
var users = require('./routes/users');
var journey = require('./routes/journey');
var customers = require('./routes/customers');
var shipment = require('./routes/shipment');
var logging = require('./lib/logging');

/*barcode generator init starts*/
var http   = require('http');
var bwipjs = require('bwip-js');
bwipjs.loadFont('Inconsolata', 108,
  require('fs').readFileSync('./public/fonts/Inconsolata.otf', 'binary'));
/*barcode generator init ends*/

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
app.use('/', routes);
app.use('/users', users);
app.use('/journey', journey);
app.use('/customers', customers);
app.use('/shipment', shipment);


// Add the request logger before anything else so that it can
// accurately log requests.
// [START requests]
app.use(logging.requestLogger);
app.use(logging.errorLogger);
// [END requests]

logging.info("can you find me ");
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


app.listen(4000,function(){console.log('Server started')});

module.exports = app;
