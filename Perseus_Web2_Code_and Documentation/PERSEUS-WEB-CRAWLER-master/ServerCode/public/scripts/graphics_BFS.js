/*



Project: Perseus Web Crawler
Title: bfs_graph
Description: This is a js script that recieves an array of 
              json and produces a graph. The json represents 
              url's that have been scraped from links actual
              web html. The graph represents a breadth first search
              travesal of nodes, with each node being a url.
Author: Benjamin Fondell
Date: 10/24/2017


*********USAGE*************************************

Include: <script type="text/javascript" src="bfs_graph.js"></script>

Input: call buildGraph_bfs(array) with an array of json in form:

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






var buildGraph_bfs = function(jsonData,found) 
{
  
//console.log("console.log(jsonData) : ");
//console.log(jsonData);
//console.log("console.log(jsonData.found) : " + jsonData.found);


//console.log(jsonDataCopy);
var FOUND = found;

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


function makeHierarchy(array)
{


   var i = array.length - 1;
   var j = 0;

   for(i; i > -1; i--)
   {
      //console.log(array[i].name);
      if (array[i].parent == -1) 
      {
         //console.log(array[i].name);
         //console.log("return");  
         return array;
      }
      if(array[i].children)
      {
         //console.log(array[i].name);
         //console.log(array[i].parent);

         for(j = 0;j < array[array[i].parent].children.length; j++)
         {
            //console.log(array[array[i].parent].name);
            if (array[array[i].parent].children[j].name == array[i].name) 
            {
               //console.log("PARENT: "+array[array[i].parent].children[j].name + " CHILD: " + array[i].name);
               array[array[i].parent].children[j].children = array[i].children;
            }
         }
      }
   }

}



var hierarchical_json = makeHierarchy(jsonData.graph_Node_Container);
var node_titles = collectTitles(hierarchical_json);


var svg = d3.select(".graph"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    g = svg.append("g").attr("transform", "translate(" + (570) + "," + (500) + ")");

var strokeWidth = .5;
var sourceRadius = 7;
var visitedNodeRadius = 5; 
var radius = 1;
var scale = 1;
var textSize = 10;
var maxZoom = 20;
var xScale = 8;

svg.style("background-color",'E9FAF9');
svg.call(d3.zoom()
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

function pointScale(rad, zoomScale){
      var maxPossibleZoom = maxZoom; 
      var sizeFloor = .25;
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
      var sizeFloor = .1;
      var size = stroke * ((maxPossibleZoom - zoomScale)/maxPossibleZoom);
      if (size > stroke){
          return stroke;
      } else if (size < sizeFloor){
          return sizeFloor;
      } else {
          return size;
      }
 }

 function pointScaleX(x, zoomScale){
      var maxPossibleZoom = maxZoom; 
      var sizeFloor = 2;
      var size = x * ((maxPossibleZoom - zoomScale)/maxPossibleZoom);
      if (size > x){
          return x;
      } else if (size < sizeFloor){
          return sizeFloor;
      } else {
          return size;
      }
 }

var tree = d3.cluster()
    .size([360, 390])
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

var d3data = d3.hierarchy(hierarchical_json[0]);


var root = tree(d3data);


var link = g.selectAll(".link")
    .data(root.descendants().slice(1))
    .enter().append("path")
      .attr("class", "link")
      .attr("d", function(d) {
        return "M" + radialPoint(d.x, d.y)
            + "C" + radialPoint(d.x, (d.y + d.parent.y) / 2)
            + " " + radialPoint(d.parent.x, (d.y + d.parent.y) / 2)
            + " " + radialPoint(d.parent.x, d.parent.y);
      })
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
      .attr("pointer-events","all")
      .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
      .attr("transform", function(d) { return "translate(" + radialPoint(d.x, d.y) + ")"; })
      .on("mouseover",function(d){
        displaytitle(d);
        var dot = d3.select(this);
        var linkName = dot.append("text")
          .classed('info',true)
          .attr("dy", ".31em")
          .attr("x", function(d) { return d.x < 180 === !d.children ? pointScaleX(maxZoom,scale) : -pointScaleX(maxZoom,scale); })
          .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
          .style("font-size",function(d){
            if(scale > 19){
              return 4 * pointScale(textSize,scale);
            }
            else return pointScale(textSize,scale);})
          .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
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
        else
        {
          return pointScale(radius,scale);
        }
      })
      .style("stroke-width",strokeWidth)
      .style("fill",function(d)
      {
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
        else{

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

      
function radialPoint(x, y) {
  var angle = (x - 90) / 180 * Math.PI, radius = y;
  return [radius * Math.cos(angle), radius * Math.sin(angle)];
}


  function handleMouseOver(d, i) {  // Add interactivity
      //console.log(d3.select(this));
      // Use D3 to select element, change color and size
      
      d3.select(this)
          .style("fill","orange")
          .attr("r", function(d){
            if(d == root){
              return 2 * (pointScale(sourceRadius,scale));
            }
            if(d.data.children.length != 0)
            {
              return pointScale(visitedNodeRadius,scale); 
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



  d3.select("#resetButton").on("click",resetted);

  function resetted() 
  {
    g.attr("transform", "translate(" + (570) + "," + (500) + ")");
  }


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








};//eof
