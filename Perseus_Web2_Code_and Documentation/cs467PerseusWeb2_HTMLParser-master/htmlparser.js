var express = require ('express');
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('port', process.env.PORT || 3001);

// for url parsing : http://www.codingdefined.com/2014/11/how-to-parse-urls-in-nodejs.html
var url = require("url");

// for file IO - https://nodejs.org/docs/v0.10.35/api/fs.html
var fs = require('fs')

// convert html text to DOM
//http://dillonbuchanan.com/programming/html-scraping-in-nodejs-with-cheerio/
var cheerio = require('cheerio');
var request = require('request');

// 2017-10-21 trying jsdom version instead of cheerio
// https://github.com/tmpvar/jsdom
var jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Phantom - to use nodejs with phantomjs
// https://ourcodeworld.com/articles/read/379/how-to-use-phantomjs-with-node-js
var phantom = require ("phantom")

// testing another phantomjs bridge called node-phantom
//https://github.com/alexscheelmeyer/node-phantom
var nodePhantom = require ("node-phantom");

// testing phantomjs to nodejs bridge called horseman
var Horseman = require('node-horseman');




/*
function parsehtml(textin, res) {
  console.log ("starting parsehtml");
  var n = 0
  n = textin.indexOf("a href=");
  console.log ("n = "+n);
  
  //for (var i = 0, len = textin.length; i) {
  //  if (str.chjarAt(i) == "<")
  //}
  
  textin2 = textin.toString();
  for (var v of textin2) {
    console.log (v);
  }
  
  res.type('text/plain');
  res.send(textin);
}
*/


// ******************
// 11/24/2017 Get title function
// ******************
/*
function getTitle(url){ 
  var horseman = new Horseman({timeout: 5000});
  var urlstring = url;
  var finalResults = {};
  var finalStatus = "OK";
  
  // get protocol, hostname, port
  console.log("&&&& inside getTitle &&&&");
  console.log("&&&& urlstring: ", urlstring);
  
  // check for empty urlstring
  if (urlstring == "") {
    return "Bad Request";
  }
  
  horseman
    .log("&&& starting horseman &&&")
    .open(urlstring)
    .then ( function(success) {
	      console.log ("&&& open success &&&");
              console.log (success);
            }, 
            function (error) {
              console.log ("&&&open error &&&");
              console.log (error);
              finalStatus = "Bad Request";
            }
    )
    .log("&&& URL: ").url().log()
    .log("&&& title: ").title().log()
    .evaluate( function(){
      // Code is executed inside the browser. no access to anything unless you pass in. 
      // Have access to jQuery, via $, automatically.
      
      var current_title = $(document).attr('title');
      var current_url = document.URL;
      
      if ( !current_title ) {
        var results = "no_title";
        return results;
      }
      var results = {};
      results = {"url": current_url, "title" : current_title}; 
      return results;
    }) // passing in the argument to test if global variable works
    .then(
      function(response) {
        
        //var finalStatus = {}; // redundant??
        console.log("&&& success step &&&");
        var count = Object.keys(response).length

        if (response) {
          console.log(response);
          console.log("&&& count &&& " + count);
           
          if (response == "no_title") {
            finalStatus = "404 Not Found";
          } else if (count == 0) {
            finalStatus = "204 No urls found in html";
          } else {
            //return response;
            finalResults = response;
            console.log ("&&& finalResults: ", finalResults);
            return finalResults;
          }
        } else {
          console.log("empty response");
          finalStatus = "404 Not Found";
        }
      },
      function(error) {
        console.log ("--- error handling ---");
        console.log(error);
        finalStatus = "404 Not Found";
      }
    )
    .finally(function(){
		  horseman.close();
		  console.log ("&&& second finalSatus = ", finalStatus);
	    console.log ("&&& second finalResults = ", finalResults);
	    return finalResults;
	  });
}
*/



// ***********************************
// ******** ROUTES *******************
// ***********************************


// -----------------------------------
// post title route
// 2017-11-24 returns title of a URL
// -----------------------------------
app.post ('/title', function (req, res) {
  var horseman = new Horseman({timeout: 10000});
  var urlstring = req.body.urlstring;
  var results = {};
  
  // get protocol, hostname, port
  //console.log("######## req.headers ########");
  //console.log(req.headers);
  //console.log ("####### req.body #######");
  //console.log(req.body);
  
  // check for empty urlstring
  if (urlstring == "") {
    res.status(400).send("Bad Request");
    return;
  }

  horseman
    .log("starting horseman")
    .open(urlstring)
    .then ( function(success) {
	      console.log ("--- open success ---");
              //console.log (success);
            }, 
            function (error) {
              console.log ("--- open error ---");
              console.log (error);
	      res.status(400).send("Bad Request");
	      //horseman.close();
            }
    )
    .log("### URL ### ").url().log()
    .log("### title ### ").title().log()
    //.log("### anchor elements ## ").count('a').log() // outputs the number of anchor tags
    .evaluate( function(){
      // Code is executed inside browser. no access to anything unless you pass in. 
      // Have access to jQuery, via $, automatically.
      
      var current_title = $(document).attr('title');
      var current_url = document.URL;
      
      if ( !current_title ) {
        var results = "no_title";
        return results;
      }

      var results = {};
      results = {"urlstring": current_url, "title" : current_title};  
      return results;
    })
    .then(
      function(response) {
        console.log("--- success step ---");
        var count = Object.keys(response).length

        if (response) {
          //console.log(response);
          console.log("### count ### " + count);
           
          if (response == "no_title") {
            res.status(404).send("404 Not Found");
          } else if (count == 0) {
            res.status(204).send("204 No urls found in html");
          } else {
            res.send(response);
          }
        } else {
          console.log("empty response");
          res.status(404).send("404 Not Found");
        }
      },
      function(error) {
        console.log ("--- error handling ---");
        console.log(error);
        res.status(404).send("404 Not Found");
      }
    )
    .finally(function(){
		  horseman.close();
	  });    
});



// -----------------------------------
// post keyword route
// 2017-11-24 returns yes or no if keyword exists or not
// -----------------------------------
app.post ('/keyword', function (req, res) {
  var horseman = new Horseman({timeout: 10000});
  var urlstring = req.body.urlstring;
  var keyword = req.body.keyword;
  var results = "undefined";
  
  // get protocol, hostname, port
  //console.log("/keyword req.headers ########");
  //console.log(req.headers);
  //console.log ("/keyword req.body #######");
  //console.log(req.body);
  
  // check for empty urlstring
  if (urlstring == "") {
    res.status(400).send("Bad Request");
    return;
  }

  horseman
    .log("starting horseman")
    .open(urlstring)
    .then ( function(success) {
	      console.log ("--- open success ---");
        //console.log (success);
      }, 
      function (error) {
        console.log ("--- open error ---");
        console.log (error);
	      res.status(400).send("Bad Request");
	      //horseman.close();
      }
    )
    .log("/keyword URL %%% ").url().log()
    .log("/keyword title %%% ").title().log()
    .plainText()
    . then ( function (someText) {
      //console.log ("%%%% function after plaintext(), aword = ", aword);
      //console.log (someText);
      console.log ("%%%% searching for keyword = ", keyword);
      var n = someText.indexOf(keyword);
      console.log ("%%%% n = ", n);
      var result = { "n": n.toString(), "urlstring": urlstring };
      res.send(result);
      
    }, function (error) {
        console.log ("--- page open error ---");
        console.log (error);
	      res.status(400).send("Bad Request");
    })
    .finally(function(){
		  horseman.close();
	  });    
});


// -----------------------------------
// UNDER DEVELOPMENT!!! post URL route
// 2017-11-24 URL route using horseman to access phantomjs
// -----------------------------------
app.post ('/url-horsemanplus', function (req, res) {
  var horseman = new Horseman({timeout: 10000});
  var urlstring = req.body.urlstring;
  var keyword = req.body.keyword;
  var results = {};
  
  // get protocol, hostname, port
  console.log("######## req.headers ########");
  console.log(req.headers);
  console.log ("####### req.body #######");
  console.log(req.body);
  
  // check for empty urlstring
  if (urlstring == "") {
    res.status(400).send("Bad Request");
    return;
  }
  
  horseman
    .log("starting horseman")
    .open(urlstring)
    .then ( function(success) {
	      console.log ("--- open success ---");
              console.log (success);
            }, 
            function (error) {
              console.log ("--- open error ---");
              console.log (error);
	      res.status(400).send("Bad Request");
	      //horseman.close();
            }
    )
    .log("### URL ### ").url().log()
    .log("### title ### ").title().log()
    //.log("### PLAIN TEXT ### ").plainText().log()
    //.html().log() // log prints the last call
    .log("### anchor elements ## ").count('a').log() // outputs the number of anchor tags
    .evaluate( function(){
      // This code is executed inside the browser.
      // It's sandboxed from Node, and has no access to anything
      // unless you pass it in. Have access to jQuery, via $, automatically.
      
      var current_title = $(document).attr('title');
      var current_url = document.URL;
      
      if ( !current_title ) {
        var results = "no_title";
        return results;
      }

      //var links = [];
      var results = {};

      $('a').each( function(index) {
        //DO NOT USE!: var link = $(this).attr('href');
        var link = this.getAttribute('href');
        //links.push(link);
        if ((current_url) && (link)) {
          if (link.charAt(0) == "/") {
            link = current_url.concat(link.substring(1));
          }
        }
        results[index] = link;
        });
      
      
      var cleanUrlList = {};	
      var z = 0;
      var newURL;
      for (var x in results) {
        if ((results[x]) && (results[x].substring(0, 4) == 'http'))
        {
          cleanUrlList[z] = results[x];
          //cleanUrlList[z] = {"url": results[x], "title": 
          z++;
        }
      }
      return cleanUrlList; //results;  
    })
    .then(
      function(response) {

        console.log("--- success step ---");
        var count = Object.keys(response).length

        if (response) {
          console.log(response);
          console.log("### count ### " + count);
           
          if (response == "no_title") {
            res.status(404).send("404 Not Found");
            
          } else if (count == 0) {
            res.status(204).send("204 No urls found in html");
          
          } else {
            
            var title = getTitle("http://google.com");
            console.log ("getTitle = ", title);

            res.send(response);
          }

        } else {
          console.log("empty response");
          res.status(404).send("404 Not Found");
        }
      },
      function(error) {
        console.log ("--- error handling ---");
        console.log(error);
        res.status(404).send("404 Not Found");
      }
    )
    .finally(function(){
		  horseman.close();
	  });    
});







// -----------------------------------
// primary post URL route
// 2017-11-18 URL route using horseman to access phantomjs
// -----------------------------------
app.post ('/url-horseman', function (req, res) {
  var horseman = new Horseman({timeout: 10000});
  var urlstring = req.body.urlstring;
  var results = {};
  
  // get protocol, hostname, port
  console.log("######## req.headers ########");
  console.log(req.headers);
  console.log ("####### req.body #######");
  console.log(req.body);
  
  // check for empty urlstring
  if (urlstring == "") {
    res.status(400).send("Bad Request");
    return;
  }

  //var links = [];
  
  horseman
    .log("starting horseman")
    .open(urlstring)
    .then ( function(success) {
	      console.log ("--- open success ---");
              console.log (success);
            }, 
            function (error) {
              console.log ("--- open error ---");
              console.log (error);
	      res.status(400).send("Bad Request");
	      //horseman.close();
            }
    )
    .log("### URL ### ").url().log()
    .log("### title ### ").title().log()
    //.log("### PLAIN TEXT ### ").plainText().log()
    //.html().log() // log prints the last call
    .log("### anchor elements ## ").count('a').log() // outputs the number of anchor tags
    .evaluate( function(){
      // This code is executed inside the browser.
      // It's sandboxed from Node, and has no access to anything
      // unless you pass it in. Have access to jQuery, via $, automatically.
      
      var current_title = $(document).attr('title');
      var current_url = document.URL;
      
      if ( !current_title ) {
        var results = "no_title";
        return results;
      }

      //var links = [];
      var results = {};

      $('a').each( function(index) {
        //DO NOT USE!: var link = $(this).attr('href');
        var link = this.getAttribute('href');
        //links.push(link);
        if ((current_url) && (link)) {
          if (link.charAt(0) == "/") {
            link = current_url.concat(link.substring(1));
          }
        }
        results[index] = link;
      });
      
      
      var cleanUrlList = {};	
      var z = 0;
      var newURL;
      for (var x in results) {
        if ((results[x]) && (results[x].substring(0, 4) == 'http'))
        {
          cleanUrlList[z] = results[x];
          z++;
        }
      }
      return cleanUrlList; //results;  
    })
    .then(
      function(response) {

        console.log("--- success step ---");
        var count = Object.keys(response).length

        if (response) {
          console.log(response);
          console.log("### count ### " + count);
           
          if (response == "no_title") {
            res.status(404).send("404 Not Found");
            
          } else if (count == 0) {
            res.status(204).send("204 No urls found in html");
          
          } else {
            res.send(response);
          }

        } else {
          console.log("empty response");
          res.status(404).send("404 Not Found");
        }
      },
      function(error) {
        console.log ("--- error handling ---");
        console.log(error);
        res.status(404).send("404 Not Found");
      }
    )
    .finally(function(){
		  horseman.close();
	  });    
});








// ----------------------------------
// DEPRECATED!  user interface to test parser
// ----------------------------------
app.get ('/', function (req, res) {
  var htmlin = "submiturl.html";
  // fs.readFile Asynch reads file
  console.log("starting to read");
 
  fs.readFile(htmlin, {enoding: 'utf8'}, function (err, data) {
    if (err) { //throw err;
      console.log("error readFileSync");
      throw err;
      return;
    }
    console.log(data);
    screenout = data;
    
    res.type('html');
    res.send(screenout);
  });
});

// -----------------------------------
// DEPRECATED!!!: post URL route using cheerio
// -----------------------------------
app.post ('/url', function (req, res) {
  var urlstring = req.body.urlstring;
  var results = {}; // don't use new Array() to initialize, easier convert to json
  
  // get protocol, hostname, port
  console.log("######## req.headers ########");
  console.log(req.headers);
  console.log ("####### req.body #######");
  console.log(req.body);
  
  // check for empty urlstring
  if (urlstring == "") {
    res.status(400).send("Bad Request");
    return;
  }

  request (
    { method: 'GET',
      uri: urlstring }, 
    function (err, response, body) {
      if (err) {
        console.error("#### FOUND ERROR: "+ err); 
        res.status(204).send("No urls found in this html (!)");
        return;
      }
      //console.log(body);

      // load html
      $ = cheerio.load(body);
      $('a').each(function(index) {
        results[index] = $(this).attr('href')
        // DON'T USE THIS: results[index] = $(this).getAttribute('href')
        console.log ("links = "+results[index]);
      });

      console.log ($.url);
      console.log ($.documentURI);
      //console.log(results.toString());
      
      // check if empty
      // TODO: test with empty HTML
      var jsonArray = JSON.parse(JSON.stringify(results))
      
      var cleanUrlList = {};	
      var z = 0;
      var newURL;
      for (var x in jsonArray) {
        // -----------------------------
        // Check for urls start with "/"
        // -----------------------------
        if ((jsonArray[x].charAt(0) == "/") ||
                  (jsonArray[x].charAt(0) == "#") ||
                  (jsonArray[x].charAt(0) == "?")) 
        {
          //console.log(jsonArray[x]);
          newURL = "http:???" + jsonArray[x];
          console.log(newURL);
                jsonArray[x] = newURL
        } else {
          cleanUrlList[z] = jsonArray[x];
          z++;
        }
      }
      res.send (cleanUrlList);      
      // TODO: send a 404, it wasn't a bad request and there is no website behind it.
      // TODO: 204 - we got to a website and there was no link on it...
      
  });
});



// -----------------------------------
// NEVER WORKED!!!: URL3 route using node-Phantom and PhantomJS
// -----------------------------------
app.post ('/url3', function (req, res) {
  var urlstring = req.body.urlstring;
  var results = {}; // don't use new Array() to initialize
  
  // get protocol, hostname, port
  console.log("######## req.headers ########");
  console.log(req.headers);
  console.log ("####### req.body #######");
  console.log(req.body);
  
  // check for empty urlstring
  if (urlstring == "") {
    res.status(400).send("Bad Request");
    return;
  }
  
  nodePhantom.create(function(err,ph) {
    return ph.createPage(function(err,page) {
      return page.open(urlstring, function(err,status) {
        console.log("opened site? ", status);
        page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function(err) {
        //jQuery Loaded.
        //Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.
        setTimeout(function() {
          return page.evaluate(function() {
            //Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object.
              var h2Arr = [],
              pArr = [];
              $('h2').each(function() {
                h2Arr.push($(this).html());
              });
              $('p').each(function() {
                pArr.push($(this).html());
              });

              return {
                h2: h2Arr,
                p: pArr
              };
            }, function(err,result) {
              console.log(result);
              ph.exit();
            });
          }, 5000);
        });
	    });
    });
  });
    
});  // end of route /url3


// -----------------------------------
// NEVER WORKED!!!: URL2 route using Phantom and PhantomJS
// -----------------------------------
app.post ('/url2', function (req, res) {
  var urlstring = req.body.urlstring;
  var results = {}; // don't use new Array() to initialize
  
  // get protocol, hostname, port
  console.log("######## req.headers ########");
  console.log(req.headers);
  console.log ("####### req.body #######");
  console.log(req.body);
  
  // check for empty urlstring
  if (urlstring == "") {
    res.status(400).send("Bad Request");
    return;
  }

  if (0) { // set 1 for synch version, 0 for asynch version
    //this is the synchronous version  
    // --------
    // using example code from:
    // https://ourcodeworld.com/articles/read/379/how-to-use-phantomjs-with-node-js
    // --------
    var _ph, _page, _outObj;
    phantom.create().then (function(ph) {
      _ph = ph;
      return _ph.createPage();
 
    }).then(function(page){
      _page = page;
      return _page.open(urlstring);
    
    }).then(function(status){
      console.log(status);
      return _page.property('content')
 
    }).then(function(content){
      console.log(content);
      _page.close();
      _ph.exit();
    
    }).catch(function(e){
      console.log(e); 
    });
  
  } else {
  
    // do the asynch version here
    // -------------
    // Asynch version for node.js 7+
    // to be used for debugging:
    // this prints out the html on the web page from urlstring
    // -------------

    console.log ("**** Inside /URL2 executing asynch branch");
    (async function() {
      const instance = await phantom.create();
      const page = await instance.createPage();
      
      // this works for debugging if page is loading.
      //await page.on('onResourceRequested', function(requestData) {
      //  console.info('Requesting!!', requestData.url);
      //});

      const status = await page.open(urlstring);
      
      const content = await page.property('content');
      //console.log(content);


      // document properties and methods
      //  https://www.w3schools.com/jsref/dom_obj_document.asp
      
      var title = await page.evaluate(function() {
        return document.title;
      });
      console.log("**** TITLE = "+title);

      var pageURL = await page.evaluate(function() {
        return document.URL;
      });
      console.log("**** pageURL = "+pageURL);

/*    var hrefarray = await page.evaluate(function() {
        return document.getElementsByTagName("a");
      });
      console.log("**** hrefarray = "+hrefarray[0]);
*/

      var numlinks = await page.evaluate(function() {
        return document.links.length;
      });
      console.log("**** numlinks = "+numlinks);

      var alllinks = await page.evaluate(function() {
        return document.links;
      });
      
      console.log("**** alllinks[0] = "+alllinks[0].href); // works!!
      //console.log("**** alllinks = "+alllinks[1].href); // NOT work!!
      //for (var i = 0; i<alllinks.length; i++) {
      //  console.log("i = "+alllinks[i]);
      //}

      var hrefone = await page.evaluate(function() {
        return document.querySelector('a');
      });
      console.log("**** hrefone = "+hrefone.href); // works!!

      var hrefmany = await page.evaluate(function() {
        return document.querySelectorAll('a[href*="http"]');
      });
      console.log("**** hrefmany = "+hrefmany);
      //console.log("**** hrefmany = "+JSON.stringify(hrefmany));
      for (var i = 0; i<hrefmany.length; i++) {
        console.log(i+" = "+hrefmany[i]);
      }

      await instance.exit();
    })();
      
  
  }

});  // end of route /url2


// -------------------------  
// DOES NOT WORK!!!: get html from a url and scrape it
// -------------------------  
app.get ('/url', function (req, res) {
  var urlstring = "https://www.google.com/"
  var results = new Array();

  request (
    {
      method: 'GET',
      uri: urlstring
    }, 
    function (err, response, body) {
      if (err) {
         return console.error("#### FOUND AN ERROR: "+err);
      }

      console.log(body);
      
      // load html
      $ = cheerio.load(body);
      $('a').each(function(index) {
        results[index] = $(this).attr('href')
        console.log ("links = "+results[index]);
      });
      console.log(results.toString());

      res.type('text/plain');
      res.send(results.toString());

  });
  
  //Don't output here becuase asynch call!
  //res.type('text/plain');
  //res.send(testout);
});


// ******* LEGACY TEST ROUTES **********
app.get ('/write', function (req, res) {
  
  // test write out to a txt file
  // fs.writeFile ASynchronously writes data to file, replacing if it already exists
  var str = "My string of text2345";
  console.log('str = '+str);
  fs.writeFile('testout.txt', str, function (err) {
    console.log('test write start');  
    if (err) { //throw err;
      console.log("error writeFileSync");
      throw err;
      return;
    }
    console.log('Saved the file');
  });
  
  res.type('text/plain');
  res.send('test /write path v2');
});



app.get ('/read', function (req, res) {
  
  var screenout = "blank";
  var htmlin = "craigslist_test2.txt";
  // test read a txt file
  // fs.readFile Asynch reads file
  console.log("starting to read");
 
  fs.readFile(htmlin, {enoding: 'utf8'}, function (err, data) {
    if (err) { //throw err;
      console.log("error readFileSync");
      throw err;
      return;
    }
    console.log(data);
    screenout = data;
    //res.type('text/plain');
    //res.send(data); 
    //res.send(screenout);
    
    parsehtml(screenout, res); 

  });
  
  //res.type('text/plain');
  //res.send(screenout); 
});

app.listen(app.get('port'), function() {
  console.log('Express sever started on http://localhost:'+
    app.get('port')+'; ctr-c to terminate');
});


