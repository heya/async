'use strict';

// follows https://github.com/heya/async/blob/master/promisify.js (under BSD license)


function smartResult (resolve, reject) {
	return function (error) {
		if (error) {
			reject(error);
		} else {
			resolve(arguments.length > 2 ?
				Array.prototype.slice.call(arguments, 1) : arguments[1]);
		}
	};
}

function arrayResult (resolve, reject) {
	return function (error) {
		if (error) {
			reject(error);
		} else {
			resolve(Array.prototype.slice.call(arguments, 1));
		}
	};
}

function promisify(fn, context, resultIsArray, Deferred){
	var getResult = resultIsArray ? arrayResult : smartResult;
	return function(){
		var args = Array.prototype.slice.call(arguments, 0);
		return new (Deferred && Deferred.Wrapper || Promise)(function(resolve, reject){
			args.push(getResult(resolve, reject));
			fn.apply(context, args);
		});
	};
}

module.exports = promisify;
