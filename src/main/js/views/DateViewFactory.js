module.exports = function(elemId, CapabilitiesStore, dateChosenAction){

	var $ddl = $("#" + elemId);
	var latestCapabilities;

	function trigger() {
		dateChosenAction({
			date: $ddl.val(),
			capabilities: latestCapabilities
		});
	}

	$ddl.change(trigger);

	CapabilitiesStore.listen(function(capabilities){
		$ddl.find('option').remove().end();

		capabilities.dates.forEach(function (item) {
			$ddl.append($("<option />").val(item).text(new Date(item).toISOString()));
		});

		latestCapabilities = capabilities;
		trigger();
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
