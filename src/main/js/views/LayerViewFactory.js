module.exports = function(elemId, CapabilitiesStore){

	var $ddl = $("#" + elemId);
	var action = Reflux.createAction();
	var latestCapabilities;

	function trigger() {
		action({
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

	return {action: action};
};
