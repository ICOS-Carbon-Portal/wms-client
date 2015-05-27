//Request capabilities from server
function getCapabilities(url) {
	return $.ajax({
		type: "GET",
		url: url,
		dataType: "xml"
	}).then(function (result) {
		return new CapabilitiesClass($(result));
	}, function () {
		return new Error("Error: Could not retrieve cpabilities for this service");
	});
}

//Object that will contain the parsed capabilities response
function CapabilitiesClass($xmlDoc) {
	var activeLayerIndex = 0;
	//Default to the redblue style
	var activeStyleIndex = 1;
	var activeDateIndex = 0;
	var activeElevationIndex = 0;

	//Parse XML and build the capabilitis object
	this.serviceTitle = getServiceTitle($xmlDoc);
	this.formats = getFormats($xmlDoc);
	this.coordSystems = getCoordSystems($xmlDoc);
	this.layers = getLayers($xmlDoc);

	//Helper methods
	this.getActiveLayer = function () {
		return this.layers[activeLayerIndex];
	};

	this.getActiveLayerIndex = function () {
		return activeLayerIndex;
	};

	this.setActiveLayer = function (index) {
		activeLayerIndex = index;
	};

	this.getActiveStyle = function () {
		return this.layers[activeLayerIndex].styles[activeStyleIndex];
	};

	this.getActiveStyleIndex = function () {
		return activeStyleIndex;
	};

	this.setActiveStyle = function (index) {
		activeStyleIndex = index;
	};

	this.getActiveDate = function () {
		return this.layers[activeLayerIndex].dates[activeDateIndex];
	};

	this.getActiveDateIndex = function () {
		return activeDateIndex;
	};

	this.setActiveDate = function (index) {
		activeDateIndex = index;
	};

	this.getActiveElevations = function () {
		return this.layers[activeLayerIndex].elevations;
	};

	this.getActiveElevation = function () {
		return this.layers[activeLayerIndex].elevations[activeElevationIndex];
	};

	this.hasElevations = function(){
		if(this.layers[activeLayerIndex].elevations.length > 1){
			return true;
		} else {
			return false;
		}
	}

	this.getActiveElevationIndex = function () {
		return activeElevationIndex;
	};

	this.setActiveElevation = function (index) {
		activeElevationIndex = index;
	};

	this.getMinMax = function () {
		return this.layers[activeLayerIndex].minMaxMatrix[activeDateIndex][activeElevationIndex];
	};

	this.setMinMax = function (minMax) {
		this.layers[activeLayerIndex].minMaxMatrix[activeDateIndex][activeElevationIndex] = minMax;
	};
}

function getServiceTitle($xmlDoc) {
	return $xmlDoc.find("Capability > Layer > Title").text();
}

function getFormats($xmlDoc) {
	var $tmp = $xmlDoc.find("GetMap > Format");
	var tmpArr = [];
	$tmp.each(function () {
		tmpArr.push($(this).text());
	});

	return tmpArr;
}

function getCoordSystems($xmlDoc) {
	var $tmp = $xmlDoc.find("CRS");
	var tmpArr = [];
	$tmp.each(function () {
		tmpArr.push($(this).text());
	});

	return tmpArr;
}

function getLayers($xmlDoc) {
	var $tmp = $xmlDoc.find("Capability > Layer > Layer > Layer");
	var tmpArr = [];
	$tmp.each(function () {
		var timeStr = $(this).find('Dimension[name="time"]').text();
		if (timeStr.length > 0) {
			tmpArr.push(new LayerClass($(this)));
		}
	});

	return tmpArr;
}

function getElevations($node, initialDate) {
	var elevationsStr = $node.text().trim();
	var elevationsArr = elevationsStr.split(",");
	var units = $node.attr("units") ? undefined : null;

	var elevations = new ElevationsClass(units);

	if (elevationsArr.length > 1) {
		var tmpArr = [];

		elevationsArr.forEach(function (elevationValue) {
			elevations.addElevation(new ElevationClass(elevationValue, initialDate));
		});
	} else {
		elevations.addElevation(new ElevationClass("0", initialDate));
	}

	return elevations;
}

function getStyles($node) {
	var tmpArr = [];
	$node.each(function () {
		tmpArr.push(new StyleClass($(this)));
	});

	return tmpArr;
}

function LayerClass($node) {
	this.name = $node.find("> Name").text();
	this.title = $node.find("> Title").text();
	this.abstract = $node.find("> Abstract").text();

	var minLon = parseFloat($node.find("EX_GeographicBoundingBox > westBoundLongitude").text());
	var maxLon = parseFloat($node.find("EX_GeographicBoundingBox > eastBoundLongitude").text());
	var minLat = parseFloat($node.find("EX_GeographicBoundingBox > southBoundLatitude").text());
	var maxLat = parseFloat($node.find("EX_GeographicBoundingBox > northBoundLatitude").text());

	//Do not include the poles on world maps
	if (minLat < -80) {
		minLat = -80.0;
	}

	if (maxLat > 80) {
		maxLat = 80.0;
	}

	this.bBox4326Str = minLon + "," + minLat + "," + maxLon + "," + maxLat;
	//this.bBox4326Arr = [minLon, minLat, maxLon, maxLat];
	//this.centre4326Point = [(minLon + ((maxLon - minLon) / 2)), (minLat + ((maxLat - minLat) / 2))];
	//this.width4326 = maxLon - minLon;
	//this.height4326 = maxLat - minLat;

	var min3857Point = ol.proj.transform([minLon, minLat], 'EPSG:4326', 'EPSG:3857');
	var max3857Point = ol.proj.transform([maxLon, maxLat], 'EPSG:4326', 'EPSG:3857');
	//this.bBox3857Str = min3857Point[0] + "," + min3857Point[1] + "," + max3857Point[0] + "," + max3857Point[1];
	this.bBox3857Arr = [min3857Point[0], min3857Point[1], max3857Point[0], max3857Point[1]];
	//var centre3857X = Math.round(min3857Point[0] + ((max3857Point[0] - min3857Point[0]) / 2));
	//var centre3857Y = Math.round(min3857Point[1] + ((max3857Point[1] - min3857Point[1]) / 2));
	//this.centre3857Point = [centre3857X, centre3857Y];
	this.width3857 = max3857Point[0] - min3857Point[0];
	this.height3857 = max3857Point[1] - min3857Point[1];

	var dateStr = $node.find('Dimension[name="time"]').text().trim();
	var dateArr = null;
	if (dateStr.length > 0) {
		dateArr = dateStr.split(",");
	} else {
		dateArr = [];
	}
	this.dates = dateArr;

	var elevationsStr = $node.find('Dimension[name="elevation"]').text().trim();
	var elevationsArr = null;
	if (elevationsStr.length > 0) {
		elevationsArr = elevationsStr.split(",");
	} else {
		elevationsArr = [0];
	}
	this.elevations = elevationsArr;
	this.elevationUnit = $node.find('Dimension[name="elevation"]').attr("units");

	this.minMaxMatrix = new Array(this.dates.length);
	for (var i = 0; i < this.dates.length; i++) {
		this.minMaxMatrix[i] = new Array(this.elevations.length);
	}

	this.styles = getStyles($node.find("Style"));
}

function StyleClass($node) {
	this.name = $node.find("> Name").text();
	this.title = $node.find("> Title").text();
	this.abstract = $node.find("> Abstract").text();
	this.legend = $node.find("> LegendURL > OnlineResource").attr("xlink:href");

	this.exists = function (name) {
		return this.name == name;
	};
}