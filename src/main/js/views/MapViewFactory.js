/*

Map view for OpenLayers 3.5.0

 */

module.exports = function(elemId, MapStore, mapReadyAction, config){

	var $mapDiv = $("#" + elemId);
	var map;
	var serviceUrl;
	var threddsMapIndex = 2;
	var cntrBdyIndex = 3;

	MapStore.listen(function(state) {

		var latestServiceUrl = state.capabs.serviceUrl;

		if (serviceUrl !== latestServiceUrl) {
			serviceUrl = latestServiceUrl;
			//Clear the map from old content
			map = null;

			$("#map").children().remove();
			$(".custom-mouse-position").remove();
			$("#messages").children().remove();
		}

		updateUrlBar(state);

		if (map) {
			updateMap(state);
		} else {
			initMap(state);
		}
	});

	function updateUrlBar(state){
		history.pushState({urlPath: state.requestUrl}, "", state.requestUrl);
	};

	function updateMap(state){
		var params = map.getLayers().item(threddsMapIndex).getSource().getParams();
		var minMax = state.min + "," + state.max;

		params.LAYERS = state.layer;
		params.STYLES = state.style;
		params.ELEVATION = state.elevation;
		params.TIME = state.date;
		params.COLORSCALERANGE = minMax;

		map.getLayers().item(threddsMapIndex).getSource().updateParams(params);

		//Request legend
		var legendURL = getLegendURL(state.capabs.serviceUrl, state.layer, state.style);
		setLegendSrc(legendURL, minMax);
	}

	function initMap(state){
		$mapDiv.height(state.capabs.mapDims.height);

		//Layer 0
		var worldMap = new ol.layer.Tile({
			visible: true,
			source: new ol.source.MapQuest({layer: 'osm'})
		});

		//Layer 1
		var worldAerial = new ol.layer.Tile({
			visible: false,
			source: new ol.source.MapQuest({layer: 'sat'})
		});

		var minMax = state.min + "," + state.max;

		//Layer 2
		var threddsSource = new ol.source.ImageWMS({
			url: state.capabs.serviceUrl,
			params: {
				'LAYERS': state.layer,
				'ELEVATION': state.elevation,
				'TIME': state.date,
				'TRANSPARENT': 'true',
				'STYLES': state.style,
				'COLORSCALERANGE': minMax,
				'NUMCOLORBANDS': 254,
				'LOGSCALE': 'false',
				'WIDTH': state.capabs.mapDims.width,
				'HEIGHT': state.capabs.mapDims.height
			}
		});

		threddsSource.on('imageloadend', function(event) {
			mapReadyAction(threddsSource.getParams());
		});

		var thredds = new ol.layer.Image({
			visible: true,
			source: threddsSource
		});

		//Layer 3
		var countryBorders = new ol.layer.Image({
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
			layers: [worldMap, worldAerial, thredds, countryBorders],
			target: elemId,
			renderer: 'canvas'
		});

		//Set extent
		map.getView().fitExtent(state.capabs.geo.bBox3857Arr, map.getSize());

		addControls(map, state.capabs);

		addMapSwipe(map, threddsMapIndex, cntrBdyIndex);

		addCountryBorderHighlight(map, cntrBdyIndex);

		addSwitchBgMap(map, config.bgMapsName);

		var legendURL = getLegendURL(state.capabs.serviceUrl, state.layer, state.style);

		//Request legend
		setLegendSrc(legendURL, minMax);
	}
};

function addControls(map, capabs) {
	map.addControl(
		new ol.control.ZoomToExtent({
			label: "F",
			tipLabel: "Zoom to full extent",
			extent: capabs.geo.bBox3857Arr
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

function addMapSwipe(map, threddsMapIndex, cntrBdyIndex) {
	var $swipe = $("#swipe");
	$swipe.val(0);
	$swipe.width($("#map").width);

	var swipe = document.getElementById('swipe');

	var thredds = map.getLayers().item(threddsMapIndex);

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

	var countryBorders = map.getLayers().item(cntrBdyIndex);

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

function addCountryBorderHighlight(map, cntrBdyIndex) {
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
			map.getLayers().item(cntrBdyIndex).set('visible', true);
		} else {
			map.getLayers().item(cntrBdyIndex).set('visible', false);
		}
	});

	//Clean up when mouse leaves the map
	$("#map").mouseleave(function () {
		$("#info").html("");
		featureOverlay.removeFeature(highlight);
		highlight = null;
	});
}

function addSwitchBgMap(map, bgMapsName){
	var $bgMaps = $("input[name=" + bgMapsName + "]");
	$bgMaps.filter('[value=map]').prop('checked', true);

	if ($bgMaps.data("event") == null){

		$bgMaps.change(function(){
			var selectedValue = $bgMaps.filter(':checked').val();

			if (selectedValue == "sat"){
				map.getLayers().item(0).setVisible(false);
				map.getLayers().item(1).setVisible(true);
			} else if (selectedValue == "map"){
				map.getLayers().item(0).setVisible(true);
				map.getLayers().item(1).setVisible(false);
			}
		});
	} else {
		console.log("not null event");
	}
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
