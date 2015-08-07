module.exports = function(config, DateStore){

	var $ddl = $("#" + config.datesId);
	var $dateRev = $("#" + config.dateRev);
	var $dateFwd = $("#" + config.dateFwd);
	var $datePlay = $("#" + config.datePlay);
	var lastDates;

	DateStore.listen(function(state){
		var currentDates = state.dates;

		if (state.sender == "animate" && !state.playing){
			$datePlay.html("&#9658;");
		} else if (state.sender == null && !state.playing){
			$datePlay.html("&#9658;");

			if (lastDates !== currentDates) {
				$ddl.find('option').remove().end();

				currentDates.forEach(function (date) {
					$ddl.append($("<option />").val(date).text(new Date(date).toISOString()));
				});

				if (isDateValid(currentDates, state.capabs.Services.query.d)) {
					$ddl.val(state.capabs.Services.query.d);

					state.date = state.capabs.Services.query.d;
					state.dateIndex = $ddl[0].selectedIndex;
				}
			}

			lastDates = currentDates;
		} else {
			$datePlay.html("&#9724;");
		}

		if (state.dateIndex < currentDates.length) {
			$ddl[0].selectedIndex = state.dateIndex;
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

function isDateValid(datesArr, d){
	var isValid = false;

	datesArr.forEach(function (date){
		if(date == d){
			isValid = true;
		}
	});

	return isValid;
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
