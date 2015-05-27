function setLegendSrc(style, layerMinMax) {
	if (layerMinMax != "default"){
		//Reduce min max to 3 significant numbers for the legend
		var precision = 3;
		var tmp = layerMinMax.split(",");
		var min = Number(parseFloat(tmp[0]).toPrecision(precision));
		var max = Number(parseFloat(tmp[1]).toPrecision(precision));
		layerMinMax = min + "," + max;
	}
	$("#legend").attr("src", style.legend + "&TRANSPARENT=false&COLORSCALERANGE=" + layerMinMax + "&NUMCOLORBANDS=254");
}

function getMinMaxUrl(url, capabilities, mapWidth, mapHeight) {
	if(mapWidth == null|| mapHeight == null) {
		mapWidth = $("#map").css("width").replace("px", "");
		mapHeight = $("#map").css("height").replace("px", "");
	}
	var minMaxUrl = url + "?item=minmax&layers=" + capabilities.getActiveLayer().name;
	minMaxUrl += "&width=" + mapWidth + "&height=" + mapHeight;
	minMaxUrl += "&bbox=" + capabilities.getActiveLayer().bBox4326Str;
	minMaxUrl += "&elevation=" + (capabilities.getActiveElevation() || "0");
	minMaxUrl += "&time=" + capabilities.getActiveDate() + "&srs=EPSG:4326";
	minMaxUrl += "&request=GetMetadata";

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
			minMaxArr.push(parseFloat(val));
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

function setExtent(bBox, map, layerName) {
	//fitExtent is experimetal in version 3.5.0
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

function reverseDate(){
	var dates = document.getElementById("dates");

	if (dates.selectedIndex > 0){
		dates.selectedIndex = dates.selectedIndex - 1;
		$(dates).trigger("change");
		//addMessage(dates.options[dates.selectedIndex].value);
	}
}

function forwardDate(){
	var dates = document.getElementById("dates");

	if (dates.selectedIndex < dates.options.length - 1){
		dates.selectedIndex = dates.selectedIndex + 1;
		$(dates).trigger("change");
	}
}

function playDate(btn){
	var dates = document.getElementById("dates");
	var $playDate = $("#datePlay");

	if (btn != null) {
		if ($playDate.val() == "off") {
			$playDate.val("on");
			$playDate.html("&#9724;");
		} else {
			$playDate.val("off");
			$playDate.html("&#9658;");
		}
	}

	if($playDate.val() == "on") {
		if (dates.selectedIndex < dates.options.length - 1) {
			dates.selectedIndex = dates.selectedIndex + 1;
			$(dates).trigger("change");
			//addMessage("Selected index: " + dates.selectedIndex);
		} else {
			$playDate.val("off");
			$playDate.html("&#9658;");
		}
	}
}