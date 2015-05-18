function setLegendSrc(style, layerMinMax) {
	$("#legend").attr("src", style.legend + "&TRANSPARENT=false&COLORSCALERANGE=" + layerMinMax + "&NUMCOLORBANDS=254");
}

function getMinMaxUrl(url, capabilities) {
	var minMaxUrl = url + "?item=minmax&layers=" + capabilities.getActiveLayer().name;
	minMaxUrl += "&bbox=" + capabilities.getActiveLayer().bBox4326Str;
	minMaxUrl += "&elevation=" + (capabilities.getActiveElevation() || "0");
	minMaxUrl += "&time=" + capabilities.getActiveDate() + "&srs=EPSG:4326&width=50&height=50&request=GetMetadata";

	return minMaxUrl;
}

function getMinMaxFromServer(url) {
	return $.ajax({
		type: "GET",
		url: url,
		dataType: "json"
	}).then(function (result) {
		var minMaxArr = [];
		var minMax = "auto";

		$.each(result, function (key, val) {
			minMaxArr.push(val);
		});

		if (minMaxArr.length > 0) {
			minMax = minMaxArr.join(",");
		}
		return minMax;
	}, function () {
		return new Error("Error: Could not retrieve min and max values for this layer.");
	});
}

function calculateMapDivHeight(mapWidth, worldWidth, worldHeight) {
	var ratio = worldWidth / worldHeight;
	return Math.round(mapWidth / ratio);
}

//Redefine the Date.toISOString method
(function () {
	function pad(number) {
		if (number < 10) {
			return '0' + number;
		}
		return number;
	}

	Date.prototype.toISOString = function () {
		return this.getUTCFullYear() +
			'-' + pad(this.getUTCMonth() + 1) +
			'-' + pad(this.getUTCDate()) +
			' ' + pad(this.getUTCHours()) +
			':' + pad(this.getUTCMinutes()) +
			':' + pad(this.getUTCSeconds());
	};

}());

function getZoomLevel(width) {
	if (width < 6000000) {
		return 3.5;
	} else {
		return 1;
	}
}

function setExtent(bBox, map) {
	//fitExtent is experimetal in version 3.5.0
	//addMessage("setExtent: " + bBox + " (bBox)");
	//var extent = ol.extent.applyTransform([-179.5, -80, 179.5, 80], ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
	//var extent = ol.extent.applyTransform([-15, 35, 35, 70], ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
	//addMessage("setExtent: " + extent + " (extent)");

	//map.getView().fitExtent(ol.extent.applyTransform([0, 50, 20, 50], ol.proj.getTransform("EPSG:4326", "EPSG:3857")), map.getSize());
	map.getView().fitExtent(bBox, map.getSize());
}

function rewriteUrlForLocalhost(getCapabilitiesURL) {
	if (getCapabilitiesURL.indexOf("yearly_1x1_fluxes.nc") > -1) {
		getCapabilitiesURL = "capabilities/yearly_1x1_fluxes.xml";
	} else {
		getCapabilitiesURL = "capabilities/CO2_EUROPE_LSCE.xml";
	}

	return getCapabilitiesURL;
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