var width = 1100,
height = 450;


var charts = {};


// MAP Preparation
var svg = d3.select("#viz")
    .append("svg")
    .attr("width", width)
.attr("height", height);


// projection
var projection = d3.geo.mercator()
    .scale(390)
    .center([-47,50])
.translate([width/2,height/2]);

// path transofrmer (from coordinates to path definition)
var path = d3.geo.path().projection(projection);


// a major g to contain all the visuals
var gg = svg.append("g");

// first child g to contain map
var g = gg.append("g")
.attr("class","map")
.style("fill","lightgray");

// second child g to contain circles
var gm = gg.append("g");

// load file with the map
d3.json("assets/data/world.geojson",function(json){
    console.log(json);
    
    // draw the map using projection and path
    g.selectAll("path")
    .data(json.features.filter(function(d){return d.properties.CNTR_ID != "AQ"}))
    .enter()
    .append("path")
    .attr("d", path)
    
})



// DATA PREPARATION
var dsv = d3.dsv(";","text/plain");

// global variable to have a list of all museums
var museums = {};

// global variable to keep the list of all paintings
var allOpere;


d3.queue()
    .defer(dsv, "assets/data/opere_colori.csv", function(d){
        // filter only useful attributes:
        // ANNO_ARTWORK, ARTWORK_PLACE, ARTWORK_PLACE_LAT, ARTWORK_PLACE_LON, MUSEUM
        // TECHNIQUE, TYPE, SCHOOL
        
        var m = {
            // convert strings to numbers
            ANNO_ARTWORK: +d.ANNO_ARTWORK, 
            ARTWORK_PLACE_LAT: +d.ARTWORK_PLACE_LAT,
            ARTWORK_PLACE_LON: +d.ARTWORK_PLACE_LON,
            
            // select only a few attributes
            ARTWORK_PLACE: d.ARTWORK_PLACE,
            MUSEUM: d.MUSEUM,
            TECHNIQUE: d.TECHNIQUE,
            TYPE: d.TYPE,
            SCHOOL: d.SCHOOL,
            
            // discard all the others
        }
        
        // save the coordinates of museum in the dictionary 
        var ms = museums[d.MUSEUM] || (museums[d.MUSEUM] = {name: d.MUSEUM, point: [+d.ARTWORK_PLACE_LON, +d.ARTWORK_PLACE_LAT]});
        
        
        // return the modified row
        return m;
    })
.await(callback);



// global function to scale the number of paintings for each circle
// pay attention to SQRT scale
var radius = d3.scale.sqrt()
.range([2,30]);


function callback(error, opere){
    if(error) console.log(error);
    allOpere = opere;
    console.log(opere);
    console.log(museums);
    
    // GROUP opere BY MUSEUM
    nested_all = d3.nest()
        .key(function(d){return d.MUSEUM})
        .rollup(function(leaves){return leaves.length})
    .entries(opere);
    
    radius
    .domain(d3.extent(d3.values(nested_all),function(d){return d.values}));
    
    
    
    gm.selectAll("circle")
    .data(d3.values(nested_all).sort(function(a,b){return -a.values +b.values}))
    .enter()
    .append("circle")
    .attr("cx", function(d){
        return projection(museums[d.key].point)[0];
    })
    .attr("cy", function(d){
        return projection(museums[d.key].point)[1];
    })
    .attr("r",function(d){return radius(d.values)})
    .attr("fill", colorbrewer['Reds'][3][2])
    .attr("opacity",0.8)
    .on("click",function(d){
        // do something with select object 
        var k = d.key;
        
        // select only rows with the given museum
        var filtered = allOpere.filter(function(m){
            if (m.MUSEUM==k)
            return m
        });
        
        
        
        updateAllCharts(filtered);
        
        console.log(d.key, filtered);
    });
    
    console.log("allOpere",allOpere);
    //updateAllCharts(allOpere);
  
    
    
}

// zoom and pan
var zoom = d3.behavior.zoom()
    .on("zoom",function() {
        gg.attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        gg.selectAll("path")  
            .attr("d", path.projection(projection)); 
  });

  svg.call(zoom);
  
  
  
  function updateAllCharts(filtered){
      var groupby_technique = d3.nest()
          .key(function(d){return d.TECHNIQUE.toLowerCase()})
          .rollup(function(l){return l.length})
      .entries(filtered);
      console.log("GRP TECHNIQUE",groupby_technique);
      updateChart("#chart1", "Technique", groupby_technique);
      
      var groupby_type = d3.nest()
          .key(function(d){return d.TYPE})
          .rollup(function(l){return l.length})
      .entries(filtered);
      console.log("GRP TYPE",groupby_type);
      updateChart("#chart2", "Type", groupby_type);
      
      var groupby_school = d3.nest()
          .key(function(d){return d.SCHOOL})
          .rollup(function(l){return l.length})
      .entries(filtered);
      console.log("GRP SCHOOL",groupby_school);
      updateChart("#chart3", "School", groupby_school);
      
      console.log("charts", charts);
  }

  function updateChart(selector, title, data){
	
      var svgChart = d3.select(selector);
      
      if(svgChart.select("svg").empty()){
        svgChart.append("h4")
          .text(title);
         
  		svgChart = svgChart.append("svg")
  		    .attr("width","100%")
  	      .attr("height",500);
          
        // create a new chart
        var chart = nv.models.multiBarHorizontalChart()
            .margin({left:150, right:10, bottom:20})
            .showControls(false)
            .showLegend(false);
      
        charts[selector] = chart;
    }
      
    
    // assign new data to the chart
    svgChart.datum([
        {
            key:"Count " + title, 
            values:data
                .map(function(d){return {x: d.key, y: d.values}})  // rename property names of objects
                .sort(function(a,b){return -a.y + b.y}) // sort by frequency
                .filter(function(d,i){return i < 10})  // select only first 10 rows
        }])
        .call(charts[selector]);
      // nv.utils.windowResize(charts[selector].update);
  }
  

  

