/**********************************************************
*Gregory Niebanck
*09/28/2017
*CS496 FALL 2017
*Description: main server code for web cralwer project
*************************************************************/
//setup for express / handlebars / sessions/ mysql
var express = require('express');
var cookieParser = require('cookie-parser');
var request = require('request');
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var session = require('express-session');	
var cookieParser = require('cookie-parser');
var app = express();
// bodyParser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//cookies
app.use(cookieParser());
// Handlebars
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
var port_number = Number(process.argv[2]);
if(isNaN(port_number))
{
	console.log("USGAE:node mainServer.js {hosting port number}");
	return;	
}
app.set('port', port_number);
//***********************************************************
// server files and imported library functions
app.use(express.static('public'));
// router index
var router = require('./routes/index');
// //***********************************************************
// Router
app.use('/', router);
 //************Generic Error Handling************************
  app.use(function(req,res){
    res.status(404);
    res.render('404');
  });
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
  });
    app.listen(app.get('port'), function(){
    console.log('Express started on port: ' + app.get('port') +
		'; press Ctrl-C to terminate.');
  });
  //***********************************************************
