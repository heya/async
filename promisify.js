// this is node.js-specific module that follows convertNodeAsyncFunction() from:
// https://github.com/MaxMotovilov/node-promise/blob/master/promise.js

var Deferred = require("./Deferred");

function smartResult(deferred){
	return function(error){
		if(error){
			deferred.reject(error);
		}else{
			deferred.resolve(arguments.length > 2 ?
				Array.prototype.slice.call(arguments, 1) : arguments[1]);
		}
	};
}

function arrayResult(deferred){
	return function(error){
		if(error){
			deferred.reject(error);
		}else{
			deferred.resolve(Array.prototype.slice.call(arguments, 1));
		}
	};
}

module.exports = function promisify(fn, context, resultIsArray){
	var getResult = resultIsArray ? arrayResult : smartResult;
	return function(){
		var deferred = new Deferred(),
			args = Array.prototype.slice.call(arguments, 0);
		args.push(getResult(deferred));
		fn.apply(context, args);
		return deferred;
	};
};
