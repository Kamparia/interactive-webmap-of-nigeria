window.onload = init;

function init(){
	// basemap - OSM
	var osm   = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
	});

	// basemap - Mapbox
	var mapbox_token = "pk.eyJ1Ijoia2FtcGFyaWEiLCJhIjoiY2s3OHMyaWlhMGk5azNsbnl3MnJweWdjYyJ9.4K1LcrByr-9dxInw2Iy7lw";
	var mapbox = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token='+mapbox_token, {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.light'
	});

	// map
	var map = L.map('map', {
		center: [9.085824, 8.679199],
		zoom: 7,
		minZoom: 3,
		zoomControl: true,
		attributionControl: true,
		layers: [mapbox]
	});

	// control that shows state info on hover
	var info = L.control({position: 'bottomleft'});
	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};
	info.update = function (props) {
		this._div.innerHTML = '<h4>Population Density</h4>' +  (props ?
			'<b>' + props.NAME_1 + '</b><br />' + props.Pop__Densi + ' people / km<sup>2</sup>'
			: 'Hover over a state');
	};
	info.addTo(map);


	// get color depending on population density value
	function getColor(d) {
		return d > 1000 ? '#063801' :
		       d > 500  ? '#144B0E' :
		       d > 400  ? '#235F1C' :
		       d > 300  ? '#31732A' :
		       d > 200   ? '#408737' :
		       d > 150   ? '#4F9B45' :
		       d > 100   ? '#5DAF53' :
		                  '#7AD76E';
	}

	function style(feature) {
		return {
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 0.7,
			fillColor: getColor(feature.properties.Pop__Densi)
		};
	}

	function highlightFeature(e) {
		var layer = e.target;

		layer.setStyle({
			weight: 5,
			color: '#666',
			dashArray: '',
			fillOpacity: 0.7
		});

		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
		}

		info.update(layer.feature.properties);
	}

	var geojson;

	function resetHighlight(e) {
		geojson.resetStyle(e.target);
		info.update();
	}

	function zoomToFeature(e) {
		map.fitBounds(e.target.getBounds());
	}

	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: zoomToFeature
		});
	}
	geojson = L.geoJson(statesData, {
		style: style,
		onEachFeature: onEachFeature
	}).addTo(map);
	map.attributionControl.addAttribution('Developed By: <a href="http://somideolaoye.com/" target="_blank">Olaoye Somide.</a>');


	// Map legend
	var legend = L.control({position: 'bottomright'});
	legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend'),
			grades = [0, 100, 150, 200, 300, 400, 500, 1000],
			labels = [],
			from, to;
		for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1];
			labels.push(
				'<i style="background:' + getColor(from + 1) + '"></i> ' +
				from + (to ? '&ndash;' + to : '+'));
		}
		div.innerHTML = labels.join('<br>');
		return div;
	};


	legend.addTo(map);


	// Layer Toggle Controller
	var baseMaps = {
	    "Mapbox": mapbox,
	    "OpenStreetMap": osm
	};
	var overlayMaps = {
	    "States": geojson
	};
	L.control.layers(baseMaps, overlayMaps).addTo(map);


	// Geocoder
	L.Control.geocoder({collapsed:true, position: 'topleft' }).addTo(map);	

	//Opacity
	var slider = new L.Control.opacitySlider().addTo(map);
	slider.setOpacityLayer(geojson);
}