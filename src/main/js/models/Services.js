function ServicesClass(xml, paramsEnc) {

	var $xmlDoc = $(xml);

	this.services = processXML($xmlDoc);
	this.query = processQuery(paramsEnc);

	this.getServiceUrl = function(){
		var serv = this.query.serv;
		var services = this.services;
		var serviceArr = $.grep(services, function(s) { return s.dataset == serv; });
		var service = null;

		if (serviceArr.length == 0){
			service = services[0];
		} else if(serviceArr.length == 1){
			service = serviceArr[0];
		} else if (serviceArr.length > 1){
			//TODO Find out how to securely match datasets
			config.log("Could not find a unique service in the list");
		}

		return service.url;
	};
}

function processXML($xmlDoc) {
	var baseURL = $xmlDoc.find("catalog > service[name='all'] > service[serviceType='WMS']").attr("base");
	var datasets = $xmlDoc.find("catalog > dataset");
	var services = [];

	datasets.each(function(){
		var id = $(this).attr("ID");
		var name = $(this).attr("name");
		var urlPath = $(this).attr("urlPath");
		var dataset = urlPath.replace(/^.*[\/]/, '');
		var service = new ServiceClass(id, name, baseURL + urlPath, dataset);
		services.push(service);
	});

	return services;
}

function ServiceClass(id, name, url, dataset){
	this.id = id;
	this.name = name;
	this.url = url;
	this.dataset = dataset;
}

function processQuery(paramsEnc){
	// paramsEnc starts with "?"
	var params = decodeURI(paramsEnc.substring(1));
	var pairsArr = params.split("&");
	var query = {};

	pairsArr.forEach(function(pair){
		var keyVal = pair.split("=");
		query[keyVal[0]] = keyVal[1];
	});

	return query;
}

module.exports = ServicesClass;