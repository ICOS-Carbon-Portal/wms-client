function CapabilitiesClass(url, $xmlDoc, mapPixelWidth) {
	//Parse XML and build the capabilitis object
	this.serviceUrl = url;
	this.serviceTitle = getServiceTitle($xmlDoc);
	this.formats = getFormats($xmlDoc);
	this.coordSystems = getCoordSystems($xmlDoc);
	this.layers = getLayers($xmlDoc);
	this.geo = getGeoInfo($xmlDoc);
	this.styles = getStyles($xmlDoc);
	//this.legendURL = getLegendURL($xmlDoc);
	this.dates = getDates($xmlDoc);
	this.elevations = getElevations($xmlDoc);
	this.mapDims = getMapDimensions(this.geo);

	function getMapDimensions(geo){
		return {
			width: mapPixelWidth,
			height: Math.round(mapPixelWidth / geo.width3857 * geo.height3857)
		};
	}
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

function getGeoInfo($xmlDoc) {
	var $node = $xmlDoc.find("Capability > Layer > Layer > Layer").eq(0);

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

	var bBox4326Str = minLon + "," + minLat + "," + maxLon + "," + maxLat;
	var bBox3857Arr = [minLon, minLat, maxLon, maxLat];

	var min3857Point = ol.proj.transform([minLon, minLat], 'EPSG:4326', 'EPSG:3857');
	var max3857Point = ol.proj.transform([maxLon, maxLat], 'EPSG:4326', 'EPSG:3857');
	var bBox3857Str = min3857Point[0] + "," + min3857Point[1] + "," + max3857Point[0] + "," + max3857Point[1];
	var bBox3857Arr = [min3857Point[0], min3857Point[1], max3857Point[0], max3857Point[1]];

	var width3857 = max3857Point[0] - min3857Point[0];
	var height3857 = max3857Point[1] - min3857Point[1];

	var geo = {
		bBox4326Str: bBox4326Str,
		bBox3857Arr: bBox3857Arr,
		bBox3857Str: bBox3857Str,
		bBox3857Arr: bBox3857Arr,
		width3857: width3857,
		height3857: height3857
	};

	return geo;
}

function getStyles($xmlDoc) {
	var $tmp = $xmlDoc.find("Capability > Layer > Layer > Layer").eq(0).find("> Style");
	var tmpArr = [];

	$tmp.each(function () {
		tmpArr.push(new StyleClass($(this)));
	});

	return tmpArr;
}

function getDates($xmlDoc){
	var tmpStr = $xmlDoc.find("Capability > Layer > Layer > Layer").eq(0).find(' > Dimension[name="time"]').text().trim();
	var tmpArr = null;
	if (tmpStr.length > 0) {
		tmpArr = tmpStr.split(",");
	} else {
		tmpArr = [];
	}

	return tmpArr;
}

function getLegendURL($xmlDoc){
	return $xmlDoc.find("Capability > Layer > Layer > Layer").eq(0).find("> Style > LegendURL > OnlineResource").attr("xlink:href");
}

function getElevations($xmlDoc) {
	var tmpStr = $xmlDoc.find("Capability > Layer > Layer > Layer").eq(0).find(' > Dimension[name="elevation"]').text().trim();
	var tmpArr = null;
	if (tmpStr.length > 0) {
		tmpArr = tmpStr.split(",");
	} else {
		tmpArr = [0];
	}

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

	var min3857Point = ol.proj.transform([minLon, minLat], 'EPSG:4326', 'EPSG:3857');
	var max3857Point = ol.proj.transform([maxLon, maxLat], 'EPSG:4326', 'EPSG:3857');
	this.bBox3857Str = min3857Point[0] + "," + min3857Point[1] + "," + max3857Point[0] + "," + max3857Point[1];
	this.bBox3857Arr = [min3857Point[0], min3857Point[1], max3857Point[0], max3857Point[1]];

	this.width3857 = max3857Point[0] - min3857Point[0];
	this.height3857 = max3857Point[1] - min3857Point[1];
}

function StyleClass($node) {
	this.name = $node.find("> Name").text();
}

module.exports = CapabilitiesClass;
