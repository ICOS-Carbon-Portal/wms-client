Reflux = require('reflux');
$ = require("jquery.1")(require("jsdom").jsdom().parentWindow);
$.Deferred = require('jquery-deferred').Deferred;

var factory = require('../../../main/js/stores/DateStoreFactory.js');

describe("DateStore", function() {

	var store, CapabilitiesStore, mapReadyAction, animationPause, output;

	beforeEach(function(){

		CapabilitiesStore = Reflux.createAction();
		mapReadyAction = Reflux.createAction();
		animationPause = 1;

		CapabilitiesStore({
			serviceUrl: "serviceUrl",
			formats: ["png", "gif", "jpg"],
			layers: ["CO2", "psurf", "yearly_fluxes"],
			geo: {
				bBox4326Str: "-15,35,35,70",
				bBox3857Arr: [ -15, 35, 35, 70 ],
				bBox3857Str: "-15,35,35,70",
				width3857: 50,
				height3857: 35
			},
			styles: ["red", "blue", "yellow"],
			dates: ["2001-01-01", "2002-02-02", "2003-03-03"],
			elevations: ["0", "20", "100"],
			mapDims: {
				width: 500,
				height: 350
			}
		});

		mapReadyAction({
			LAYERS: "psurf",
			ELEVATION: "0",
			TIME: "2002-02-02",
			TRANSPARENT: "true",
			STYLES: "blue",
			COLORSCALERANGE: "100,200",
			NUMCOLORBANDS: 254,
			LOGSCALE: "false",
			WIDTH: 500,
			HEIGHT: 350
		});

		output = [];

		store = factory(CapabilitiesStore, mapReadyAction, animationPause);

		store.listen(function(state){
			output.push(state);
		});

	});

	it("let us chose a date", function(done){
		store.actions.dateChosen("2003-03-03");

		setTimeout(function(){
			expect(output[0].date).toEqual("2003-03-03");
			expect(output[0].dateIndex).toEqual(2);
			done();
		}, 2);
	});

	it("advances to next date", function(done){
		store.actions.nextDate();

		setTimeout(function(){
			expect(output[0].date).toEqual("2002-02-02");
			expect(output[0].dateIndex).toEqual(1);
			done();
		}, 2);
	});

	it("steps back to previous date", function(done){
		store.actions.previousDate();

		setTimeout(function(){
			expect(output[0].date).toEqual("2001-01-01");
			expect(output[0].dateIndex).toEqual(0);
			done();
		}, 2);
	});

	it("triggers the animation", function(done){
		store.actions.playPause();

		setTimeout(function(){
			expect(output[0].playing).toEqual(true);
			expect(output[0].sender).toEqual("animate");
			done();
		}, 2);
	});

});