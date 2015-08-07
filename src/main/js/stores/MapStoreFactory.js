var Utils = require('../Utils.js');

module.exports = function(MinMaxStore, styleChosenAction){

	return Reflux.createStore({

		init: function(){
			this.listenTo(MinMaxStore, this.updateReceived);
			this.listenTo(styleChosenAction, this.updateReceived);

			this.mapState = {};
		},

		updateReceived: function(update){
			var capabs = this.mapState.capabs;

			if(!capabs || capabs.serviceUrl != update.capabs.serviceUrl){
				this.mapState = {};
			}

			var state = this.mapState;
			Utils.extend(state, update);

			var requiredProps = [
				'style', 'min', 'max', 'layer',
				'date', 'elevation', 'capabs'
			];

			if(Utils.propertiesAreDefined(state, requiredProps)){
				state.requestUrl = this.buildReqUrl(state);
				this.trigger(state);
			}
		},

		buildReqUrl: function(state){
			var dataset = state.capabs.serviceUrl.replace(/^.*[\/]/, '');
			var style = state.style.replace("boxfill/", "");
			var url = "?serv=" + dataset;
			url += "&v=" + state.layer;
			url += "&s=" + style;
			url += "&d=" + state.date;
			url += "&e=" + (state.elevation == null ? "0" : state.elevation);

			return url;
		}

	});
};

