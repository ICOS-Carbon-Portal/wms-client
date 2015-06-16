module.exports = function(CapabilitiesStore, mapReadyAction){

	var actions = Reflux.createActions([
		"dateChosen", "nextDate", "previousDate", "playPause"
	]);

	var store = Reflux.createStore({

		init: function(){
			this.state = {
				playing: false,
				pause: 1000
			};
			this.listenTo(CapabilitiesStore, this.capabilitiesReceived);
			this.listenTo(actions.dateChosen, this.dateChosenHandler);
			this.listenTo(actions.previousDate, this.previousDateHandler);
			this.listenTo(actions.nextDate, this.nextDateHandler);
			this.listenTo(actions.playPause, this.playPauseHandler);
			this.listenTo(mapReadyAction, this.mapReadyHandler);
		},

		capabilitiesReceived: function(capabilities){
			this.state.capabilities = capabilities;
			this.state.dates = capabilities.dates;
			this.state.date = capabilities.dates[0];
			this.state.dateIndex = 0;
			this.state.playing = false;
			this.triggerIfReady();
		},

		dateChosenHandler: function(date){
			var dates = this.state.dates;

			if(dates && dates.indexOf(date) >= 0){
				this.state.date = date;
				this.state.dateIndex = dates.indexOf(date);
				this.triggerIfReady();
			}
		},

		previousDateHandler: function(){
			var dates = this.state.dates;
			if(dates && this.state.dateIndex > 0){
				this.state.dateIndex--;
				this.state.date = dates[this.state.dateIndex];
				this.triggerIfReady();
			}
		},

		nextDateHandler: function(){
			var dates = this.state.dates;
			if(dates && this.state.dateIndex < dates.length){
				this.state.dateIndex++;
				this.state.date = dates[this.state.dateIndex];
				this.triggerIfReady();
			}
		},

		playPauseHandler: function(){
			this.state.playing = !this.state.playing;
			if(this.state.playing) {
				this.nextDateHandler();
			} else {
				this.triggerIfReady();
			}
		},

		mapReadyHandler: function(mapParams){
			if(this.state.playing && mapParams.TIME === this.state.date){
				setTimeout(this.playNext.bind(this), this.state.pause);
			}
		},

		playNext: function(){
			if(this.state.playing){
				this.nextDateHandler();
			}
		},

		triggerIfReady: function(){
			if(this.state.date && this.state.capabilities){
				this.trigger(this.state);
			}
		}

	});

	store.actions = actions;
	return store;
};