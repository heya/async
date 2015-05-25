/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
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
