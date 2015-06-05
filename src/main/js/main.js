$(function () {

	var Actions = Reflux.createActions([
		"capabsWantedAction",
		"layerChosenAction",
		"styleChosenAction",
		"dateChosenAction",
		"elevationChosenAction",
		"logAction"
	]);

	var config = {
		mapWidth: $("#map").width(),
		mapId: "map",
		servicesId: "servicesDdl",
		layersId: "layersDdl",
		stylesId: "stylesDdl",
		datesId: "datesDdl",
		elevationsId: "elevationsDdl"
	};

	var Backend = require('./Backend.js');

	var CapabilitiesStore = require('./stores/CapabilitiesStoreFactory.js')(
		Backend,
		Actions.capabsWantedAction,
		Actions.logAction
	);

	var MapStore = require("./stores/MapStoreFactory.js")(
		config.mapWidth,
		Backend,
		Actions.layerChosenAction,
		Actions.styleChosenAction,
		Actions.dateChosenAction,
		Actions.elevationChosenAction,
		Actions.logAction
	);

	var serviceSelector = require('./views/ServiceSelectorFactory.js')(
		config.servicesId,
		Actions.capabsWantedAction
	);

	var layerSelector = require('./views/LayerViewFactory.js')(
		config.layersId,
		CapabilitiesStore,
		Actions.layerChosenAction
	);

	var styleSelector = require('./views/StyleViewFactory.js')(
		config.stylesId,
		CapabilitiesStore,
		Actions.styleChosenAction
	);

	var dateSelector = require('./views/DateViewFactory.js')(
		config.datesId,
		CapabilitiesStore,
		Actions.dateChosenAction
	);

	var elevationSelector = require('./views/ElevationViewFactory.js')(
		config.elevationsId,
		CapabilitiesStore,
		Actions.elevationChosenAction
	);

	var mapModule = require('./views/MapViewFactory.js')("map", MapStore);

	serviceSelector.trigger();

});
