module.exports = {

	/*
		Returns a new function that executes another if a condition is truthy.
		The condition function and the inner function are called with the same 'this' as the outer function
	*/
	doIfConditionHolds: function(conditionFunction, innerFunction){
		var self = this;

		return function(){
			if(conditionFunction.apply(self)){
				innerFunction.apply(self, arguments);
			}
		};
	},

	propertiesAreDefined: function(obj, props){
		return props.every(function(prop){
			var propVal = obj[prop];
			return (typeof propVal !== 'undefined');
		});
	}

};
