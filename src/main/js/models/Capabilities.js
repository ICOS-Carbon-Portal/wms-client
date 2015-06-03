function CapabilitiesClass($xmlDoc) {
	//Parse XML and build the capabilitis object
	this.serviceTitle = getServiceTitle($xmlDoc);
	this.formats = getFormats($xmlDoc);
	this.coordSystems = getCoordSystems($xmlDoc);
	this.layers = getLayers($xmlDoc);
	this.styles = getStyles($xmlDoc);
	this.dates = getDates($xmlDoc);
	this.elevations = getElevations($xmlDoc);
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
	//this.bBox4326Arr = [minLon, minLat, maxLon, maxLat];
	//this.centre4326Point = [(minLon + ((maxLon - minLon) / 2)), (minLat + ((maxLat - minLat) / 2))];
	//this.width4326 = maxLon - minLon;
	//this.height4326 = maxLat - minLat;

	var min3857Point = ol.proj.transform([minLon, minLat], 'EPSG:4326', 'EPSG:3857');
	var max3857Point = ol.proj.transform([maxLon, maxLat], 'EPSG:4326', 'EPSG:3857');
	this.bBox3857Str = min3857Point[0] + "," + min3857Point[1] + "," + max3857Point[0] + "," + max3857Point[1];
	this.bBox3857Arr = [min3857Point[0], min3857Point[1], max3857Point[0], max3857Point[1]];
	//var centre3857X = Math.round(min3857Point[0] + ((max3857Point[0] - min3857Point[0]) / 2));
	//var centre3857Y = Math.round(min3857Point[1] + ((max3857Point[1] - min3857Point[1]) / 2));
	//this.centre3857Point = [centre3857X, centre3857Y];
	this.width3857 = max3857Point[0] - min3857Point[0];
	this.height3857 = max3857Point[1] - min3857Point[1];

	//var dateStr = $node.find('Dimension[name="time"]').text().trim();
	//var dateArr = null;
	//if (dateStr.length > 0) {
	//	dateArr = dateStr.split(",");
	//} else {
	//	dateArr = [];
	//}
	//this.dates = dateArr;

	//var elevationsStr = $node.find('Dimension[name="elevation"]').text().trim();
	//var elevationsArr = null;
	//if (elevationsStr.length > 0) {
	//	elevationsArr = elevationsStr.split(",");
	//} else {
	//	elevationsArr = [0];
	//}
	//this.elevations = elevationsArr;
	//this.elevationUnit = $node.find('Dimension[name="elevation"]').attr("units");

	//this.minMaxMatrix = new Array(this.dates.length);
	//for (var i = 0; i < this.dates.length; i++) {
	//	this.minMaxMatrix[i] = new Array(this.elevations.length);
	//}

	//this.styles = getStyles($node.find("Style"));
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

module.exports = CapabilitiesClass;