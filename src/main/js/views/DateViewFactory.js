module.exports = function(config, DateStore){

	var $ddl = $("#" + config.datesId);
	var $dateRev = $("#" + config.dateRev);
	var $dateFwd = $("#" + config.dateFwd);
	var $datePlay = $("#" + config.datePlay);
	var lastDates;

	DateStore.listen(function(state){
		var currentDates = state.dates;

		if(lastDates !== currentDates) {
			$ddl.find('option').remove().end();

			currentDates.forEach(function (date) {
				$ddl.append($("<option />").val(date).text(new Date(date).toISOString()));
			});
		}

		lastDates = currentDates;

		$ddl[0].selectedIndex = state.dateIndex;

		if (state.playing){
			$datePlay.html("&#9724;");
		} else {
			$datePlay.html("&#9658;");
		}
	});

	$ddl.change(function () {
		DateStore.actions.dateChosen($ddl.val());
	});

	$dateRev.off("click");
	$dateFwd.off("click");
	$datePlay.off("click");

	$dateRev.click(function(){
		DateStore.actions.previousDate();
	});

	$dateFwd.click(function(){
		DateStore.actions.nextDate();
	});

	$datePlay.click(function(){
		DateStore.actions.playPause();
	});

};

//Redefine the Date.toISOString method
(function () {
	function pad(number) {
		if (number < 10) {
			return '0' + number;
		}
		return number;
	}

	Date.prototype.toISOString = function () {
		return this.getUTCFullYear() +
			'-' + pad(this.getUTCMonth() + 1) +
			'-' + pad(this.getUTCDate()) +
			' ' + pad(this.getUTCHours()) +
			':' + pad(this.getUTCMinutes()) +
			':' + pad(this.getUTCSeconds());
	};

}());
