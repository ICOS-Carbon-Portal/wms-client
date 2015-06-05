var Utils = require('../Utils.js');

module.exports = function(mapWidth, Backend, layerChosenAction, styleChosenAction, dateChosenAction, elevationChosenAction, logAction){

	return Reflux.createStore({

		init: function(){
			this.listenTo(layerChosenAction, this.updateReceived);
			this.listenTo(styleChosenAction, this.updateReceived);
			this.listenTo(dateChosenAction, this.updateReceived);
			this.listenTo(elevationChosenAction, this.updateReceived);

			this.mapState = {};
		},

		updateReceived: function(update){

			if(!this.mapState.capabilities || this.mapState.capabilities.serviceUrl != update.capabilities.serviceUrl){
				this.mapState = {};
			}

			$.extend(this.mapState, update);

			var state = this.mapState;

			if(state.layer && state.style && state.date && state.elevation){
				this.requestMap();
			}
		},

		requestMap: function() {
			var state = this.mapState;
			console.log("serviceUrl: " + state.capabilities.serviceUrl);
			console.log("Layer: " + state.layer);
			console.log("Style: " + state.style);
			console.log("Date: " + state.date);
			console.log("Elevation: " + state.elevation);
		},

		onSuccess: function(xmlString){
			var $xml = $(xmlString);
			var capabs = new Capabilities($xml);
			this.trigger(capabs);
		},

		onFailure: function(err){
			logAction({
				type: "error",
				message: "WMS capabilities XML fetching failed.",
				payload: err
			});
		}

	});
};

function calculateMapDivHeight(mapWidth, worldWidth, worldHeight) {
	var ratio = worldWidth / worldHeight;
	return Math.round(mapWidth / ratio);
}

function getMinMaxUrl(elemId, url, capabilities, mapWidth, mapHeight) {
	if(mapWidth == null|| mapHeight == null) {
		mapWidth = $("#" + elemId).css("width").replace("px", "");
		mapHeight = $("#" + elemId).css("height").replace("px", "");
	}
	var minMaxUrl = url + "?item=minmax&layers=" + capabilities.getActiveLayer().name;
	minMaxUrl += "&width=" + mapWidth + "&height=" + mapHeight;
	minMaxUrl += "&bbox=" + capabilities.getActiveLayer().bBox4326Str;
	minMaxUrl += "&elevation=" + (capabilities.getActiveElevation() || "0");
	minMaxUrl += "&time=" + capabilities.getActiveDate() + "&srs=EPSG:4326";
	minMaxUrl += "&request=GetMetadata";

	return minMaxUrl;
}