module.exports = function(elemId, CapabilitiesStore){

	var $ddl = $("#" + elemId);
	var action = Reflux.createAction();
	var latestCapabilities;

	function trigger() {
		action({
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

	return {action: action};

};
