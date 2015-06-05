var Utils = require('../Utils.js');

module.exports = function(config, Backend, layerChosenAction, dateChosenAction, elevationChosenAction){

	return Reflux.createStore({

		init: function(){
			this.listenTo(layerChosenAction, this.updateReceived);
			this.listenTo(dateChosenAction, this.updateReceived);
			this.listenTo(elevationChosenAction, this.updateReceived);

			this.minMaxState = {};
		},

		updateReceived: function(update){
			var currentCapabs = this.minMaxState.capabilities;

			if(!currentCapabs || currentCapabs.serviceUrl != update.capabilities.serviceUrl){
				this.minMaxState = {};
			}

			var state = this.minMaxState;

			$.extend(state, update);

			if(state.layer && state.date && state.elevation){
				var minMaxUrl = getMinMaxUrl(config.mapWidth, state);
				this.minMaxUrl = minMaxUrl;

				var doIfRelevant = Utils.doIfConditionHolds.bind(this, function(){
					return this.minMaxUrl == minMaxUrl;
				});

				Backend.getCapabilitiesXml(serviceUrl)
					.done(doIfRelevant(this.onSuccess))
					.fail(doIfRelevant(this.onFailure));
			}
		},

		onSuccess: function(minMax){
			var state = this.minMaxState;
			$.extend(state, minMax);
			this.trigger(state);
		},

		onFailure: function(err){
			config.log({
				type: "error",
				message: "WMS min/max fetching failed.",
				payload: err
			});
		}
	});
};

function getMinMaxUrl(mapWidth, state) {
	var capabs = state.capabilities;

	var world = capabs.getWorldSize();
	var mapHeight = Math.round(mapWidth / world.width * world.height);

	return capabs.serviceUrl + "?item=minmax&layers=" + state.layer +
		"&width=" + mapWidth + "&height=" + mapHeight +
		"&bbox=" + capabs.getLayer(layer).bBox4326Str +
		"&elevation=" + state.elevation +
		"&time=" + state.date + "&srs=EPSG:4326" +
		"&request=GetMetadata";
}

