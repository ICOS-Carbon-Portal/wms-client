$(function () {

	var config = {
		mapWidth: $("#map").width(),
		mapId: "map",
		servicesId: "servicesDdl",
		layersId: "layersDdl",
		stylesId: "stylesDdl",
		datesId: "datesDdl",
		elevationsId: "elevationsDdl",
		log: function(payload){
			console.log(payload);
		}
	};

	var serviceView = require('./views/ServiceViewFactory.js')(config.servicesId);
	var serviceSelectedAction = serviceView.action;

	var Backend = require('./Backend.js');

	var CapabilitiesStore = require('./stores/CapabilitiesStoreFactory.js')(
		Backend,
		serviceSelectedAction,
		config.log
	);

	var layerChosenAction = require('./views/LayerViewFactory.js')(config.layersId, CapabilitiesStore).action;
	var styleChosenAction = require('./views/StyleViewFactory.js')(config.stylesId, CapabilitiesStore).action;
	var dateChosenAction = require('./views/DateViewFactory.js')(config.datesId, CapabilitiesStore).action;
	var elevationChosenAction = require('./views/ElevationViewFactory.js')(config.elevationsId, CapabilitiesStore).action;

	var MinMaxStore = require("./stores/MinMaxStoreFactory.js")(
		config,
		Backend,
		layerChosenAction,
		dateChosenAction,
		elevationChosenAction
	);

	var MapStore = require("./stores/MapStoreFactory.js")(config, MinMaxStore, styleChosenAction);
	var MapView = require('./views/MapViewFactory.js')(config.mapId, MapStore, config.log);

	serviceView.trigger();

});
