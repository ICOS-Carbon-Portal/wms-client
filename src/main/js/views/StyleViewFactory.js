module.exports = function(elemId, CapabilitiesStore, styleChosenAction){

	var $ddl = $("#" + elemId);
	var latestCapabilities;

	function trigger() {
		styleChosenAction({
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

};