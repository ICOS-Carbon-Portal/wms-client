module.exports = function(elemId){

	var action = Reflux.createAction();
	var $ddl = $("#" + elemId);

	function trigger() {
		action($ddl.val());
	}

	$ddl.change(trigger);

	return {
		trigger: trigger,
		action: action
	};

};
