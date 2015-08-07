$ = require("jquery.1")(require("jsdom").jsdom().parentWindow);
$.Deferred = require('jquery-deferred').Deferred;

var fs = require("fs");
var path = require("path");

var Capabilities = require("../../../main/js/models/Capabilities.js");
var factory = require('../../../main/js/stores/CapabilitiesStoreFactory.js');
var serviceFactory = require('../../../main/js/stores/ServiceStoreFactory.js');

describe("CapabilitiesStore", function() {

	var urlInput, logOutput, store, serviceStore;

	var faultyBackend = {
		requestCapabs: function(url){
			var $xml = $.Deferred();

			var delay = url == 'slowUrl' ? 20 : 0;

			setTimeout(function(){
				$xml.reject({oops: url});
			}, delay);

			return $xml.promise();
		},

		requestCatalog: function(url){
			var $xml = $.Deferred();

			var delay = url == 'slowUrl' ? 20 : 0;

			setTimeout(function(){
				$xml.reject({oops: url});
			}, delay);

			return $xml.promise();
		}
	};
	
	beforeEach(function(){
		urlInput = Reflux.createAction();
		logOutput = jasmine.createSpy('log');

		serviceStore = serviceFactory(
			faultyBackend,
			"?serv=yearly_1x1_fluxes_limited.nc&v=bio_flux_prior&s=redblue&d=2005-07-01T17:10:27.097Z&e=0",
			{
				log: function(){return "log";},
				catalog: "/thredds/catalog.xml"
			}
		);

		store = factory(faultyBackend, serviceStore, {log: logOutput, mapWidth: 500});
	});

	it("parses XML correctly", function(done){
		var file = path.join(__dirname, "../../resources/", "CO2_EUROPE_LSCE.xml");

		setTimeout(function(){
			var capabsXML = fs.readFileSync(file, {encoding: "utf8"}, function (err, data) {
				if (err) throw err;
			});

			var capabs = new Capabilities(
				"serviceURL",
				capabsXML,
				{
					mapWidth: 500,
					transform4326To3857: function(input){
						return input;
					},
					addMessage: function(mess){
						console.log(mess);
					}
				}
			);

			expect(capabs.serviceUrl).toBe("serviceURL");
			expect(capabs.formats.length).toBe(5);
			expect(capabs.layers.length).toBe(4);
			expect(capabs.styles.length).toBe(10);
			expect(capabs.dates.length).toBe(121);
			expect(capabs.elevations.length).toBe(29);
			done();
		}, 10);

	});

	xit("logs a failure upon backend failure", function(done) {
		var url = 'theUrl';
		urlInput(url);

		setTimeout(function(){
			expect(logOutput.calls.count()).toBe(1);
			expect(logOutput.calls.mostRecent().args[0].payload).toEqual({oops: url});
			done();
		}, 10);
	});

	xit("disregards a slow backend response if a later request was answered already", function(done){
		urlInput('slowUrl');
		urlInput('theUrl');

		setTimeout(function(){
			expect(logOutput.calls.count()).toBe(1);
			expect(logOutput.calls.mostRecent().args[0].payload).toEqual({oops: 'theUrl'});
			done();
		}, 30); //30 ms is enough for 'slowUrl' request to be answered (it has delay 20, see above)
	});

	xit("respects a slow backend response if a later request was sent after it", function(done){
		urlInput('slowUrl');

		setTimeout(function(){
			urlInput('theUrl')
		}, 21);

		setTimeout(function(){
			expect(logOutput.calls.count()).toBe(2);
			expect(logOutput.calls.argsFor(0)[0].payload).toEqual({oops: 'slowUrl'});
			expect(logOutput.calls.argsFor(1)[0].payload).toEqual({oops: 'theUrl'});
			done();
		}, 30);
	});

});