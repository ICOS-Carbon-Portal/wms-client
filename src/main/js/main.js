var Actions = Reflux.createActions([
	"capabsWantedAction",
	"logAction"
]);

var Backend = require('./Backend.js');

var CapabilitiesStore = require('./stores/CapabilitiesStoreFactory.js')(
	Backend,
	Actions.capabsWantedAction,
	Actions.logAction
);
