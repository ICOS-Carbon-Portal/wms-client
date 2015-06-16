$(function () {

	var config = {
		mapWidth: $("#map").width(),
		mapId: "map",
		servicesId: "servicesDdl",
		layersId: "layersDdl",
		stylesId: "stylesDdl",
		datesId: "datesDdl",
		dateRev: "dateRev",
		dateFwd: "dateFwd",
		datePlay: "datePlay",
		elevationsId: "elevationsDdl",
		log: function(payload){
			console.log(payload);
		}
	};

	var mapReadyAction = Reflux.createAction();

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
	var DateStore = require('./stores/DateStoreFactory.js')(CapabilitiesStore, mapReadyAction);
	var dateChosenAction = require('./views/DateViewFactory.js')(config, DateStore);
	var elevationChosenAction = require('./views/ElevationViewFactory.js')(config.elevationsId, CapabilitiesStore).action;

	var MinMaxStore = require("./stores/MinMaxStoreFactory.js")(
		config,
		Backend,
		layerChosenAction,
		DateStore,
		elevationChosenAction
	);

	var MapStore = require("./stores/MapStoreFactory.js")(MinMaxStore, styleChosenAction);
	var MapView = require('./views/MapViewFactory.js')(config.mapId, MapStore, mapReadyAction, config.log);

	serviceView.trigger();

});
