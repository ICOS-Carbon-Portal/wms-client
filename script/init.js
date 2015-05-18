function init(url) {
    //Url for WMS getMap requests
    var getCapabilitiesURL = url + "?service=WMS&version=1.3.0&request=GetCapabilities";

    if (window.location.host == "localhost"){
        getCapabilitiesURL = rewriteUrlForLocalhost(getCapabilitiesURL);
    }

	//Request capabilities
    var capabilitiesPromise = getCapabilities(getCapabilitiesURL);

    //Control for swiping layer
    var $swipe = $("#swipe");
    $swipe.val(0);
    $swipe.css("width", $("#map").css("width"));

    //Clear the map from old content
    $("#map").children().remove();
    $(".custom-mouse-position").remove();
    $("#messages").children().remove();

    capabilitiesPromise.done(function (capabilities) {
		//Capabilities has come from the server
		$("#serviceTitle").html(capabilities.serviceTitle);
		$("title").html(capabilities.serviceTitle);

        var minMaxUrl = getMinMaxUrl(url, capabilities);

		//Request min and max values from server
        var minMaxPromise = getMinMaxFromServer(minMaxUrl);

        minMaxPromise.done(function (minMax) {
			//Min and max values has come from the server
			capabilities.setMinMax(minMax);
            main(url, capabilities);
        });

        minMaxPromise.fail(function (error) {
			//Min and max values could not be fetched from server. Fall back on "auto".
			addMessage(err.message, true);
			capabilities.setMinMax("auto");
			main(url, capabilities);
        });
    }).fail(function(err){
		addMessage(err.message, true);
	});
}

function main(url, capabilities){
	var $mapDiv = $("#map");

	//Find out what the map height should be
	var mapWidth = $mapDiv.css("width").replace("px", "");
	var mapHeight = calculateMapDivHeight(
		mapWidth,
		capabilities.getActiveLayer().width3857,
		capabilities.getActiveLayer().height3857);
	$mapDiv.css("height", mapHeight + "px");

	//Layer 0
	var worldmap = new ol.layer.Tile({
		visible: true,
		source: new ol.source.MapQuest({layer: 'osm'})
	});

	//Layer 1
	var thredds = new ol.layer.Image({
		visible: true,
		source: new ol.source.ImageWMS({
			url: url,
			params: {
				'LAYERS': capabilities.getActiveLayer().name,
				'ELEVATION': capabilities.getActiveElevation(),
				'TIME': capabilities.getActiveDate(),
				'TRANSPARENT': 'true',
				'STYLES': capabilities.getActiveStyle().name,
				'COLORSCALERANGE': capabilities.getMinMax(),
				'NUMCOLORBANDS': 254,
				'LOGSCALE': 'false',
				'WIDTH': mapWidth,
				'HEIGHT': mapHeight
			}
		})
	});

	//Layer 2
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

	var map = new ol.Map({
		layers: [worldmap, thredds, countryBorders],
		target: 'map',
		renderer: 'canvas'
		//view: new ol.View({
		//    center: capabilities.getActiveLayer().centre3857Point,
		//    zoom: getZoomLevel(capabilities.getActiveLayer().width3857)
		//})
	});

	setExtent(capabilities.getActiveLayer().bBox3857Arr, map);

	addControls(map, capabilities);

	addMapSwipe(map, capabilities);

	addCountryBorderHighlight(map);

	addMinMaxSwitch(map, capabilities, capabilities.getMinMax());

	//Request legend
	var legendMinMax = (capabilities.getMinMax() == "auto" ? "default" : capabilities.getMinMax());
	setLegendSrc(capabilities.getActiveStyle(), legendMinMax);

	fillDropDowns(map, capabilities, url);

}

function addControls(map, capabilities){
	map.addControl(
		new ol.control.ZoomToExtent({
			label: "F",
			tipLabel: "Zoom to full extent",
			extent: capabilities.getActiveLayer().bBox3857Arr
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

function addMapSwipe(map){
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

function addCountryBorderHighlight(map){
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

function addMinMaxSwitch(map, capabilities, minMax){
	var $useMinMax = $("#useMinMax");
	$useMinMax.prop('checked', true);
	$useMinMax.click(function () {
		var params = map.getLayers().item(1).getSource().getParams();

		if ($useMinMax.is(':checked')) {
			params.COLORSCALERANGE = minMax;
		} else {
			params.COLORSCALERANGE = 'auto';
		}

		map.getLayers().item(1).getSource().updateParams(params);
		setLegendSrc(capabilities.getActiveStyle(), (minMax == "auto" ? "default" : minMax));
	});
}

function fillDropDowns(map, capabilities, url){
	initDropDown("layers", map, capabilities, url);
	initDropDown("styles", map, capabilities, url);
	initDropDown("elevations", map, capabilities, url);
	initDropDown("dates", map, capabilities, url);
}

function initDropDown(id, map, capabilities, url) {
	var $ddl = $("#" + id);

	//Remove old content
	$ddl.find('option').remove().end();

	switch (id) {
		case "layers":
			capabilities.layers.forEach(function (item){
				$ddl.append($("<option />").val(item.name).text(item.name + "  - " + item.abstract));
			});

			$ddl.prop("selectedIndex", capabilities.getActiveLayerIndex());

			break;
		case "styles":
			capabilities.getActiveLayer().styles.forEach(function (item) {
				$ddl.append($("<option />").val(item.name).text(item.name.replace("boxfill/", "")));
			});

			$ddl.prop("selectedIndex", capabilities.getActiveStyleIndex());

			break;
		case "elevations":
			if (capabilities.getActiveLayer().elevations.length > 1) {
				$("#elevationContainer").show();

				capabilities.getActiveLayer().elevations.forEach(function (item) {
					$ddl.append($("<option />").val(item).text(item));
				});

				$ddl.prop("selectedIndex", capabilities.getActiveElevationIndex());
			} else {
				$("#elevationContainer").hide();
			}

			break;
		case "dates":
			if (capabilities.getActiveLayer().dates.length > 0) {
				$("#dateContainer").show();

				capabilities.getActiveLayer().dates.forEach(function (item) {
					$ddl.append($("<option />").val(item).text(new Date(item).toISOString()));
				});

				$ddl.prop("selectedIndex", capabilities.getActiveDateIndex());
			} else {
				$("#dateContainer").hide();
			}

			break;
	}

	//Remove old event
	$ddl.off("change");

	//Add new event
	$ddl.change(function () {
		ddlChange($ddl, map, capabilities, url);
	});
}

function ddlChange($ddl, map, capabilities, url) {
	//The WMS layer is always at index 1
    var params = map.getLayers().item(1).getSource().getParams();

	var minMaxPromise = null;

    switch ($ddl.prop('id')) {
        case "layers":
            capabilities.setActiveLayer($ddl[0].selectedIndex);

			//capabilities.layers.forEach(function(layer){
			//	addMessage(layer.name);
			//});

			if (capabilities.getMinMax() == null){
				var minMaxUrl = getMinMaxUrl(url, capabilities);
				minMaxPromise = getMinMaxFromServer(minMaxUrl);
			} else {
				var legendMinMax = (capabilities.getMinMax() == "auto" ? "default" : capabilities.getMinMax());

				//Update legend
				setLegendSrc(capabilities.getActiveStyle(), legendMinMax);
			}

            params.LAYERS = capabilities.getActiveLayer().name;

            //Update drop downs
			initDropDown("styles", map, capabilities, url);
			initDropDown("elevations", map, capabilities, url);
			initDropDown("dates", map, capabilities, url);

            break;
        case "styles":
            capabilities.setActiveStyle($ddl[0].selectedIndex);

            params.STYLES = $ddl.val();

			if (capabilities.getMinMax() == null) {
				var minMaxUrl = getMinMaxUrl(url, capabilities);
				minMaxPromise = getMinMaxFromServer(minMaxUrl);
			} else {
				var legendMinMax = (capabilities.getMinMax() == "auto" ? "default" : capabilities.getMinMax());

				//Update legend
				setLegendSrc(capabilities.getActiveStyle(), legendMinMax);
			}

            break;
        case "elevations":
            capabilities.setActiveStyle($ddl[0].selectedIndex);
            params.ELEVATION = $ddl.val();

            break;
        case "dates":
            capabilities.setActiveDate($ddl[0].selectedIndex);
            params.TIME = $ddl.val();

            break;
    }

    map.getLayers().item(1).getSource().updateParams(params);

	if (minMaxPromise != null){
		minMaxPromise.done(function (minMax) {
			//Min and max values has come from the server
			capabilities.setMinMax(minMax);
			var legendMinMax = (minMax == "auto" ? "default" : minMax);

			//Update legend
			setLegendSrc(capabilities.getActiveStyle(), legendMinMax);
		});

		minMaxPromise.fail(function () {
			//Min and max values could not be fetched from server. Fall back on "auto".
			capabilities.setMinMax("auto");
			var legendMinMax = "default";

			//Update legend
			setLegendSrc(capabilities.getActiveStyle(), legendMinMax);
		});
	}
}