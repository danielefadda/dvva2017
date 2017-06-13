
function Treemap(){
	var svg;
	var config = {
		width: 800,
		height:800
	};
	var color = d3.scale.category20c();
	
	
	function me(selection){
		if(selection.select("svg").empty()){
			svg = selection.append("svg")
				.attr({
					width: config.width,
					height: config.height,
				});
		}
		
		
		var treemap = d3.layout.treemap()
			.size([config.width,config.height])
			.padding(function(d){
				return d.depth==2 ? [20,0,0,0] : 3
			})
		.value(function(d){return d[1]});
		
		console.log(treemap.nodes(selection.datum()));
		
		var cell = svg.selectAll(".node")
			.data(treemap.nodes)
			.enter()
			.append("g")
		.classed("node",true)
		.attr("transform", function(d){return "translate("+d.x+","+d.y+")"});
		
		cell.append("rect")
			.classed("leaf", function(d){return !d.children})
			.attr("width", function(d){return d.dx})
			.attr("height", function(d){return d.dy})
			.style("fill", function(d){return d.depth==1 ? color(d.name): null})
		
		
		cell.append("text")
			.attr("x", function(d){return d.dx / 2})
			.attr("y", function(d){return d.dy / 2})
			.attr("dy", ".3em")
			.attr("text-anchor","middle")
			.text(function(d){return (d.children) ? null: d[0]})
;
		
	}
	
	
	return me;
}