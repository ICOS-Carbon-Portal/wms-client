Reflux = require('reflux');
$ = require("jquery")(require("jsdom").jsdom().parentWindow);
$.Deferred = require('jquery-deferred').Deferred;

var path = require("path");

var Services = require("../../../main/js/models/Services.js");
var factory = require('../../../main/js/stores/ServiceStoreFactory.js');

describe("ServiceStore", function() {

	it("parses query correctly", function(done){

		setTimeout(function(){
			var service = new Services("", "?serv=yearly_1x1_fluxes_limited.nc&v=bio_flux_prior&s=redblue&d=2005-07-01T17:10:27.097Z&e=0");

			expect(service.query).toEqual({
				serv: "yearly_1x1_fluxes_limited.nc",
				v: "bio_flux_prior",
				s: "redblue",
				d: "2005-07-01T17:10:27.097Z",
				e: "0"
			});
			done();
		}, 10);
	});

});