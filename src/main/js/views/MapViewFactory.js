module.exports = function(elemId, MapStore, mapReadyAction, logAction){

	var $mapDiv = $("#" + elemId);
	var map;
	var serviceUrl;

	MapStore.listen(function(state) {

		var latestServiceUrl = state.capabilities.serviceUrl;

		if (serviceUrl !== latestServiceUrl) {
			serviceUrl = latestServiceUrl;
			//Clear the map from old content
			map = null;

			$("#map").children().remove();
			$(".custom-mouse-position").remove();
			$("#messages").children().remove();
		}

		//logAction("serviceUrl: " + state.capabilities.serviceUrl);
		//logAction("Layer: " + state.layer);
		//logAction("Style: " + state.style);
		logAction("Date: " + state.date);
		//logAction("Elevation: " + state.elevation);
		//logAction("Min: " + state.min);
		//logAction("Max: " + state.max);

		if (map) {
			updateMap(state);
		} else {
			initMap(state);
		}
	});

	function updateMap(state){
		var params = map.getLayers().item(1).getSource().getParams();
		var minMax = state.min + "," + state.max;

		params.LAYERS = state.layer;
		params.STYLES = state.style;
		params.ELEVATION = state.elevation;
		params.TIME = state.date;
		params.COLORSCALERANGE = minMax;

		map.getLayers().item(1).getSource().updateParams(params);

		//Request legend
		var legendURL = getLegendURL(state.capabilities.serviceUrl, state.layer, state.style);
		setLegendSrc(legendURL, minMax);
	}

	function initMap(state){
		$mapDiv.height(state.capabilities.mapDims.height);

		//Layer 0
		worldmap = new ol.layer.Tile({
			visible: true,
			source: new ol.source.MapQuest({layer: 'osm'})
		});

		var minMax = state.min + "," + state.max;



		//Layer 1
		threddsSource = new ol.source.ImageWMS({
			url: state.capabilities.serviceUrl,
			params: {
				'LAYERS': state.layer,
				'ELEVATION': state.elevation,
				'TIME': state.date,
				'TRANSPARENT': 'true',
				'STYLES': state.style,
				'COLORSCALERANGE': minMax,
				'NUMCOLORBANDS': 254,
				'LOGSCALE': 'false',
				'WIDTH': state.capabilities.mapDims.width,
				'HEIGHT': state.capabilities.mapDims.height
			}
		});

		threddsSource.on('imageloadend', function(event) {
			mapReadyAction(threddsSource.getParams());
		});

		var thredds = new ol.layer.Image({
			visible: true,
			source: threddsSource
		});

		//Layer 2
		countryBorders = new ol.layer.Image({
			source: new ol.source.ImageVector({
				source: new ol.source.Vector({
					url: 'maps/countries.geojson',
					format: new ol.format.GeoJSON()
				}),
				style: new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: '#319FD3',
						width: 1
					})
				})
			})
		});

		map = new ol.Map({
			layers: [worldmap, thredds, countryBorders],
			target: elemId,
			renderer: 'canvas'
			//view: new ol.View({
			//    center: capabilities.getActiveLayer().centre3857Point,
			//    zoom: getZoomLevel(capabilities.getActiveLayer().width3857)
			//})
		});

		//var params = map.getLayers().item(1).getSource().getParams();

		//Set extent
		map.getView().fitExtent(state.capabilities.geo.bBox3857Arr, map.getSize());

		addControls(map, state.capabilities);

		addMapSwipe(map, state.capabilities);

		addCountryBorderHighlight(map);

		var legendURL = getLegendURL(state.capabilities.serviceUrl, state.layer, state.style);

		addMinMaxSwitch(map, legendURL, minMax);

		//Request legend
		setLegendSrc(legendURL, minMax);
	}
};

function addControls(map, capabilities) {
	map.addControl(
		new ol.control.ZoomToExtent({
			label: "F",
			tipLabel: "Zoom to full extent",
			extent: capabilities.geo.bBox3857Arr
		})
	);

	map.addControl(
		new ol.control.MousePosition({
			coordinateFormat: function (coord) {
				return ol.coordinate.toStringHDMS(coord).replace('N', 'N<br>').replace('S', 'S<br>');
			},
			projection: 'EPSG:4326',
			className: 'custom-mouse-position',
			target: 'mouse-position',
			undefinedHTML: '<br><br>'
		})
	);
}

function addMapSwipe(map) {
	var $swipe = $("#swipe");
	$swipe.val(0);
	$swipe.width($("#map").width);

	var swipe = document.getElementById('swipe');

	var thredds = map.getLayers().item(1);

	thredds.on('precompose', function (event) {
		var ctx = event.context;
		var width = ctx.canvas.width * (swipe.value / 100);

		ctx.save();
		ctx.beginPath();
		ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
		ctx.clip();
	});

	thredds.on('postcompose', function (event) {
		var ctx = event.context;
		ctx.restore();
	});

	var countryBorders = map.getLayers().item(2);

	countryBorders.on('precompose', function (event) {
		var ctx = event.context;
		var width = ctx.canvas.width * (swipe.value / 100);

		ctx.save();
		ctx.beginPath();
		ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
		ctx.clip();
	});

	countryBorders.on('postcompose', function (event) {
		var ctx = event.context;
		ctx.restore();
	});

	swipe.addEventListener('input', function () {
		map.render();
	}, false);
}

function addCountryBorderHighlight(map) {
	var featureOverlay = new ol.FeatureOverlay({
		map: map,
		style: new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#f00',
				width: 1
			})
		})
	});

	var highlight;
	var displayFeatureInfo = function (pixel) {
		var feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
			return feature;
		});

		var info = document.getElementById('info');
		if (feature) {
			//info.innerHTML = feature.getId() + ': ' + feature.get('name');
			info.innerHTML = feature.get('name');
		} else {
			info.innerHTML = '&nbsp;';
		}

		if (feature !== highlight) {
			if (highlight) {
				featureOverlay.removeFeature(highlight);
			}
			if (feature) {
				featureOverlay.addFeature(feature);
			}
			highlight = feature;
		}
	};

	map.on('pointermove', function (evt) {
		if (evt.dragging) {
			return;
		}
		var pixel = map.getEventPixel(evt.originalEvent);
		displayFeatureInfo(pixel);
	});

	var $showBorders = $("#showBorders");
	$showBorders.prop('checked', true);
	$showBorders.click(function () {
		if ($showBorders.is(':checked')) {
			map.getLayers().item(2).set('visible', true);
		} else {
			map.getLayers().item(2).set('visible', false);
		}
	});

	//Clean up when mouse leaves the map
	$("#map").mouseleave(function () {
		$("#info").html("");
		featureOverlay.removeFeature(highlight);
		highlight = null;
	});
}

function addMinMaxSwitch(map, legendURL, minMax) {
	var $useMinMax = $("#useMinMax");
	$useMinMax.off("click");
	$useMinMax.prop('checked', true);
	$useMinMax.click(function () {
		var params = map.getLayers().item(1).getSource().getParams();
		var legendMinMax = "default";

		if ($useMinMax.is(':checked')) {
			params.COLORSCALERANGE = minMax;
			legendMinMax = (minMax == "auto" ? "default" : minMax);
		} else {
			params.COLORSCALERANGE = 'auto';
		}

		map.getLayers().item(1).getSource().updateParams(params);
		setLegendSrc(legendURL, legendMinMax);
	});
}

function getLegendURL(serviceURL, layer, style){
	return serviceURL + "?REQUEST=GetLegendGraphic&LAYER=" + layer + "&PALETTE=" + style.replace("boxfill/", "")
}

function setLegendSrc(legendURL, layerMinMax) {
	if (layerMinMax != "default"){
		//Reduce min max to 3 significant numbers for the legend
		var precision = 3;
		var tmp = layerMinMax.split(",");
		var min = Number(parseFloat(tmp[0]).toPrecision(precision));
		var max = Number(parseFloat(tmp[1]).toPrecision(precision));
		layerMinMax = min + "," + max;
	}
	$("#legend").attr("src", legendURL + "&TRANSPARENT=false&COLORSCALERANGE=" + layerMinMax + "&NUMCOLORBANDS=254");
}

function setExtent(bBox) {
	//fitExtent is experimetal in version 3.5.0
	map.getView().fitExtent(bBox, map.getSize());
}

function addMessage(msg, isErrorMsg) {
	isErrorMsg = typeof isErrorMsg !== 'undefined' ? isErrorMsg : false;

	if (isErrorMsg) {
		var $errorMsg = $("<div class='error'>" + msg + "</div>");
		$errorMsg.delay(7000).fadeOut("normal", function () {
			$errorMsg.remove();
		});
		$("#messages").append($errorMsg);
	} else {
		$("#messages").append("<div>" + msg + "</div>");
	}
}
