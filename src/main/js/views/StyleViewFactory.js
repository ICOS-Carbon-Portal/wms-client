module.exports = function(elemId, CapabilitiesStore, styleChosenAction){

	var $ddl = $("#" + elemId);

	function trigger() {
		styleChosenAction($ddl.val());
	}

	$ddl.change(trigger);

	CapabilitiesStore.listen(function(capablities){
		$ddl.find('option').remove().end();

		capablities.styles.forEach(function (item) {
			$ddl.append($("<option />").val(item.name).text(item.name.replace("boxfill/", "")));
		});

		$ddl.prop("selectedIndex", 1);
		trigger();
	});

};