var width = 1100,
height = 450;



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

var g = svg.append("g")
.attr("class","map")
.style("fill","lightgray");

d3.json("assets/data/world.geojson",function(json){
    console.log(json);
    
    g.selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .filter(function(d){return d.properties.CNTR_ID != "AQ"})
    .attr("d", path)
    
})



// DATA PREPARATION

var dsv = d3.dsv(";","text/plain");

var museums = {};

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


function callback(error, opere){
    if(error) console.log(error);
    
    console.log(opere);
    console.log(museums);
    
    
    // GROUP opere BY MUSEUM
    var nested_all = d3.nest()
        .key(function(d){return d.MUSEUM})
        .rollup(function(leaves){return leaves.length})
    .entries(opere);
    
    
    
    var gm = svg.append("g");
    var radius = d3.scale.sqrt()
        .domain(d3.extent(d3.values(nested_all),function(d){return d.values}))
        .range([2,20])
    
    
    gm.selectAll("circle")
    .data(d3.values(nested_all))
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
    .attr("opacity",0.6);
    
    console.log(nested_all);


}