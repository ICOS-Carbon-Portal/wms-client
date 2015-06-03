module.exports = {

	getCapabilitiesXml: function(url){

		return $.ajax({
			type: "GET",
			url: url + "?service=WMS&version=1.3.0&request=GetCapabilities",
			dataType: "xml"
		});
	}
};
