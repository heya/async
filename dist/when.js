(function(_,f){window.heya.async.when=f(window.heya.async.Deferred);})
(["./Deferred"], function(Deferred){
	"use strict";

	return function when(value, callback, errback, progback){
		var deferred;
		if(value instanceof Deferred.Promise){
			deferred = value;
		}else{
			deferred = new Deferred();
			deferred.resolve(value);
		}
		return arguments.length > 1 ? deferred.then(callback, errback, progback) : deferred;
	};
});
