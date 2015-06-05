module.exports = function(config, MinMaxStore, styleChosenAction){

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

			if(state.style && state.min){
				/* presense of state.min implies (according to implicit message "contracts") that
				   layer, date, elevation and capabilities are also present */
				this.trigger(state);
			}
		}

	});
};

