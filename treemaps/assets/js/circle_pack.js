
function CirclePack(){
	var svg;
	var config = {
		width: 800,
		height:800
	};
	var color = d3.scale.category20c();
	
	
	function me(selection){
		
		var divs = selection.selectAll("div.year")
			.data(selection.datum().children)
			.enter()
			.append("div")
		.classed("year",true);
		
		divs.append("h4")
		.text(function(d){return d.name});
		
		var svg = divs.append("svg")
		.attr({width: config.width, height: config.height});
		
		var pack = d3.layout.pack()
			.size([config.width,config.height])
			.padding(5)
		.value(function(d){return d[1]});
		
		//console.log(treemap.nodes(selection.datum()));
		
		var cell = svg.selectAll(".node")
			.data(function(d){
				// create a treemap only for the specific year
				console.log(d);
				return pack.nodes(d)
			})
			.enter()
			.append("g")
		.classed("node",true)
		.attr("transform", function(d){return "translate("+d.x+","+d.y+")"})
		.attr("class", function(d){return d.children ? "node" : "leaf node" })
			// .style("fill", function(d){return d.depth==1 ? color(d.name): null});
		
		cell.append("circle")
		.style("fill", function(d){return !d.children? color(d.parent.name):null})
		.attr("r",function(d){return d.r});
		

		
		// cell.append("rect")
// 			.classed("leaf", function(d){return !d.children})
// 			.attr("width", function(d){return d.dx})
// 			.attr("height", function(d){return d.dy})
// 			.style("fill", function(d){return d.depth==1 ? color(d.name): null})
//
//
		cell.append("text")
			// .attr("x", function(d){return d.r / 2})
			// .attr("y", function(d){return d.r / 2})
			.attr("dy", ".3em")
			.attr("text-anchor","middle")
		.text(function(d){return (d.children) ? null: d[0]});
	}
	
	
	return me;
}