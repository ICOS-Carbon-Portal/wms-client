module.exports = function(elemId, CapabilitiesStore, elevationChosenAction){

	var $ddl = $("#" + elemId);
	var latestCapabilities;

	function trigger() {
		elevationChosenAction({
			elevation: $ddl.val(),
			capabilities: latestCapabilities
		});
	}

	$ddl.change(trigger);

	CapabilitiesStore.listen(function(capabilities){
		$ddl.find('option').remove().end();

		capabilities.elevations.forEach(function (item) {
			$ddl.append($("<option />").val(item).text(item));
		});

		if (capabilities.elevations.length > 1){
			$("#elevationContainer").show();
		} else {
			$("#elevationContainer").hide();
		}

		latestCapabilities = capabilities;

		trigger();
	});

};
