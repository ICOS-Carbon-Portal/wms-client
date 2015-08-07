var ServicesClass = require('./models/Services.js');
var Capabilities = require("./models/Capabilities.js");

module.exports = {

	requestCapabs: function(url){

		return $.ajax({
			type: "GET",
			url: url + "?service=WMS&version=1.3.0&request=GetCapabilities",
			dataType: "xml"
		});
	},

	getCapabs: function(xmlString, serviceUrl, config){
		return new Capabilities(serviceUrl, xmlString, config);
	},

	requestCatalog: function(url){

		return $.ajax({
			type: "GET",
			url: url,
			dataType: "xml"
		});
	},

	getCatalog: function(xmlString, paramsEnc) {
		return new ServicesClass(xmlString, paramsEnc);
	},

	getMinMax: function (url) {
		return $.ajax({
			type: "GET",
			url: url,
			dataType: "json"
		});
	}
};
