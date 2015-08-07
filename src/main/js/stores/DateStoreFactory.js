module.exports = function(CapabilitiesStore, mapReadyAction, animationPause){

	var actions = Reflux.createActions([
		"dateChosen", "nextDate", "previousDate", "playPause"
	]);

	var store = Reflux.createStore({

		init: function(){
			this.state = {
				playing: false,
				sender: null,
				pause: animationPause
			};
			this.listenTo(CapabilitiesStore, this.capabilitiesReceived);
			this.listenTo(actions.dateChosen, this.dateChosenHandler);
			this.listenTo(actions.previousDate, this.previousDateHandler);
			this.listenTo(actions.nextDate, this.nextDateHandler);
			this.listenTo(actions.playPause, this.playPauseHandler);
			this.listenTo(mapReadyAction, this.mapReadyHandler);
		},

		capabilitiesReceived: function(capabilities){
			this.state.capabs = capabilities;
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

		nextDateHandler: function(sender){
			var dates = this.state.dates;
			this.state.sender = sender;

			if (dates && this.state.dateIndex < dates.length - 1){
				this.state.dateIndex++;
				this.state.date = dates[this.state.dateIndex];
				this.triggerIfReady();
			} else {
				this.state.playing = false;
				this.triggerIfReady();
			}
		},

		playPauseHandler: function(){
			this.state.playing = !this.state.playing;

			if(this.state.playing) {
				this.nextDateHandler("animate");
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
				this.nextDateHandler("animate");
			}
		},

		triggerIfReady: function(){
			if(this.state.date && this.state.capabs){
				this.trigger(this.state);
			} else if (this.state.date == null && this.state.capabs){
				this.state.playing = false;
				this.trigger(this.state);
			}
		}

	});

	store.actions = actions;
	return store;
};