$(function () {

	var config = {
		catalog: "/thredds/catalog.xml",
		mapWidth: $("#map").width(),
		mapId: "map",
		bgMapsName: "bgMaps",
		animationPause: 1,
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
		},
		transform4326To3857: function(lonLatArr4326){
			return ol.proj.transform(lonLatArr4326, 'EPSG:4326', 'EPSG:3857');
		},
		addMessage: function(msg, isErrorMsg) {
			isErrorMsg = typeof isErrorMsg !== 'undefined' ? isErrorMsg : false;

			if (isErrorMsg) {
				var $errorMsg = $("<div class='error'>" + msg + "</div>");
				$errorMsg.delay(7000).fadeOut("normal", function () {
					$errorMsg.remove();
				});
				$("#messages").append($errorMsg);
			} else {
				$("#messages").append("<div>" + msg + "</div>");
			}
		}
	};

	var mapReadyAction = Reflux.createAction();
	var Backend = require('./Backend.js');

	var ServiceStore = require("./stores/ServiceStoreFactory.js")(Backend, window.location.search, config);
	var ServiceView = require('./views/ServiceViewFactory.js')(ServiceStore, config.servicesId);

	var CapabilitiesStore = require('./stores/CapabilitiesStoreFactory.js')(
		Backend,
		ServiceStore,
		config
	);

	var layerChosenAction = require('./views/LayerViewFactory.js')(config.layersId, CapabilitiesStore).action;

	var styleChosenAction = require('./views/StyleViewFactory.js')(config.stylesId, ServiceStore, CapabilitiesStore).action;

	var DateStore = require('./stores/DateStoreFactory.js')(CapabilitiesStore, mapReadyAction, config.animationPause);
	var dateChosenAction = require('./views/DateViewFactory.js')(config, DateStore);

	var elevationChosenAction = require('./views/ElevationViewFactory.js')(config.elevationsId, layerChosenAction).action;

	var MinMaxStore = require("./stores/MinMaxStoreFactory.js")(
		config,
		Backend,
		layerChosenAction,
		DateStore,
		elevationChosenAction
	);

	var MapStore = require("./stores/MapStoreFactory.js")(MinMaxStore, styleChosenAction);
	var MapView = require('./views/MapViewFactory.js')(config.mapId, MapStore, mapReadyAction, config);

});
