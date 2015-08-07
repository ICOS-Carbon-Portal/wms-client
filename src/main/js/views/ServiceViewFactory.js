module.exports = function(ServiceStore, elemId){

	var action = Reflux.createAction();
	//var $ddl = $("#" + elemId);

	ServiceStore.listen(function(Services){
		//$ddl.find('option').remove().end();
		//
		//Services.services.forEach(function (item) {
		//	$ddl.append($("<option />").val(item.dataset).text(item.name));
		//});

		if(isServiceValid(Services)){
			action(Services.services.url);
		}

	});

	return {
		action: action
	};

};

function isServiceValid(Services){
	var isValid = false;
	var services = Services.services;
	var serv = Services.query.serv;

	services.forEach(function (service){
		if(service.dataset == serv){
			isValid = true;
		}
	});

	return isValid;
};

function getDataset(Services){
	var serv = Services.query.serv;
	var services = Services.services;
	var serviceArr = $.grep(services, function(s) { return s.dataset == serv; });
	var service = null;

	if (serviceArr.length == 0){
		this.setService(services[0].dataset);
		service = services[0];
	} else if(serviceArr.length == 1){
		service = serviceArr[0];
	} else if (serviceArr.length > 1){
		//TODO Find out how to securely match datasets
		console.log("Could not find a unique service in the list");
	}

	return service.dataset;
};
