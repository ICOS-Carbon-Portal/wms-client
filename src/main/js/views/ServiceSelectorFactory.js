module.exports = function(elemId, capabsWantedAction){

	var $ddl = $("#" + elemId);

	function trigger() {
		capabsWantedAction($ddl.val());
	}

	$ddl.change(trigger);

	return {
		trigger: trigger
	};

};