var Capabilities = require('../models/Capabilities.js');
var Utils = require('../Utils.js');


module.exports = function(Backend, capabsWantedAction, logAction){

	return Reflux.createStore({

		init: function(){
			this.listenTo(capabsWantedAction, this.fetchCapabilities);
		},

		fetchCapabilities: function(service){

			this.service = service;

			var doIfRelevant = Utils.doIfConditionHolds.bind(this, function(){
				return this.service == service;
			});

			Backend.getCapabilitiesXml(service)
				.done(doIfRelevant(this.onSuccess))
				.fail(doIfRelevant(this.onFailure));
		},

		onSuccess: function(xmlString){
			var $xml = $(xmlString);
			var capabs = new Capabilities($xml);
			this.trigger(capabs);
			console.log(capabs);
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
