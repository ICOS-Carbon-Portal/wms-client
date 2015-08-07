Reflux = require('reflux');
$ = require("jquery.1")(require("jsdom").jsdom().parentWindow);
$.Deferred = require('jquery-deferred').Deferred;

var factory = require('../../../main/js/stores/MapStoreFactory.js');

describe("MapStore", function() {

	var minMaxInput, styleInput, output;

	beforeEach(function(){

		minMaxInput = Reflux.createAction();
		styleInput = Reflux.createAction();

		output = [];

		var store = factory(minMaxInput, styleInput);

		store.listen(function(state){
			output.push(state);
		});

	});

	it("triggeres a state update upon arrival of consistent min/max and style info", function(done) {
		var capabs = {serviceUrl: 'theUrl'};

		minMaxInput({min: 0, max: 100, date: 'date', elevation: '1.0', layer: 'bio_flux_opt', capabs: capabs});
		styleInput({style: "redblue", capabs: capabs});

		setTimeout(function(){
			expect(output).toEqual([{
				min: 0,
				max: 100,
				date: 'date',
				elevation: '1.0',
				layer: 'bio_flux_opt',
				style: 'redblue',
				requestUrl: '?serv=theUrl&v=bio_flux_opt&s=redblue&d=date&e=1.0',
				capabs: capabs
			}]);
			done();
		}, 2);
	});

	it("resets internal state if capabilities url changes in one of the inputs", function(done) {

		minMaxInput({min: 0, max: 100, date: 'date', elevation: '1.0', layer: 'bio_flux_opt', capabs: {serviceUrl: 'url1'}});
		styleInput({style: "redblue", capabs: {serviceUrl: 'url2'}});
		minMaxInput({min: 0, max: 200, date: 'date2', elevation: '2.0', layer: 'fossil_flux_opt', capabs: {serviceUrl: 'url2'}});

		setTimeout(function(){
			expect(output).toEqual([{
				min: 0,
				max: 200,
				date: 'date2',
				elevation: '2.0',
				layer: 'fossil_flux_opt',
				style: 'redblue',
				requestUrl: '?serv=url2&v=fossil_flux_opt&s=redblue&d=date2&e=2.0',
				capabs: {serviceUrl: 'url2'}
			}]);
			done();
		}, 2);
	});

	it("does not trigger request until all required properties are set", function(done){
		var capabs = {serviceUrl: 'theUrl'};

		minMaxInput({min: 0, date: 'date', elevation: '1.0', layer: 'bio_flux_opt', capabs: capabs});
		styleInput({style: "redblue", capabs: capabs});

		setTimeout(function(){
			expect(output).toEqual([]);
			done();
		}, 2);
	});
});
