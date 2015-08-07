module.exports = function(elemId, CapabilitiesStore){

	var $ddl = $("#" + elemId);
	var action = Reflux.createAction();
	var latestCapabilities;

	function trigger() {
		action({
			layer: $ddl.val(),
			capabs: latestCapabilities
		});
	}

	$ddl.change(trigger);

	CapabilitiesStore.listen(function(capabs){
		$ddl.find('option').remove().end();

		capabs.layers.forEach(function (item) {
			$ddl.append($("<option />").val(item.name).text(item.name + "  - " + item.abstract));
		});

		if (isVariableValid(capabs.layers, capabs.Services.query.v)){
			$ddl.val(capabs.Services.query.v);
		}

		latestCapabilities = capabs;
		trigger();
	});

	return {action: action};
};

function isVariableValid(layerClassArr, v){
	var isValid = false;

	layerClassArr.forEach(function (layer){
		if(layer.name == v){
			isValid = true;
		}
	});

	return isValid;
};
