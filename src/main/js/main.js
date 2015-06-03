var Actions = Reflux.createActions([
	"capabsWantedAction",
	"styleChosenAction",
	"logAction"
]);

var Backend = require('./Backend.js');

var CapabilitiesStore = require('./stores/CapabilitiesStoreFactory.js')(
	Backend,
	Actions.capabsWantedAction,
	Actions.logAction
);

$(function () {
	var serviceSelector = require('./views/ServiceSelectorFactory.js')(
		"servicesDdl",
		Actions.capabsWantedAction
	);

	serviceSelector.trigger();

	var styleSelector = require('./views/StyleViewFactory.js')(
		"stylesDdl",
		CapabilitiesStore,
		Actions.styleChosenAction
	);
});

Actions.styleChosenAction.listen(function(style){console.log(style);});
