module.exports = function(elemId, CapabilitiesStore){

	var $ddl = $("#" + elemId);
	var action = Reflux.createAction();
	var latestCapabilities;

	function trigger() {
		action({
			style: $ddl.val(),
			capabilities: latestCapabilities
		});
	}

	$ddl.change(trigger);

	CapabilitiesStore.listen(function(capabilities){
		$ddl.find('option').remove().end();

		capabilities.styles.forEach(function (item) {
			$ddl.append($("<option />").val(item.name).text(item.name.replace("boxfill/", "")));
		});

		$ddl.prop("selectedIndex", 1);

		latestCapabilities = capabilities;
		trigger();
	});

	return {action: action};
};
