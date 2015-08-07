var Utils = require('../Utils.js');

module.exports = function(config, Backend, layerChosenAction, dateChosenAction, elevationChosenAction){

	return Reflux.createStore({

		init: function(){
			this.listenTo(layerChosenAction, this.updateReceived);
			this.listenTo(dateChosenAction, payloadFilter(this.updateReceived, ['date', 'capabs']));
			this.listenTo(elevationChosenAction, this.updateReceived);

			this.minMaxState = {};
		},

		updateReceived: function(update){
			var currentCapabs = this.minMaxState.capabs;

			if(!currentCapabs || currentCapabs.serviceUrl != update.capabs.serviceUrl){
				this.minMaxState = {};
			}

			var state = this.minMaxState;

			Utils.extend(state, update);

			if(Utils.propertiesAreDefined(state, ['layer', 'date', 'elevation'])){
				var minMaxUrl = getMinMaxUrl(config.mapWidth, state);
				this.minMaxUrl = minMaxUrl;

				var doIfRelevant = Utils.doIfConditionHolds.bind(this, function(){
					return this.minMaxUrl == minMaxUrl;
				});

				Backend.getMinMax(minMaxUrl)
					.done(doIfRelevant(this.onSuccess))
					.fail(doIfRelevant(this.onFailure));
			}
		},

		onSuccess: function(minMax){
			var state = this.minMaxState;
			Utils.extend(state, minMax);
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
	var capabs = state.capabs;

	return capabs.serviceUrl + "?item=minmax&layers=" + state.layer +
		"&width=" + capabs.mapDims.width + "&height=" + capabs.mapDims.height +
		"&bbox=" + capabs.geo.bBox4326Str +
		"&elevation=" + state.elevation +
		"&time=" + state.date + "&srs=EPSG:4326" +
		"&request=GetMetadata";
}

function payloadFilter(handler, props){

	return function(payload){
		var newPayload = {};
		props.forEach(function (prop){
			newPayload[prop] = payload[prop];
		});
		handler(newPayload);
	}
}