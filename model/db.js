//added additionally
var mongoose= require("mongoose");
//Connect to mongo DB
var host = 'localhost'; // tiltquizadmin.tiltmgc.com';
var port = '27017';
var dbName = 'ShippingSite';
mongoose.connect('mongodb://'+host+':'+port+'/'+dbName);
//mongoose.connect('mongodb://root:admin@104.197.186.156:27017/admin')
var myDB = mongoose.connection;
//Error handling if conncetion fails
myDB.on('error', console.error.bind(console, 'connection error:'));
//Check if successful connection is made
myDB.once('open', function callback () {
  console.log("MY DB Connected with Mongoose");
});
module.exports = {
   myDB: myDB
};
//return myDB;
//added additionally