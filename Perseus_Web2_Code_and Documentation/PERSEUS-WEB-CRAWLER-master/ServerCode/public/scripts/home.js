var DFS = document.getElementById("DFS");
var BFS = document.getElementById("BFS");
var crawl_button = document.getElementById("crawl_button");
var limit_slider = document.getElementById("limit_slider");
var limit_value = document.getElementById("limit_value");
var starting_url = document.getElementById("starting_url");
var output_area = document.getElementById("output_area");
var progdiv = document.getElementById("progdiv");
var u_feedback = document.getElementById("u_feedback");
var s_feedback = document.getElementById("s_feedback");
progdiv.style.display="none";
var progwords = document.getElementById("progwords");
var progress_area = document.getElementById("progress_area");
var history_area = document.getElementById("history_area");
var history_table = document.getElementById("history_table");
var output_area = document.getElementById("output_area");
var search_form = document.getElementById("search_form");
var results_form = document.getElementById("results_form");
var reset_button = document.getElementById("reset_button");
var the_svg = document.getElementById("svg");
var view_select = document.getElementById("view_select");
var graph_container = document.getElementById("svgContainer");
var node_list = document.getElementById("node_list");
var traversal = document.getElementById("traversal");
var keyword_field = document.getElementById("keyword_field");
var bfs_icon = document.getElementById("bfs_icon");
var dfs_icon = document.getElementById("dfs_icon");
var checked_src ="./images/checked.jpg";
var unchecked_src ="./images/unchecked.jpg";
view_select.addEventListener("change", view_selector);
limit_slider.addEventListener("change",setSliderVal);
crawl_button.addEventListener("click", start_crawl);
reset_button.addEventListener("click", reset_page);
var collection;
var output_test;
var processing = [];
var visitables = [];
var search_Array = [];
var limit;
var port_num = document.getElementById("port_holder").innerHTML;
var search_history = document.getElementById("cookie_holder").innerHTML; 
var search_obj;
var url = "http://ec2-54-148-189-221.us-west-2.compute.amazonaws.com:" + port_num;
bfs_icon.addEventListener("click", check_bfs);
dfs_icon.addEventListener("click", check_dfs);
//console.log(url);

function reset_page()
{
	history_area.style.display="none";
	clear_table();
	view_select.selectedIndex=0;
	u_feedback.style.display="none";
	s_feedback.style.display="none";
	results_form.style.display="none";
	output_area.style.display="none";
	progdiv.style.display="none";
	starting_url.value="";
	keyword_field.value="";
	search_form.style.display="block";
	traversal.style.display="none";
	graph_container.style.display="none";
	node_list.style.display="none";
	progwords.innerHTML=" ";
	progress_area.style = "width: 0;";
	DFS.checked=false;
	BFS.checked=false;
	set_icon_images();
	set_history();
}
function check_bfs()
{
	bfs_icon.src = checked_src;
	dfs_icon.src = unchecked_src;
}
function check_dfs()
{
	dfs_icon.src = checked_src;
	bfs_icon.src = unchecked_src;
}
function set_icon_images()
{
        if (DFS.checked == true)
        {
		dfs_icon.src = checked_src;
		bfs_icon.src = unchecked_src;
        }
        if (BFS.checked == true)
        {
		bfs_icon.src = checked_src;
		dfs_icon.src = unchecked_src;
        }
}
function set_history()
{
	if(search_history.length > 0)
	{
		search_obj = JSON.parse(search_history); 
		var json_array;
		if(typeof(search_obj.search_history) === 'string')
		{
			json_array = JSON.parse(search_obj.search_history);
			search_obj.search_history = json_array;
		}
		else 
		{
			json_array = search_obj.search_history;
		}
		if(json_array.length > 0)
		{
			set_search_table(json_array);
		}
	}
}
function Graph_node(name, parent, children,title, n)
{
        this.name = name;
        this.parent = parent;
        this.children = children;
	this.title = title;
	this.n = n;
}

function get_random_id()
{
        var digit;
        var id = "";
        for(i = 0; i < 10; i ++)
        {
                digit = Math.floor(Math.random() * 10);
                id = id + digit.toString();
        }

        return id;
}
function setSliderVal()
{
        limit_value.value = limit_slider.value;
}
function start_crawl()
{
	the_svg.innerHTML="";
	s_feedback.style.display="none";
	u_feedback.style.display="none";
	output_area.style.display="none";
	visitables = [];
        processing = [];
        search_Array = [];
        var search_type;
        if (DFS.checked == true)
        {
                search_type = "DFS";
		
        }
        else if (BFS.checked == true)
        {
		
		search_type = "BFS";
        }
        else
        {		
		search_error();
        	return;
        }
	validateURL(function(starting_spot){
		history_area.style.display="none";
	        var payload = {};
	        var client_id = get_random_id();
	        payload.id = client_id;
		payload.starting_url = starting_spot;
	        payload.search_type = search_type;
		payload.keyword = keyword_field.value;
	        limit = limit_slider.value;
		update_cookie(starting_spot,keyword_field.value,search_type,limit);
	        //console.log(payload);
	        var target = url + "/startCrawl";
	        //console.log(target);
	        makePostReq(payload, target, startCollection);
	});
}
function validateURL(callback)
{
	testURL = starting_url.value;
	if(testURL.length < 2)
	{
		url_error();
		return;
	}
	var scheme = testURL.slice(0,8);
	if(scheme == "https://")
	{
		callback(testURL);
		return;
	}
	scheme = scheme.slice(0,7);
	if(scheme == "http://")
	{
		callback(testURL);
		return;
	}
	testURL = "http://" + testURL;
	starting_url.value = testURL;
	callback(testURL);
}
function search_error()
{
	s_feedback.style.display="block";
	progdiv.style.display="none";
        return;
}
function url_error()
{
	u_feedback.style.display="block";
	progdiv.style.display="none";
        return;
}
function startCollection(data)
{
        collection = JSON.parse(data);
	collection.found = false;
	if(collection.code)
	{	
		url_error();
	}
	else
	{
		progdiv.style.display="block";
		progwords.innerHTML="crawling...";
		collection.graph_Node_Container[0].children = [];
		processing.push(collection.graph_Node_Container[0]);
	        collection.graph_Node_Container.splice(0,1);
	        add_children_to_nodes();
	}

}
function add_children_to_nodes()
{
        var count = processing.length;
        var target = url + "/getChildren"
        payload = {};
        payload.count = count;
        payload.node_arr = processing;
        var returnedData;
        var req = new XMLHttpRequest();
        req.open('POST',target,true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load',function()
        {
                if(req.status >= 200 && req.status < 400)
                {
			returnedData = JSON.parse(req.response);
			//console.log(returnedData);
			if(returnedData.bad_url == false)
			{
	                        visitables.unshift(returnedData.arr[0]);
				processing = [];
				remove_same_site_dupes();
			}
			else
			{
			        if(visitables.length == 0)
				{
					if(search_Array.length == 0)
					{
						url_error();
					}
					else
					{
						finish_and_display("no visitables");
					}

				}
				else
				{		
					processing = [];
               				processing.push(visitables[0]);
				        visitables.splice(0,1);
			                add_children_to_nodes();
				}
			}
                }
                else
                {
                        console.log("Error in network request: " + req.statusText);
                }
        });
        req.send(JSON.stringify(payload));
}
function remove_same_site_dupes()
{
	var node = visitables[0];
	var i = 0;
	var j = 0;
	while(i < node.children.length - 1)
	{
		j = i + 1;
		while(j < node.children.length)
		{
			if(node.children[i] === node.children[j])
			{
				node.children.splice(j,1);
				//console.log("child duplicate:", node.children[i]);		
			}		
			else	
			{
				j++;
			}
		}
		i++;
	}
	find_KW();
}
function randomize_children(arr)
{
        var choices = [];
        for(i = 0; i < arr.length; i++)
        {
                choices.push(arr[i]);
        }
        count = choices.length;
        var random_index;
        var node;
        var duplicate;
		 for(var i = 0; i < count; i ++)
        {
                duplicate = false;
                random_index = Math.floor(Math.random() * choices.length);
                node = choices[random_index];
                visitables.unshift(node);
                choices.splice(random_index,1);
        }
        processing = [];
	trim_dupes(function(){
	        add_children_to_nodes();
	});
}
function find_KW()
{
	var arr_len = search_Array.length;
	var kw_len = collection.keyword.length;
	if(arr_len > 0 && kw_len > 0)
	{
		payload = {};
		kw_api_req = {};
		kw_api_req.urlstring = search_Array[arr_len - 1].name;
		kw_api_req.keyword = collection.keyword;
		payload.req_data = kw_api_req;
	        makePostReq(payload, url + "/keyword", check_KW);
	}
	else
	{
		visit_first_node();
	}
}
function check_KW(result)
{
	var data = JSON.parse(result);
	if(data.n != -1)
	{
		finish_and_display("keyword found");
		collection.found = true;
	}
	else
	{	
		visit_first_node();
	}
}
function visit_first_node()
{
//      console.log("adding node to search_Array.");
//      console.log("visitables size:" + visitables.length);
//      console.log(visitables);
	
        if(visitables.length == 0 || search_Array.length >= limit)
        {
                finish_and_display("node_limit");
        }
        else
        {
		
                search_Array.push(visitables[0]);
        //      console.log(search_Array);
                var progress;
		var width = "width: ";
		progress = Math.floor((((search_Array.length) / limit)) * 100);
		width = width + progress + "%";
		progwords.innerHTML="crawling... " + progress + "% complete";
		progress_area.style = width;
	//      console.log("search array size:" + search_Array.length);
        //      console.log(search_Array);
                var node = visitables[0];
                visitables.splice(0,1);
                create_nodes_from_children(node);
        }
}
function finish_and_display(message)
{
	var lone_found = false;	
	if(message === "keyword found")
	{
		lone_found = true;
	}

        progwords.innerHTML="done!";
	search_form.style.display="none";
	results_form.style.display="block";
	output_area.style.display="block";
        var count = 0;
	output_test = [];	
        while (count < limit && search_Array.length > 0)
        {
                collection.graph_Node_Container.push(search_Array[0]);
		output_test.push(search_Array[0]);
                search_Array.splice(0,1);
                count ++;
        }
	//console.log(output_test);
	create_node_list(output_test);
	//console.log(collection);
	//console.log(collection.found);
	//console.log(lone_found);
        visitables = [];
	if(collection.graph_Node_Container.length == 0)
	{
		//single node output
		//the_svg.innerHTML = ".   The starting URL contains no links to other websites";
	}
	else
	{
		graph_container.style.display="block";
	        if(collection.Search_type == "DFS")
	        {
	                buildGraph_dfs(collection,lone_found);
	        }
	        if(collection.Search_type == "BFS")
	        {
	                buildGraph_bfs(collection,lone_found);
	        }
		
	}
}

function create_nodes_from_children(node)
{
        //console.log(node);
        //console.log(visitables);

        var current_length = node.children.length;
        var parent_index = search_Array.indexOf(node);
        processing = [];
        for(var website in node.children)
        {
                var new_node = new Graph_node(node.children[website],parent_index,[],"no title",-1);
                processing.push(new_node);
        }
        if(collection.Search_type == "DFS")
        {
                randomize_children(processing);
        }
        if(collection.Search_type == "BFS")
        {
                for(var i in processing)
                {
               		visitables.push(processing[i]);
                }
                processing = [];
		trim_dupes(function(){
			add_children_to_nodes();
		});
        }
}
function trim_dupes(cb)
{
	if(visitables.length > 0 )
	{	var name = String(visitables[0].name);
		processing.push(visitables[0]);
		visitables.splice(0,1);
		var dupe = false;
		for(var nodes in search_Array)
		{
			if(search_Array[nodes].name === name)
			{
				//console.log("visitation duplicate:",search_Array[nodes].name, name);
				dupe = true;
			}
		}
		if(dupe == true)
		{
			processing.splice(0,1);
			trim_dupes(cb);
		}
		else
		{
			cb();
		}
	}
	else
	{
		finish_and_display("no where left to go");
	}
}
function view_selector()
{
	if(view_select.value == "graph")
	{
		node_list.style.display="none";
		traversal.style.display="none";
		graph_container.style.display="block";
	}
	if(view_select.value == "JSON")
	{
		traversal.style.display="none";
		graph_container.style.display="none";
		node_list.style.display="block";

	}
	if(view_select.value == "Traversal")
	{
		graph_container.style.display="none";
		node_list.style.display="none";
		traversal.style.display="block";
		create_cyto(output_test);
	}
}
function clear_table()
{
	var targetTable = document.getElementById("node_table");
	var header = targetTable.firstElementChild;
	while(header.nextElementSibling)
	{
		targetTable.removeChild(header.nextElementSibling);
	}
	targetTable = document.getElementById("history_table");
	header = targetTable.firstElementChild;
	while(header.nextElementSibling)
	{
		targetTable.removeChild(header.nextElementSibling);
	}
}
function create_node_list(node_arr)
{
	var targetTable = document.getElementById("node_table");
	for(var node in node_arr)
	{
		var newRow = document.createElement("tr");
		newRow.addEventListener("mouseover", row_mouseover);
		newRow.addEventListener("mouseout", row_mouseout);
		newRow.addEventListener("click", row_click);
		
		var currentNode = node_arr[node];
		var rowNumCell = document.createElement("td");
		var urlCell = document.createElement("td");
		var parentCell = document.createElement("td");
		var childrenCell =  document.createElement("td");
		rowNumCell.innerHTML = Number(node) + 1;
		urlCell.innerHTML = node_arr[node].name;
		if(node_arr[node].parent == -1)
		{	
			parentCell.innerHTML = "root";
		}
		else
		{
			parentCell.innerHTML = Number(node_arr[node].parent) + 1;
		}	
		newRow.className = "shres";	
		rowNumCell.className="shres";
		urlCell.className="wide";
		parentCell.className="shres";
		childrenCell.className="shres";
		
		childrenCell.innerHTML = node_arr[node].children.length;
		newRow.appendChild(rowNumCell);
		newRow.appendChild(urlCell);
		newRow.appendChild(parentCell);
		newRow.appendChild(childrenCell);
		targetTable.appendChild(newRow);
	}	
}                   
function set_search_table(arr)
{
	var targetTable = document.getElementById("history_table");
	arr.reverse();
	for(var search in arr)
	{
		var newRow = document.createElement("tr");
		newRow.addEventListener("mouseover", row_mouseover);
		newRow.addEventListener("mouseout", row_mouseout);
		newRow.addEventListener("click", history_click);
		
		var cur_search = arr[search];
		var rowNumCell = document.createElement("td");
		var urlCell = document.createElement("td");
		var keywordCell = document.createElement("td");
		var searchTypeCell = document.createElement("td");
		var limitCell = document.createElement("td");
		rowNumCell.innerHTML = Number(search) + 1;
		urlCell.innerHTML = arr[search].url;
		keywordCell.innerHTML = arr[search].keyword;
		searchTypeCell.innerHTML = arr[search].type;
		limitCell.innerHTML = arr[search].limit;
		
		newRow.className = "shres";	
		rowNumCell.className="shres";
		urlCell.className="wide";
		keywordCell.className="shres";
		searchTypeCell.className="shres";
		limitCell.className="shres"
	
		newRow.appendChild(rowNumCell);
		newRow.appendChild(urlCell);
		newRow.appendChild(keywordCell);
		newRow.appendChild(searchTypeCell);
		newRow.appendChild(limitCell);
		targetTable.appendChild(newRow);
	}	
	history_area.style.display="block";	
} 
function row_mouseover()
{
	event.preventDefault();
	this.setAttribute("style","background-color:blue;color:white;");
}
function row_mouseout()
{
	event.preventDefault();
	this.setAttribute("style","background-color:white;color:black;");
}
function row_click()                          
{
	event.preventDefault();
	var newsiteurl = this.firstElementChild.nextElementSibling.innerHTML;
	window.open(newsiteurl);
}
function update_cookie(start,keyword,type,lim)
{
	var obj ={};
	obj.url = start;
	obj.keyword= keyword;
	obj.type = type;
	obj.limit = lim;
	if(search_history.length < 1)
	{		
		search_obj = {};
		search_obj.search_history = [];
	}
	search_obj.search_history.push(obj);
	var payload = {};
	payload.search_obj = search_obj;
	//console.log(payload);
	makePostReq(payload,url + "/updateCookie",function(data){
		var cookie_holder=document.getElementById("cookie_holder");
		cookie_holder.innerHTML=data;	
		search_history=data;
		//console.log(cookie_holder.innerHTML);
	});
	
}
function history_click()                          
{
	var SU = this.firstElementChild.nextElementSibling.innerHTML;
	var KW = this.firstElementChild.nextElementSibling.nextElementSibling.innerHTML;
	var ST = this.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.innerHTML;
	limit_slider.value = Number(this.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.innerHTML);
	limit_value.value = limit_slider.value;
	starting_url.value=SU;
	keyword_field.value=KW;
	if(ST == "DFS")
	{		
	        DFS.checked = true;
	        BFS.checked = false;
	}
	if(ST == "BFS")
	{
	        DFS.checked = false;
	        BFS.checked = true;
	}	
	set_icon_images();
	start_crawl();
}
reset_page();

