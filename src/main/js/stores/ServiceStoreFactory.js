module.exports = function(Backend, paramsEnc, config){

	var store = Reflux.createStore({

		init: function(){
			this.fetchCatalog();
		},

		fetchCatalog: function(){

			Backend.requestCatalog(config.catalog)
				.done(this.onSuccess)
				.fail(this.onFailure);
		},

		onSuccess: function(xmlString){
			var serviceStore = Backend.getCatalog(xmlString, paramsEnc);

			this.trigger(serviceStore);
		},

		onFailure: function(err){
			config.log({
				type: "error",
				message: "Could not retrieve catalog from server.",
				payload: err
			});

			if (config.addMessage) {
				config.addMessage("Could not retrieve catalog from server", true);
			}
		}

	});

	return store;
}