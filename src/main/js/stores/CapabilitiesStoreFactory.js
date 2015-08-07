var Utils = require('../Utils.js');

module.exports = function(Backend, ServiceStore, config){

	return Reflux.createStore({

		init: function(){
			this.listenTo(ServiceStore, this.fetchCapabilities);
		},

		fetchCapabilities: function(Services){
			var serviceUrl = Services.getServiceUrl();
			this.serviceUrl = serviceUrl;
			this.Services = Services;

			var doIfRelevant = Utils.doIfConditionHolds.bind(this, function(){
				return this.serviceUrl == serviceUrl;
			});

			Backend.requestCapabs(serviceUrl)
				.done(doIfRelevant(this.onSuccess))
				.fail(doIfRelevant(this.onFailure));
		},

		onSuccess: function(xmlString){
			var capabs = Backend.getCapabs(xmlString, this.serviceUrl, config);
			capabs.Services = this.Services;
			this.trigger(capabs);
		},

		onFailure: function(err){
			config.log({
				type: "error",
				message: "WMS capabilities XML fetching failed.",
				payload: err
			});

			if (config.addMessage) {
				config.addMessage("Could not retrieve capabilities from server", true);
			}
		}

	});
};
