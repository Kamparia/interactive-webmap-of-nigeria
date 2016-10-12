window.onload = init;

function init(){
	var osm   = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
	});
	var mapbox = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.light'
	});
	var map = L.map('map', {
		center: [8.6518742,9.0918008],
		zoom: 6,
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
		return d > 1000 ? '#800026' :
		       d > 500  ? '#BD0026' :
		       d > 400  ? '#E31A1C' :
		       d > 300  ? '#FC4E2A' :
		       d > 200   ? '#FD8D3C' :
		       d > 150   ? '#FEB24C' :
		       d > 100   ? '#FED976' :
		                  '#FFEDA0';
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
	map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');


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


