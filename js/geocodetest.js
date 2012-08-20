
$(document).ready(function () {
	$("#coveragemap").click(function(){
		window.open("stationmap.html?"+serverURL,"_self",false);
	});
});

var layers=[];
var fullExtent = new OpenLayers.Bounds(
        -17107255, 2910721, -4740355, 6335100
    );
var map = new OpenLayers.Map({
    div: "coveragemap",
    projection: "EPSG:900913",
    displayProjection: "EPSG:4326",
    numZoomLevels:17,
    maxExtent: new OpenLayers.Bounds(-2.003750834E7,-2.003750834E7,2.003750834E7,2.003750834E7),
	units: "meters",
	controls:[new OpenLayers.Control.Attribution()]
});

var mapboxTerrain = new OpenLayers.Layer.XYZ(
	    "Mapbox Nightvision map",
	    [
	     "https://dnv9my2eseobd.cloudfront.net/v3/fcc.map-rons6wgv/${z}/${x}/${y}.png"
	     //"https://a.tiles.mapbox.com/v3/fcc.map-rons6wgv/${z}/${x}/${y}.png",
	    // "https://b.tiles.mapbox.com/v3/fcc.map-rons6wgv/${z}/${x}/${y}.png",
	     //"https://c.tiles.mapbox.com/v3/fcc.map-rons6wgv/${z}/${x}/${y}.png",
	     //"https://d.tiles.mapbox.com/v3/fcc.map-rons6wgv/${z}/${x}/${y}.png"
	    ], {
	        attribution: "Data &copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " +
            "and contributors, CC-BY-SA",
	        sphericalMercator: true,
	        wrapDateLine: true,
	        numZoomLevels:17,
	        transitionEffect: "resize",
	        buffer: 1
	    }
	);
layers.push(mapboxTerrain);

var stationStyle = new OpenLayers.StyleMap({
    "default": new OpenLayers.Style({
        externalGraphic: "img/redPin.gif",
        backgroundGraphic: "img/icon-map-shadow.png",
        backgroundXOffset: 0,
        backgroundYOffset: -7,
        graphicZIndex: 11,
        backgroundGraphicZIndex: 10,
		pointRadius: 10
    }),
	"temporary": new OpenLayers.Style({
		pointRadius: 24				
	})
});
       
var stationLayer = new OpenLayers.Layer.Vector("station", {
	styleMap: stationStyle,
	rendererOptions: {zIndexing: true}
});

var contourStyle = new OpenLayers.StyleMap({
    "default": new OpenLayers.Style({
    	strokeColor: "#FFAEDB",
		strokeOpacity: 1,
    	strokeWidth: 2,
		fillColor: "#FFAEDB",
		fillOpacity: 0.3
    }),
    "temporary": new OpenLayers.Style({
        strokeColor: "#F09100",
		strokeWidth:2
    })
});
var contourLayer= new OpenLayers.Layer.Vector("Contours",{
		styleMap: contourStyle,					
		displayInLayerSwitcher:true
	});
layers.push(stationLayer);
layers.push(contourLayer);
map.addLayers(layers);

$.getJSON(serverURL + "?callback=?",function(data){
	var stationFeature = new OpenLayers.Feature.Vector(
	    	new OpenLayers.Geometry.Point(
	    			data.coordinate.longitude,
	    			data.coordinate.latitude
	    	).transform(map.displayProjection, map.projection), {}
		);
	stationLayer.addFeatures([stationFeature]);

	var pointList=[];
	var contourFeature;
	var coordinates=data.contour;
	for (j=0;j<coordinates.length;j++){
	    var newPoint = new OpenLayers.Geometry.Point(coordinates[j].longitude, coordinates[j].latitude);
	    pointList.push(newPoint)
	 }
	 pointList.push(pointList[0]);
	var linearRing = new OpenLayers.Geometry.LinearRing(pointList);
	contourFeature = new OpenLayers.Feature.Vector(
	    new OpenLayers.Geometry.Polygon([linearRing]).transform(map.displayProjection, map.projection),{}
	)
	contourLayer.addFeatures([contourFeature]);
	fullExtent = contourLayer.getDataExtent();

	map.zoomToExtent(fullExtent);
	console.log(data);
});


