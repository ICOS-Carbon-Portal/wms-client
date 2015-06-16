var Capabilities = require('../models/Capabilities.js');
var Utils = require('../Utils.js');


module.exports = function(Backend, serviceSelectedAction, logAction){

	return Reflux.createStore({

		init: function(){
			this.listenTo(serviceSelectedAction, this.fetchCapabilities);
		},

		fetchCapabilities: function(serviceUrl){

			this.serviceUrl = serviceUrl;

			var doIfRelevant = Utils.doIfConditionHolds.bind(this, function(){
				return this.serviceUrl == serviceUrl;
			});

			Backend.getCapabilitiesXml(serviceUrl)
				.done(doIfRelevant(this.onSuccess))
				.fail(doIfRelevant(this.onFailure));
		},

		onSuccess: function(xmlString){
			var $xml = $(xmlString);
			var capabs = new Capabilities(this.serviceUrl, $xml, $("#map").width());
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
