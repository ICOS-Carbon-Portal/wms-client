var factory = require('../../../main/js/stores/CapabilitiesStoreFactory.js');
Reflux = require('reflux');
$ = require('jquery-deferred');

describe("CapabilitiesStore", function() {

	var urlInput, logOutput, store;

	var faultyBackend = {
		getCapabilitiesXml: function(url){
			var xml = $.Deferred();

			var delay = url == 'slowUrl' ? 20 : 0;

			setTimeout(function(){
				xml.reject({oops: url});
			}, delay);

			return xml.promise();
		}
	};
	
	beforeEach(function(){
		urlInput = Reflux.createAction();
		logOutput = jasmine.createSpy('log');
		store = factory(faultyBackend, urlInput, logOutput);
	});

	it("logs a failure upon backend failure", function(done) {
		var url = 'theUrl';
		urlInput(url);

		setTimeout(function(){
			expect(logOutput.calls.count()).toBe(1);
			expect(logOutput.calls.mostRecent().args[0].payload).toEqual({oops: url});
			done();
		}, 10);
	});

	it("disregards a slow backend response if a later request was answered already", function(done){
		urlInput('slowUrl');
		urlInput('theUrl');

		setTimeout(function(){
			expect(logOutput.calls.count()).toBe(1);
			expect(logOutput.calls.mostRecent().args[0].payload).toEqual({oops: 'theUrl'});
			done();
		}, 30); //30 ms is enough for 'slowUrl' request go be answered (it has delay 20, see above)
	});

	it("respects a slow backend response if a later request was sent after it", function(done){
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
