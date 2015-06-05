module.exports = function(elemId, MapStore, logAction){

	var $mapDiv = $("#" + elemId);

	MapStore.listen(function(state){
		config.log("serviceUrl: " + state.capabilities.serviceUrl);
		config.log("Layer: " + state.layer);
		config.log("Style: " + state.style);
		config.log("Date: " + state.date);
		config.log("Elevation: " + state.elevation);
		config.log("Min: " + state.min);
		config.log("Max: " + state.max);
	});
};

