var Utils = require('../Utils.js');

module.exports = function(MinMaxStore, styleChosenAction){

	return Reflux.createStore({

		init: function(){
			this.listenTo(MinMaxStore, this.updateReceived);
			this.listenTo(styleChosenAction, this.updateReceived);

			this.mapState = {};
		},

		updateReceived: function(update){
			var capabs = this.mapState.capabilities;

			if(!capabs || capabs.serviceUrl != update.capabilities.serviceUrl){
				this.mapState = {};
			}

			var state = this.mapState;
			$.extend(state, update);

			var requiredProps = [
				'style', 'min', 'max', 'layer',
				'date', 'elevation', 'capabilities'
			];

			if(Utils.propertiesAreDefined(state, requiredProps)){
				this.trigger(state);
			}
		}

	});
};

