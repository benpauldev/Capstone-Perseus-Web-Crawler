// Cytoscape spike
function create_cyto(node_arr)
{

	var nodes = [];
	var edges = [];
	// create nodes
	for(var node in node_arr)
	{
		var new_node = {};
		new_node.data = {};
		new_node.data.id = node_arr[node].name;
		new_node.data.title = node_arr[node].title;
		new_node.data.visit = node;
		nodes.push(new_node); 	
	}
	//create edges
	for(var node in node_arr)
	{
		var current_node = node_arr[node];
		if(current_node.parent != -1)
		{
			var idstring = current_node.name;
			idstring = idstring + node_arr[current_node.parent].name;
			var new_edge = {};
			new_edge.data = {};
			new_edge.data.id = idstring;
			new_edge.data.source = node_arr[current_node.parent].name;
			new_edge.data.target = current_node.name;
			edges.push(new_edge);
		}
	}
	var graph ={
  container: document.getElementById("traversal"),

  boxSelectionEnabled: false,
  autounselectify: true,

  style: cytoscape.stylesheet()
    .selector('node')
      .css({
	'background-color': 'transparent',
	'color':'transparent',
      })
    .selector('edge')
      .css({
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'width': 4,
        'line-color': 'transparent',
        'target-arrow-color': 'transparent'
      })
    .selector('.highlighted')
      .css({
        'background-color': 'white',
        'line-color': 'white',
        'target-arrow-color': 'white',
        'transition-property': 'background-color, line-color, target-arrow-color',
        'transition-duration': '0.5s'
      })
    .selector('.mousein')
      .css({
	'color':'white',
	'content':'data(title)'
      })
    .selector('.enlarged')
      .css({
	'font-size':'50%'
      }),

  layout: {
    name: 'breadthfirst',
    directed: true,
    fit:true, 
    	
    padding: 10
  }
};
graph.elements = {};
graph.elements.nodes = nodes;
graph.elements.edges = edges;
/*
cy.container().style({
        background-image: url("/images/perseus.jpg");
        background-color: 0;
	}"
).update();
*/
var cy = cytoscape(graph);
cy.on('mouseover','node',function(evt){
	var n = evt.target;
	n.addClass('mousein');
	if(node_arr.length > 5)
	{
		n.addClass('enlarged');
	}

});
cy.on('mouseout','node',function(evt){
	var n = evt.target;
	n.removeClass('mousein');	
	n.removeClass('enlarged');	
});
cy.on('tap','node',function(evt){
	var n = evt.target;
	window.open(n.data().id);
});
	
var i = 0;
var highlightNextNode = function(){
	if(i < node_arr.length){
		cy.nodes()[i].addClass('highlighted');
		setTimeout(highlightNextEdge, 500);
	  }
};
var highlightNextEdge = function(){
	if(i < node_arr.length -1){
		cy.edges()[i].addClass('highlighted');
		i++;
	        setTimeout(highlightNextNode, 500);
	  }
};
highlightNextNode();
}
