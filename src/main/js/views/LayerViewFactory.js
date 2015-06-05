module.exports = function(elemId, CapabilitiesStore, layerChosenAction){

	var $ddl = $("#" + elemId);
	var latestCapabilities;

	function trigger() {
		layerChosenAction({
			layer: $ddl.val(),
			capabilities: latestCapabilities
		});
	}

	$ddl.change(trigger);

	CapabilitiesStore.listen(function(capabilities){
		$ddl.find('option').remove().end();

		capabilities.layers.forEach(function (item) {
			$ddl.append($("<option />").val(item.name).text(item.name + "  - " + item.abstract));
		});

		latestCapabilities = capabilities;
		trigger();
	});

};