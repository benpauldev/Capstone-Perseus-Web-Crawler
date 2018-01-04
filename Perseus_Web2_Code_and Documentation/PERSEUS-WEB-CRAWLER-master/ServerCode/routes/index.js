var express = require('express');
var cookieParser = require('cookie-parser');
var request = require('request');
var cytoscape = require('cytoscape');
//*********************Collection Containers************************
function Graph_collection(ID,Starting_url, Search_type, graph_Node_Container,keyword)
{
        this.ID = ID;   //INT references client request
	this.Starting_url = Starting_url;       // String
        this.Search_type = Search_type; // String DFS or BFS
        this.graph_Node_Container = graph_Node_Container; // an array of Graph_nodes
	this.keyword = keyword;
}
function Graph_node(name, parent, children, title,n)
{
        this.name = name;
        this.parent = parent;
        this.children = children;
	this.title = title;
	this.n = n;
}

//Global scope variables
var limit;
var search_Array = [];
var visitables = [];
//***********post request function******
function get_children(node,cb)
{
       // console.log(node);
        if(node == null)
	{	
		cb("bad url");
		return;
	}
        var url = node.name;
        var check = url.slice(0,4);
        if(check != "http")
        {
                //console.log("caught bad request");
                //console.log(url);
                cb("bad url");
        }
        else
        {
                var API_req = {};
                API_req.headers = {'content-type' : 'application/x-www-form-urlencoded'};
                API_req.url = "http://ip-172-31-20-178.us-west-2.compute.internal:3001/url-horseman";
                API_req.body = "urlstring=" + url;
                //process.stdout.write("\nAPI CALL ");
                request.post(API_req, function(error, response, body)
                {
			//console.log(response.statusCode);
                        if(response.statusCode == 200)
                        {
                                var body_obj = JSON.parse(body);
				//console.log(body_obj);
                                for(var key in body_obj)
                                {
                                        //console.log(body_obj[key]);
                                        node.children.push(body_obj[key]);
                                }
                                get_title(node, response.statusCode, cb);
                        }
			else if(response.statusCode == 204)
                        {
                                get_title(node, response.statusCode, cb);
                        }
			else
			{
				cb("bad url",response.statusCode);
			}
                });
        }
}
function get_title(node,code,cb)
{
        var url = node.name;
	var API_req = {};
        API_req.headers = {'content-type' : 'application/x-www-form-urlencoded'};
        API_req.url = "http://ip-172-31-20-178.us-west-2.compute.internal:3001/title";
        API_req.body = "urlstring=" + url;
        request.post(API_req, function(error, response, body)
        {
		//	console.log(response.statusCode);
	        if(response.statusCode == 200)
		{
        	       	var responseJSON = JSON.parse(body);
		//	console.log(responseJSON);
			node.title = responseJSON.title;
		}
		cb(node,code);
	});
}
function create_collection(client_id,starting_URL, search_type, keyword)
{
        //console.log("function: create collection");
        //console.log(client_id + " " + starting_URL + " " + search_type);
        //************the starting spot*************
        var collection_object = new Graph_collection(client_id, starting_URL,search_type, [],keyword);
        var source_node = new Graph_node(starting_URL, -1, [],"no title", -1);
        collection_object.graph_Node_Container.push(source_node);
        return collection_object;
}
function validate_root(collection, cb)
{

	var targetURL = collection.graph_Node_Container[0].name;
	request.get({
            url: targetURL
        },
        function (err, httpResponse, body) {
		cb(collection);	
	});	

}
// Main Router
var app = express.Router();

// HOME PAGE
app.get('/',function(req,res)
{
//      console.log("route: homepage");
        var os = require("os");
	var cookie = req.cookies.search_history;
	var context = {};
	if(cookie === undefined)
	{
		// make a cookie
		res.cookie('search_history', [], {maxAge: 360000, httpOnly: false});
	//	console.log('new user, cookie created');		
	}
	else
	{	
	//	console.log('cookies: ', req.cookies);
		context.history = JSON.stringify(req.cookies);
	}
        context.port = process.argv[2];
        res.render('home', context);
});
// Start crawl post button
app.post('/keyword', function(req,res,next)
{
        var client_data = req.body;
	var formData = client_data.req_data;
	//console.log(formData);
	request.post({
            url: 'http://ip-172-31-20-178.us-west-2.compute.internal:3001/keyword',
            form: formData
        },
        function (err, httpResponse, body) {
		//console.log(body);
		res.send(body);
	 });	

});
app.post('/updateCookie', function(req,res,next)
{
	var client_data = req.body;
	var cookie_string = JSON.stringify(client_data.search_obj.search_history);
	res.cookie('search_history', cookie_string, {maxAge: 3600000, httpOnly: false});
	res.send(client_data.search_obj);
});
app.post('/startCrawl', function(req,res,next)
{
//      console.log("Starting collection.");
        var client_data = req.body;
//      console.log(client_data);
        var ST = client_data.search_type;
        var SU = client_data.starting_url;
	var KW = client_data.keyword;
        var collection = create_collection(client_data.id,SU,ST,KW);
	function cb(collection){
		res.send(collection);
	}
      	validate_root(collection,cb);  

});
app.post('/getChildren', function(req,res,next)
{

        //console.log("route: getChildren");
        var client_data = req.body;
        //console.log(client_data);
        var return_obj = {};
        return_obj.arr = [];
        var count = client_data.count;
        var processed = 0;
        var cb = function(node,code)
        {
		if(node == "bad url")
		{
			return_obj.bad_url = true;
		}
		else
		{
			return_obj.bad_url = false;
		}
                return_obj.arr.push(node);
                processed ++;
                if(processed == count)
                {
                        res.send(return_obj);
                }
        };
        for (var i = 0; i < count; i++)
        {
                setTimeout(function(x){
                         return function() {
                //              console.log("timeout..." + x);
                                get_children(client_data.node_arr[x],cb);
                         };
                }(i), i);
        }
});

app.get('/graph',function(req,res)
{
        //res.render('graph');
});
// var newSection = require('./folder/index.js')
// app.use('/folder', newSection);

//************Generic Error Handling*******************************************
app.use(function(req, res) {
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.type = ('text/plain');
  res.status(500);
  res.render('500');
});
//*****************************************************************************

module.exports = app;
                                                                      
                                                                     

