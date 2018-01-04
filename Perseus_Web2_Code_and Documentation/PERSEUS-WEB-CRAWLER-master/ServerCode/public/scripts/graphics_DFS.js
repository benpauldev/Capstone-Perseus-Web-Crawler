// dfs module
/*



Project: Perseus Web Crawler
Title: dfs_graph
Description: This is a js script that recieves an array of 
              json and produces a graph. The json represents 
              url's that have been scraped from links actual
              web html. The graph represents a depth first search
              travesal of nodes, with each node being a url.
Author: Benjamin Fondell
Date: 10/24/2017


*********USEAGE*************************************

Include: <script type="text/javascript" src="dfs_graph.js"></script>

Input: call buildGraph_dfs(array) with an array of json in form:

          {'ID':id,
            'Starting_url': starting_url,
            'Search_type': search type,
            'graph_Node_Container': [
                  {'name':url,
                  'parent': parent,
                  'children' : []
                  }
                  .......]}

Output: The output of the graph is assigned to a designated div in the html.
        the syntax for selecting the div: d3.select(#id). 
        Attributes may be appended to this div in the form of referencing the 
        svg object.

        To see the output in context see below: *html assignment 
        
*/






var buildGraph_dfs = function(jsonData,found)
{
  console.log(jsonData);

//************************************************
//  Functions for parsing input json array into 
// hierarchical json. D3 requires that json be
// descendent from a root in order to build trees
// from json data. This code builds all data, descendent 
// from the first node of the graphNodeContainer array.
//************************************************


// Function for appending {"children:[]"} object on
// each child node if no children object exists.
// This is expected to properly parse the nodes for graphics.
//************************************************

var FOUND = found;

//console.log(jsonDataCopy);

if (FOUND) 
{
 console.log("found");
}
else{
  console.log("not found");
}

  jsonData.graph_Node_Container.forEach(function(d){

      var json_add = {"children":[]};

      if(d.children)
      {
        var count = 0;
        
        d.children.forEach(function(e)
        {
          jsonString = JSON.stringify({"name":e});
          d.children[count] = JSON.parse(jsonString);
          d.children[count].children=[];
          count++;
        });
      }
    });



function spliceArray(array)
{

   // removes nodes if they have no children. still accounted for 
   // in graph by parent node displaying all children
   var emptyChildrenNodes = _.remove(array, function(n)   
   {
      return n.children[0] == null;
   });

  
   for (var i = 1; i < array.length; i++) 
   {
      // if a node has one child and that child            * this is a rare special case which 
      // has no children remove from array               breaks the graphics. Likely not plausible in actual internet.
      if (array[i].children.length == 1)
      {

          if (array[i+1] == null) 
          {
            break;
          }

         if (array[i].children[0].name != array[i + 1].name) 
         {
            array.splice(i,1);
         }
      }
      
   }

   return array;
   
}


// Function that traverses the array appending all 
// child nodes at increasing depth from the root node.
//************************************************

function makeHierarchy(array)
{
   var hierarchy = [];
  hierarchy.push(array[0]);

   for(var i = 1; i < array.length; i++)
   {
       
         hierarchy.push(array[i]);
         
       

          var x = i - 1;
          if (hierarchy[x].children != null) 
          {
             for(var j = 0; j < hierarchy[x].children.length; j++)
             {
                
                if(hierarchy[i].name == hierarchy[x].children[j].name)
                {
                 
                   hierarchy[x].children[j].children = hierarchy[i].children;
                   break;

                }

             }
          }
         
     }

 return hierarchy;
}

var splicedArray = spliceArray(jsonData.graph_Node_Container);
var hierarchical_json = makeHierarchy(splicedArray);
var node_titles = collectTitles(hierarchical_json);

// ***************** NOTE *****************************
// Of several runs with test data only one node was not
// represented by graph. That node is described in the above
// *special case. 
// ***************** NOTE *****************************






//*********************************************************************
//***********************  D3 Graphics ********************************
//*********************************************************************


// ************** Generate the tree diagram  *****************
var margin = {top: 20, right: 20, bottom: 20, left: 20},
 width = 750 - margin.right - margin.left,
 height = 500 - margin.top - margin.bottom;

var strokeWidth = .5;
var sourceRadius = 9;
var radius = 2.5;
var visitedNodeRadius = 5.5;
var scale = 1;
var textSize = 10;
var maxZoom = 80;
var xScale = 10;
 
var svg = d3.select(".graph"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

svg.style("background-color",'E9FAF9');
var g = svg.append("g").attr("transform", "translate(" + (50) + "," + (0) + ")");

var zoom = svg.call(d3.zoom()
            .scaleExtent([1 / 2, maxZoom])
            .on("zoom", zoomed));


function zoomed() {
  scale = d3.zoomTransform(this).k;
  g.attr("transform", d3.event.transform);
  d3.selectAll('circle').attr('r', function (d, i){
      if (d == root) 
      {
        return pointScale(sourceRadius,scale);
      }
      if(d.data.children.length != 0)
      {
        return pointScale(visitedNodeRadius,scale);
      }
      else{
        return pointScale(radius,scale);
      }
   })
  .style("stroke-width", function(d,i){
    return pointScaleStroke(strokeWidth,scale);
  });
  d3.selectAll(".link").style("stroke-width",function(d,i)
  {
    return pointScaleStroke(strokeWidth,scale);
  });
 
}

 function pointScaleX(x, zoomScale){
      var maxPossibleZoom = maxZoom; 
      var sizeFloor = .5;
      var size = x * ((maxPossibleZoom - zoomScale)/maxPossibleZoom);
      if (size > x){
          return x;
      } else if (size < sizeFloor){
          return sizeFloor;
      } else {
          return size;
      }
 }

function pointScale(rad, zoomScale){
      var maxPossibleZoom = maxZoom; 
      var sizeFloor = .025;
      var size = rad * ((maxPossibleZoom - zoomScale)/maxPossibleZoom);
      if (size > rad){
          return rad;
      } else if (size < sizeFloor){
          return sizeFloor;
      } else {
          return size;
      }
 }

 function pointScaleStroke(stroke, zoomScale){
      var maxPossibleZoom = maxZoom; 
      var sizeFloor = .025;
      var size = stroke * ((maxPossibleZoom - zoomScale)/maxPossibleZoom);
      if (size > stroke){
          return stroke;
      } else if (size < sizeFloor){
          return sizeFloor;
      } else {
          return size;
      }
 }

function handleMouseOver(d, i) {  // Add interactivity
  // Use D3 to select element, change color and size
  //console.log("in mouseover");
  d3.select(this)
      .style("fill","orange")
      .attr("r", function(d){
            if(d == root){
              return 2 * (pointScale(sourceRadius,scale));
            }
             if(d.data.children.length != 0)
            {
              return 2 * pointScale(visitedNodeRadius,scale); 
            }
            else{
              return 3 * (pointScale(radius,scale)); 
            }
          });

  d3.select('#blowup')
      .text(d.data.name)      
      .transition()       
      .style('opacity', 1);
}

function handleMouseOut(d, i) {
  // Use D3 to select element, change color back to normal
    d3.select(this)
          .style("fill", function(d){
          if (FOUND == true && d.data.children.length != 0) 
          {
            console.log(d);
             var last = isLastNode(d);

            if (last) 
            {
              return "#22F518"; 
            }
           }
           if(d == root)
            {
              return "#F5EB18";
            }
            if(d.data.children.length != 0)
            {
              return "#F51818";
            }
            else
            {
              return "black";
            }
          })
          .attr("r",function(d){
            if(d == root){
              return pointScale(sourceRadius,scale);
            }
            if(d.data.children.length != 0) 
            {
              return pointScale(visitedNodeRadius,scale);
            }
            else{
              return pointScale(radius,scale);
            }
          });

   d3.select('#blowup')      
          .transition()
          .duration(1500)
          .style('opacity', 0);

}

var tree = d3.tree()
    .size([900, 900])
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

var d3data = d3.hierarchy(hierarchical_json[0]);


var root = tree(d3data);

var link = g.selectAll(".link")
  .data(tree(root).links())
  .enter().append("path")
    .attr("class", "link")
    .attr("d", d3.linkHorizontal()
        .x(function(d) { return d.y; })
        .y(function(d) { return d.x; }))
    .style("stroke-width",strokeWidth)
    .style("opacity", 0)
    .transition()
    .duration(300)
    .delay(function(d,i) {
      return i;
    })
    .style("opacity", 1);

var node = g.selectAll(".node")
  .data(root.descendants())
  .enter().append("g")
    .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
    .on("mouseover",function(d){
        displaytitle(d);
        var dot = d3.select(this);
        var linkName = dot.append("text")
          .classed('info',true)
          .attr("dy", "0.31em")
          .attr("x", function(x){
            return pointScaleX(xScale,scale);
          })
          .style("text-anchor", "start")
          .style("font-size",function(d){
            if(scale > 79){
              return 5 * pointScale(textSize,scale);
            }
            if(scale > 6){
              return pointScale(textSize,scale) / 2;
            }
            else return pointScale(textSize,scale);
          })
          .text(function(d){return d.data.name});
      })
    .on("mouseout",function(d){
        d3.select(this).select('text.info').remove();
        removetitle(d); 
      })
    .on("click", function(d){

        var urlLink = d.data.name;

        window.open(urlLink);

      });

console.log(node);

node.append("circle")
      .attr("r", function(d){
        if (d == root) 
        {
          return pointScale(sourceRadius,scale);
        }
        if(d.data.children.length != 0)
        {
          return pointScale(visitedNodeRadius,scale); 
        }
        else{
          return pointScale(radius,scale);
        }
      })
      .attr("id", function(d) { return d.data.uniqueID; })
      .style("fill",function(d){
         if (FOUND == true && d.data.children.length != 0) 
        {
          console.log(d);
           var last = isLastNode(d);

          if (last) 
          {
            return "#22F518"; 
          }
         }
       if(d == root)
        {
          return "#F5EB18";
        }
        if(d.data.children.length != 0)
        {
          return "#F51818";
        }
        else
        {
          return "black";
        }
      })
    .on("mouseover",handleMouseOver)
    .on("mouseout",handleMouseOut)
    .style("opacity", 0)
    .transition()
    .duration(300)
    .delay(function(d,i) {
      return i;
    })
    .style("opacity", 1);




  d3.select("#resetButton").on("click",resetted);

  function resetted() 
  {
    g.attr("transform", "translate(" + (50) + "," + (0) + ")");
  }


//new
function collectTitles(array){

  var titles = [];

  array.forEach(function(d){

    if (d.title)
    {
      titles.push(d);
    }

    if(d.children)
    {
      d.children.forEach(function(e){

        if (e.title)
        {
          titles.push(e);
        }

      })
    }

  });

  return titles;
}

  //new
  function displaytitle(node)
  {

    node_titles.forEach(function(d){

      if(node.data.name == d.name)
      {
          if(d.title != null){
             d3.select('#titleBlowup')
            .text(d.title)      
            .transition()       
            .style('opacity', 1);
        }
      }

    });
  }

  //new
  function removetitle(node)
  {

    node_titles.forEach(function(d){


      if(node.data.name == d.name)
      {
        if(d.title != null){
          d3.select('#titleBlowup')      
          .transition()
          .duration(1500)
          .style('opacity', 0);
        }
      }

    });
  }

  function isLastNode(node)
  {
    console.log(node_titles);
    
    if (node.data.name == node_titles[node_titles.length - 1].name)
    {
      return true;
    }

    else return false;

  }

};









































