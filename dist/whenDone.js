(function(_,f){window.heya.async.whenDone=f(window.heya.async.Deferred);})
(["./Deferred"], function(Deferred){
	"use strict";

	return function whenDone(value, callback, errback, progback){
		var deferred;
		if(value instanceof Deferred.Promise){
			deferred = value;
		}else{
			deferred = new Deferred();
			deferred.resolve(value);
		}
		deferred.done(callback, errback, progback);
	};
});
