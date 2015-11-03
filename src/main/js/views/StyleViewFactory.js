module.exports = function(elemId, ServiceStore, CapabilitiesStore){

	var $ddl = $("#" + elemId);
	var action = Reflux.createAction();
	var latestCapabilities;

	function trigger() {
		action({
			style: $ddl.val(),
			capabs: latestCapabilities
		});
	}

	$ddl.change(trigger);

	CapabilitiesStore.listen(function(capabs){
		$ddl.find('option').remove().end();

		capabs.styles.forEach(function (item) {
			$ddl.append($("<option />").val(item.name).text(item.name.replace("boxfill/", "")));
		});

		if (isStyleValid(capabs.styles, capabs.Services.query.s)){
			$ddl.val("boxfill/" + capabs.Services.query.s);
		}

		latestCapabilities = capabs;
		trigger();
	});

	return {action: action};
};

if (String.endsWith === undefined) {
	String.prototype.endsWith = function (suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

function isStyleValid(styleClassArr, s){
	var isValid = false;

	styleClassArr.forEach(function (style){
		if(style.name.endsWith(s)){
			isValid = true;
		}
	});

	return isValid;
};