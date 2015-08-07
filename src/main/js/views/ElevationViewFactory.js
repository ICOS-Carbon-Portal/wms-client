module.exports = function(elemId, layerChosenAction){

	var $ddl = $("#" + elemId);
	var action = Reflux.createAction();
	var latestCapabilities;

	function trigger() {
		action({
			elevation: $ddl.val(),
			capabs: latestCapabilities
		});
	}

	$ddl.change(trigger);

	layerChosenAction.listen(function(chosenLayer){
		var capabs = chosenLayer.capabs;
		var layer = chosenLayer.layer;

		$ddl.find('option').remove().end();

		if (capabs.layerHasElevation(layer)){

			capabs.elevations.forEach(function (item) {
				$ddl.append($("<option />").val(item).text(item));
			});

			$("#elevationContainer").show();

			if (isElevationValid(capabs.elevations, capabs.Services.query.e)){
				$ddl.val(capabs.Services.query.e);
			}

		} else {
			$("#elevationContainer").hide();
		}

		latestCapabilities = capabs;

		trigger();
	});

	//layerChosenAction.listen(function(chosenLayer){
	//	$ddl.find('option').remove().end();
	//	console.log(chosenLayer);
	//	if(chosenLayer.capabs.layerHasElevation(chosenLayer.layer)){
	//		$("#elevationContainer").show();
	//	} else {
	//		$("#elevationContainer").hide();
	//	}
	//});

	return {action: action};

};

function isElevationValid(elevationsArr, e){
	var isValid = false;

	elevationsArr.forEach(function (elevation){
		if(elevation == e){
			isValid = true;
		}
	});

	return isValid;
};