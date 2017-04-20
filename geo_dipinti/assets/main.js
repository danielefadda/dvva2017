
var dsv = d3.dsv(";","text/plain");



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
        // return the modified row
        return m;
    })
.await(callback);




function callback(error, opere){
    if(error) console.log(error);
    
    console.log(opere);
    
    
    

}