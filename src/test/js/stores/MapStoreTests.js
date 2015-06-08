var factory = require('../../../main/js/stores/MapStoreFactory.js');
Reflux = require('reflux');
$ = require('jquery-deferred');

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

		minMaxInput({min: 0, max: 100, date: 'date', elevation: '1.0', layer: 'bio_flux_opt', capabilities: capabs});
		styleInput({style: "redblue", capabilities: capabs});

		setTimeout(function(){
			expect(output).toEqual([{
				min: 0,
				max: 100,
				date: 'date',
				elevation: '1.0',
				layer: 'bio_flux_opt',
				style: 'redblue',
				capabilities: capabs
			}]);
			done();
		}, 2);
	});

	it("resets internal state if capabilities url changes in one of the inputs", function(done) {

		minMaxInput({min: 0, max: 100, date: 'date', elevation: '1.0', layer: 'bio_flux_opt', capabilities: {serviceUrl: 'url1'}});
		styleInput({style: "redblue", capabilities: {serviceUrl: 'url2'}});
		minMaxInput({min: 0, max: 200, date: 'date2', elevation: '2.0', layer: 'fossil_flux_opt', capabilities: {serviceUrl: 'url2'}});

		setTimeout(function(){
			expect(output).toEqual([{
				min: 0,
				max: 200,
				date: 'date2',
				elevation: '2.0',
				layer: 'fossil_flux_opt',
				style: 'redblue',
				capabilities: {serviceUrl: 'url2'}
			}]);
			done();
		}, 2);
	});


});
